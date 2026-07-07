import path from 'path';

/**
 * Absolute path to the temporary uploads directory.
 * Defined once here and imported by both the route and service layers.
 */
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Absolute path to the static frontend assets directory.
 */
export const PUBLIC_DIR = path.join(process.cwd(), 'public');

/** Maximum allowed upload size in bytes (50 MB). */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
