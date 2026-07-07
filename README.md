# Extracta — PDF Text Extractor

> A modern, minimal full-stack PDF text extractor built with **Node.js** and **TypeScript**.  
> Upload any PDF and instantly get clean, structured text — page by page.

**Created:** July 2024
---

## Features

| Feature | Description |
|---|---|
| Drag & Drop Upload | Drop a PDF or click to browse — up to 50 MB |
| Page-by-Page Extraction | View extracted text per page in a collapsible accordion |
| PDF Metadata | See title, author, creator, producer, page count, and file size |
| Copy to Clipboard | Copy all extracted text with one click |
| Download as .txt | Save extracted text as a plain text file |
| Dark Mode UI | Glassmorphism design with ambient gradient animations |
| Responsive | Works on desktop and mobile |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (v20+) |
| Language | TypeScript |
| Framework | Express.js v5 |
| PDF Parsing | `pdf-parse` (with built-in `pdfjs-dist`) |
| File Upload | `multer` |
| Dev Server | `ts-node-dev` |
| Frontend | Vanilla HTML + CSS + JavaScript |

---

## Project Structure

```
extracta/
├── src/
│   ├── index.ts              # Express server entry point
│   ├── config.ts             # Shared constants (paths, file size limit)
│   ├── routes/
│   │   └── pdf.routes.ts     # API routes for PDF upload & extraction
│   ├── services/
│   │   └── pdf.service.ts    # Core PDF parsing logic
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces & types
│   └── utils/
│       └── path.utils.ts     # Path validation & filename sanitisation
├── public/
│   ├── index.html            # Main UI page
│   ├── css/
│   │   ├── styles.css        # Entry point — imports all partials
│   │   ├── base.css          # Design tokens, reset & background blobs
│   │   ├── layout.css        # Header, main layout, hero & footer
│   │   ├── upload.css        # Dropzone, file info & extract button
│   │   ├── progress.css      # Progress bar & shimmer animation
│   │   ├── results.css       # Cards, metadata, actions & error toast
│   │   ├── accordion.css     # Page-by-page accordion component
│   │   └── utilities.css     # Responsive, focus-visible & selection
│   └── js/
│       ├── app.js            # Entry point — DOM refs, state & module wiring
│       ├── utils.js          # Pure utilities: formatBytes, formatNumber, el()
│       ├── fileHandler.js    # File selection, validation & drag-drop
│       ├── extractor.js      # Extraction fetch, progress & lifecycle
│       └── renderer.js       # Results rendering, accordion & UI actions
├── uploads/                  # Temp folder for uploaded PDFs (auto-cleaned)
├── dist/                     # Compiled JS output (generated on build)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v20** or higher
- npm (comes with Node.js)

### 1. Clone or Download

```bash
git clone <your-repo-url>
cd extracta
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development Mode

```bash
npm run dev
```

The server starts with hot-reload at **`http://localhost:3000`**

### 4. Build for Production

```bash
npm run build
```

### 5. Run Production Build

```bash
npm start
```

---

## 🔌 API Reference

### Health Check

```
GET /api/pdf/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "Extracta PDF API",
  "timestamp": "2026-06-13T14:00:00.000Z"
}
```

---

### Extract Text from PDF

```
POST /api/pdf/extract
Content-Type: multipart/form-data
```

**Form field:** `pdf` — the PDF file to upload (max 50 MB)

**Success Response:**
```json
{
  "success": true,
  "metadata": {
    "fileName": "example.pdf",
    "fileSize": 204800,
    "pageCount": 5,
    "title": "Annual Report",
    "author": "Jane Doe",
    "creator": "Microsoft Word",
    "producer": "Adobe PDF"
  },
  "pages": [
    {
      "pageNumber": 1,
      "text": "Introduction...",
      "charCount": 1234
    }
  ],
  "fullText": "Introduction...",
  "totalCharacters": 6200,
  "totalWords": 1100,
  "extractionTime": 342
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Only PDF files are allowed",
  "code": "INVALID_FILE_TYPE"
}
```

---

## NPM Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start dev server with hot reload |
| `build` | `npm run build` | Compile TypeScript → `dist/` |
| `start` | `npm start` | Run compiled production build |
| `clean` | `npm run clean` | Delete `dist/` folder |

---

## Configuration

| Setting | Default | Description |
|---|---|---|
| Port | `3000` | Set via `PORT` environment variable |
| Max file size | `50 MB` | Configured in `pdf.routes.ts` |
| Temp upload dir | `uploads/` | Auto-created, files deleted after extraction |

To change the port:
```bash
PORT=8080 npm run dev
```

---

## Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `NO_FILE` | 400 | No PDF was attached to the request |
| `INVALID_FILE_TYPE` | 415 | Uploaded file is not a PDF |
| `FILE_TOO_LARGE` | 413 | File exceeds the 50 MB limit |
| `EXTRACTION_FAILED` | 500 | PDF parsing encountered an error |
| `SERVER_ERROR` | 500 | Unexpected internal server error |

---

## Notes

- Uploaded PDF files are **automatically deleted** from the server after text extraction — nothing is stored.
- Image-based PDFs (scanned documents) without embedded text will return empty pages. OCR is not currently supported.
- The server handles `CORS` for all origins in development mode.

---

## License

MIT © Extracta
