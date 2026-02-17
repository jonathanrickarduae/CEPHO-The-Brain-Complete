/**
 * Pagination & Limits Constants
 * 
 * Standard pagination, limits, and threshold values
 */

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;
export const DEFAULT_PAGE = 1;

// List limits
export const MAX_SEARCH_RESULTS = 100;
export const MAX_EXPORT_ROWS = 10000;
export const MAX_BATCH_SIZE = 1000;

// String length limits
export const MAX_NAME_LENGTH = 255;
export const MAX_EMAIL_LENGTH = 320;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_CONTENT_LENGTH = 10000;
export const MAX_URL_LENGTH = 2048;

// File size limits (in bytes)
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_MB = 25;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const RATE_LIMIT_AUTH_MAX_REQUESTS = 5;

// Retry limits
export const MAX_RETRY_ATTEMPTS = 3;
export const MAX_RETRY_ATTEMPTS_CRITICAL = 5;

// Score thresholds
export const MIN_SCORE = 0;
export const MAX_SCORE = 100;
export const PASSING_SCORE = 70;
export const EXCELLENT_SCORE = 90;

// Confidence thresholds
export const MIN_CONFIDENCE = 0.0;
export const MAX_CONFIDENCE = 1.0;
export const LOW_CONFIDENCE_THRESHOLD = 0.3;
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.6;
export const HIGH_CONFIDENCE_THRESHOLD = 0.8;

// Priority levels
export const PRIORITY_LOW = 1;
export const PRIORITY_MEDIUM = 2;
export const PRIORITY_HIGH = 3;
export const PRIORITY_CRITICAL = 4;

// Status counts
export const MAX_ACTIVE_SESSIONS = 5;
export const MAX_CONCURRENT_REQUESTS = 10;
export const MAX_QUEUE_SIZE = 1000;
