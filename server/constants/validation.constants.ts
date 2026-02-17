/**
 * Validation Constants
 * 
 * Common validation rules and patterns
 */

// Password requirements
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_REQUIRE_UPPERCASE = true;
export const PASSWORD_REQUIRE_LOWERCASE = true;
export const PASSWORD_REQUIRE_NUMBER = true;
export const PASSWORD_REQUIRE_SPECIAL = true;

// Username requirements
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;

// Email validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_EMAIL_LOCAL_PART = 64;
export const MAX_EMAIL_DOMAIN_PART = 255;

// Phone validation
export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
export const MIN_PHONE_LENGTH = 10;
export const MAX_PHONE_LENGTH = 15;

// URL validation
export const URL_REGEX = /^https?:\/\/.+/;
export const SECURE_URL_REGEX = /^https:\/\/.+/;

// Numeric ranges
export const MIN_AGE = 0;
export const MAX_AGE = 150;
export const MIN_PERCENTAGE = 0;
export const MAX_PERCENTAGE = 100;

// Text content
export const MIN_TITLE_LENGTH = 1;
export const MAX_TITLE_LENGTH = 200;
export const MIN_DESCRIPTION_LENGTH = 0;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MIN_CONTENT_LENGTH = 0;
export const MAX_CONTENT_LENGTH = 50000;

// Array sizes
export const MIN_ARRAY_LENGTH = 0;
export const MAX_ARRAY_LENGTH = 1000;
export const MAX_TAGS = 10;
export const MAX_CATEGORIES = 5;

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
export const ALLOWED_SPREADSHEET_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

// File extensions
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];
export const ALLOWED_SPREADSHEET_EXTENSIONS = ['.xls', '.xlsx', '.csv'];
