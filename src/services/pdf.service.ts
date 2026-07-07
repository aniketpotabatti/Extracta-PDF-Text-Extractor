import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import type { ExtractedPage, PDFMetadata, ExtractionResult } from '../types';
import { UPLOADS_DIR } from '../config';
import { validateUploadPath, sanitizeFilename } from '../utils/path.utils';

/** Coerce an empty/falsy info field to undefined for cleaner optional fields. */
function infoField(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Extract text from a PDF file using the pdf-parse OOP API.
 * Returns structured per-page data plus document metadata.
 */
export async function extractTextFromPDF(
  filePath: string,
  originalName: string,
  fileSize: number,
): Promise<ExtractionResult> {
  const startTime = Date.now();
  const dataBuffer = await fs.readFile(filePath);

  const parser = new PDFParse({ data: dataBuffer });
  const textResult = await parser.getText();
  const infoResult = await parser.getInfo();
  await parser.destroy().catch(() => {/* destroy is best-effort */ });

  const pages: ExtractedPage[] = textResult.pages.map((p) => {
    const text = (p.text ?? '').trim();
    return { pageNumber: p.num, text, charCount: text.length };
  });

  const info = infoResult.info ?? {};
  const fullText = pages.map((p) => p.text).join('\n\n');
  const totalWords = fullText.split(/\s+/).filter(Boolean).length;

  const metadata: PDFMetadata = {
    title: infoField(info.Title),
    author: infoField(info.Author),
    subject: infoField(info.Subject),
    creator: infoField(info.Creator),
    producer: infoField(info.Producer),
    creationDate: infoField(info.CreationDate),
    modDate: infoField(info.ModDate),
    pageCount: textResult.total,
    fileSize,
    fileName: sanitizeFilename(originalName),
  };

  return {
    success: true,
    metadata,
    pages,
    fullText,
    totalCharacters: fullText.length,
    totalWords,
    extractionTime: Date.now() - startTime,
  };
}

/**
 * Deletes a temp upload file only if it is safely inside UPLOADS_DIR.
 * Silently skips files outside the boundary to prevent accidental deletion.
 */
export async function cleanupFile(filePath: string): Promise<void> {
  const safePath = validateUploadPath(filePath);
  if (!safePath) {
    console.error('Security: cleanup refused for path outside uploadsDir:', filePath);
    return;
  }
  await fs.unlink(safePath).catch((err: NodeJS.ErrnoException) => {
    if (err.code !== 'ENOENT') console.error('Failed to cleanup file:', err);
  });
}

// Re-export so callers that previously imported from this module keep working.
export { UPLOADS_DIR };
