export interface ExtractedPage {
  pageNumber: number;
  text: string;
  charCount: number;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modDate?: string;
  pageCount: number;
  fileSize: number;
  fileName: string;
}

export interface ExtractionResult {
  success: boolean;
  metadata: PDFMetadata;
  pages: ExtractedPage[];
  fullText: string;
  totalCharacters: number;
  totalWords: number;
  /** Extraction duration in milliseconds. */
  extractionTime: number;
}
