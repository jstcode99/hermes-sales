export const ROUTES = {
  base: "/",
  auth: "/en/auth",
  login: "/en/login",
  otp: "/en/auth/otp",
  callback: "/en/auth/callback",
  dashboard: "/en/dashboard",
} as const;

export function getRoutes(keys: readonly (keyof typeof ROUTES)[]) {
  return keys.map((key) => ROUTES[key]);
}
