export const ROUTES = {
  base: "/",
  auth: "/auth",
  signin: "/signin",
  signup: "/signup",
  callback: "/auth/callback",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  settings: "/settings",
  profile: "/profile",
  invoices: "/invoices",
  reports: "/reports",
  analytics: "/analytics",
  export: "/export",
  advanced: "/advanced",
  branches: "/branches",
  products: "/products",
  customers: "/customers",
  sales: "/sales",
  plans: "/plans",
} as const;

// Routes that require Pro plan
export const PRO_ROUTES = [
  ROUTES.invoices,
  ROUTES.reports,
  ROUTES.analytics,
  ROUTES.export,
  ROUTES.advanced,
] as const;

// Routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.dashboard,
  ROUTES.settings,
  ROUTES.profile,
  ROUTES.invoices,
  ROUTES.reports,
  ROUTES.analytics,
  ROUTES.export,
  ROUTES.advanced,
  ROUTES.branches,
  ROUTES.products,
  ROUTES.customers,
  ROUTES.sales,
] as const;

/**
 * Check if a route is protected (requires authentication)
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if a route requires Pro plan
 */
export function isProRoute(pathname: string): boolean {
  return PRO_ROUTES.some((route) => pathname.startsWith(route));
}

export function getRoutes(keys: readonly (keyof typeof ROUTES)[]) {
  return keys.map((key) => ROUTES[key]);
}