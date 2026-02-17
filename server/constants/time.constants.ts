/**
 * Time Constants
 * 
 * Centralized time-related constants to avoid magic numbers
 */

// Milliseconds
export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
export const ONE_WEEK_MS = 7 * ONE_DAY_MS;
export const ONE_MONTH_MS = 30 * ONE_DAY_MS;
export const ONE_YEAR_MS = 365 * ONE_DAY_MS;

// Seconds
export const ONE_MINUTE_SEC = 60;
export const ONE_HOUR_SEC = 60 * ONE_MINUTE_SEC;
export const ONE_DAY_SEC = 24 * ONE_HOUR_SEC;
export const ONE_WEEK_SEC = 7 * ONE_DAY_SEC;

// Common durations in milliseconds
export const FIVE_SECONDS_MS = 5 * ONE_SECOND_MS;
export const TEN_SECONDS_MS = 10 * ONE_SECOND_MS;
export const THIRTY_SECONDS_MS = 30 * ONE_SECOND_MS;
export const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS;
export const TEN_MINUTES_MS = 10 * ONE_MINUTE_MS;
export const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;
export const THIRTY_MINUTES_MS = 30 * ONE_MINUTE_MS;

// Session/Token expiry
export const SESSION_EXPIRY_MS = ONE_YEAR_MS;
export const TOKEN_EXPIRY_MS = ONE_HOUR_MS;
export const REFRESH_TOKEN_EXPIRY_MS = 30 * ONE_DAY_MS;
export const COOKIE_MAX_AGE_MS = ONE_YEAR_MS;

// Cache TTL
export const CACHE_SHORT_TTL_MS = FIVE_MINUTES_MS;
export const CACHE_MEDIUM_TTL_MS = ONE_HOUR_MS;
export const CACHE_LONG_TTL_MS = ONE_DAY_MS;

// Retry delays
export const RETRY_DELAY_SHORT_MS = ONE_SECOND_MS;
export const RETRY_DELAY_MEDIUM_MS = FIVE_SECONDS_MS;
export const RETRY_DELAY_LONG_MS = TEN_SECONDS_MS;

// Timeouts
export const REQUEST_TIMEOUT_MS = THIRTY_SECONDS_MS;
export const DB_QUERY_TIMEOUT_MS = TEN_SECONDS_MS;
export const API_TIMEOUT_MS = THIRTY_SECONDS_MS;
