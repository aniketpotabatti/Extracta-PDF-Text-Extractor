import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import crypto from 'crypto';
import { extractTextFromPDF, cleanupFile } from '../services/pdf.service';
import { UPLOADS_DIR, MAX_FILE_SIZE } from '../config';
import { validateUploadPath } from '../utils/path.utils';

const router = Router();

// Ensure uploads directory exists at startup.
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── Multer configuration ────────────────────────────────────────────────────
// Filenames are generated from a cryptographic UUID — user-supplied names are
// never used in path construction, eliminating path-traversal via filename.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, _file, cb) => cb(null, `${crypto.randomUUID()}.pdf`),
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new Error('Only PDF files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// ── Routes ──────────────────────────────────────────────────────────────────

/** GET /api/pdf/health */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Extracta PDF API', timestamp: new Date().toISOString() });
});

/** POST /api/pdf/extract — Upload a PDF, receive extracted text + metadata. */
router.post('/extract', upload.single('pdf'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No PDF file uploaded. Please attach a file with field name "pdf".', code: 'NO_FILE' });
    return;
  }

  const safeFilePath = validateUploadPath(req.file.path);
  if (!safeFilePath) {
    console.error('Security: rejected upload path outside uploadsDir:', req.file.path);
    res.status(400).json({ success: false, error: 'Invalid file path detected. Upload rejected.', code: 'INVALID_PATH' });
    return;
  }

  try {
    const result = await extractTextFromPDF(safeFilePath, req.file.originalname, req.file.size);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to extract text from PDF';
    console.error('Extraction error:', err);
    res.status(500).json({ success: false, error: message, code: 'EXTRACTION_FAILED' });
  } finally {
    await cleanupFile(safeFilePath);
  }
});

// ── Multer error handler ────────────────────────────────────────────────────
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const isFileTooLarge = err.code === 'LIMIT_FILE_SIZE';
    res.status(isFileTooLarge ? 413 : 400).json({
      success: false,
      error:   isFileTooLarge ? 'File too large. Maximum size is 50 MB.' : err.message,
      code:    isFileTooLarge ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
    });
  } else if (err instanceof Error && err.message === 'Only PDF files are allowed') {
    res.status(415).json({ success: false, error: err.message, code: 'INVALID_FILE_TYPE' });
  } else {
    res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

export default router;
