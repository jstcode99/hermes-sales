export const ROUTES = {
  base: "/",
  auth: "/auth",
  signin: "/signin",
  signup: "/signup",
  callback: "/auth/callback",
  dashboard: "/dashboard",
} as const;

export function getRoutes(keys: readonly (keyof typeof ROUTES)[]) {
  return keys.map((key) => ROUTES[key]);
}
