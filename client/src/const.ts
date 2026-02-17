export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate Google OAuth login URL
export const getLoginUrl = () => {
  // Use Google OAuth for authentication
  return "/api/auth/google";
};
