import path from 'path';
import { UPLOADS_DIR } from '../config';

/**
 * Validates that a resolved file path is strictly within UPLOADS_DIR.
 * Uses path.normalize to neutralise any traversal sequences (e.g. '..').
 *
 * @returns The normalised path if valid; null if outside the allowed directory.
 */
export function validateUploadPath(filePath: string): string | null {
  const normalised = path.normalize(filePath);
  const boundary = UPLOADS_DIR + path.sep;
  return normalised.startsWith(boundary) || normalised === UPLOADS_DIR
    ? normalised
    : null;
}

/**
 * Strips path separators, parent-directory sequences, and null bytes from a
 * user-supplied filename so it is safe to reflect in metadata or logs.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/\0/g, '')
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .trim();
}
