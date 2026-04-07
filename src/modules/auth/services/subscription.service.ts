import { createAdminClient } from "@/lib/supabase/admin";

export interface SubscriptionWithPlan {
  id: string;
  company_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  plans: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    is_active: boolean;
    is_default: boolean;
    features: Record<string, boolean> | null;
    limits: Record<string, number> | null;
  } | null;
}

export interface PlanInfo {
  id: string;
  name: string;
  slug: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  isPro: boolean;
}

// Routes that require Pro plan - from config (kept for reference)
const PRO_ROUTES = [
  "/invoices",
  "/reports",
  "/analytics",
  "/export",
  "/advanced",
];

// Routes that are allowed for Free plan

/**
 * Get active subscription for a company
 * Returns subscription with plan details
 */
export async function getCompanySubscription(companyId: string): Promise<SubscriptionWithPlan | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("company_id", companyId)
    .eq("status", "active")
    .lte("start_date", new Date().toISOString())
    .or("end_date.is.null,end_date.gte." + new Date().toISOString())
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error.message);
    return null;
  }

  return data;
}

/**
 * Get user's active company subscription
 * Uses user's company membership to find subscription
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionWithPlan | null> {
  const supabase = await createAdminClient();

  // Get user's company
  const { data: companyUser, error: cuError } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (cuError || !companyUser) {
    return null;
  }

  return getCompanySubscription(companyUser.company_id);
}

/**
 * Get plan info from subscription
 */
export function getPlanInfo(subscription: SubscriptionWithPlan | null): PlanInfo {
  if (!subscription?.plans) {
    return {
      id: "",
      name: "Free",
      slug: "free",
      features: {},
      limits: {
        max_users: 5,
        max_branches: 2,
        max_products: 100,
        max_invoices_per_month: 50,
      },
      isPro: false,
    };
  }

  const plan = subscription.plans;
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    features: plan.features ?? {},
    limits: plan.limits ?? {},
    isPro: plan.slug === "pro" || plan.price > 0,
  };
}

/**
 * Check if user can access a route based on their plan
 */
export function canAccessRoute(pathname: string, planInfo: PlanInfo): boolean {
  // Check if route is Pro-only
  const isProRoute = PRO_ROUTES.some((route) => pathname.startsWith(route));

  // If it's a Pro route and user is not Pro, deny access
  if (isProRoute && !planInfo.isPro) {
    return false;
  }

  // All other routes are allowed
  return true;
}

/**
 * Check if user's plan has a specific feature
 */
export function hasFeature(planInfo: PlanInfo, feature: string): boolean {
  return planInfo.features[feature] === true;
}

/**
 * Check if user's plan allows a specific limit
 */
export function checkLimit(planInfo: PlanInfo, limitType: string, currentUsage: number): {
  allowed: boolean;
  limit: number;
  remaining: number;
} {
  const limit = planInfo.limits[limitType] ?? 0;
  
  // If no limit (0) or unlimited (-1), allow
  if (limit === 0 || limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }

  const remaining = limit - currentUsage;
  return {
    allowed: currentUsage < limit,
    limit,
    remaining: Math.max(0, remaining),
  };
}