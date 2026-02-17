/**
 * HTTP Constants
 * 
 * Standard HTTP status codes and headers
 */

// Success codes (2xx)
export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_ACCEPTED = 202;
export const HTTP_NO_CONTENT = 204;

// Redirection codes (3xx)
export const HTTP_MOVED_PERMANENTLY = 301;
export const HTTP_FOUND = 302;
export const HTTP_NOT_MODIFIED = 304;
export const HTTP_TEMPORARY_REDIRECT = 307;

// Client error codes (4xx)
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_METHOD_NOT_ALLOWED = 405;
export const HTTP_CONFLICT = 409;
export const HTTP_UNPROCESSABLE_ENTITY = 422;
export const HTTP_TOO_MANY_REQUESTS = 429;

// Server error codes (5xx)
export const HTTP_INTERNAL_SERVER_ERROR = 500;
export const HTTP_NOT_IMPLEMENTED = 501;
export const HTTP_BAD_GATEWAY = 502;
export const HTTP_SERVICE_UNAVAILABLE = 503;
export const HTTP_GATEWAY_TIMEOUT = 504;

// Common headers
export const HEADER_CONTENT_TYPE = 'Content-Type';
export const HEADER_AUTHORIZATION = 'Authorization';
export const HEADER_ACCEPT = 'Accept';
export const HEADER_USER_AGENT = 'User-Agent';
export const HEADER_CACHE_CONTROL = 'Cache-Control';
export const HEADER_SET_COOKIE = 'Set-Cookie';

// Content types
export const CONTENT_TYPE_JSON = 'application/json';
export const CONTENT_TYPE_HTML = 'text/html';
export const CONTENT_TYPE_TEXT = 'text/plain';
export const CONTENT_TYPE_PDF = 'application/pdf';
export const CONTENT_TYPE_FORM = 'application/x-www-form-urlencoded';
export const CONTENT_TYPE_MULTIPART = 'multipart/form-data';
