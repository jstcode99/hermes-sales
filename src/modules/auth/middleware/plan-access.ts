"use server";

import { createClient } from "@/lib/supabase/server";
import { getCompanyUsageStats } from "../services/company.service";

export type PlanLimit = {
  maxUsers: number;
  maxBranches: number;
  maxProducts: number;
  maxInvoicesPerMonth: number;
};

// Plan limits map
export const PLAN_LIMITS: Record<string, PlanLimit> = {
  free: {
    maxUsers: 5,
    maxBranches: 2,
    maxProducts: 100,
    maxInvoicesPerMonth: 50,
  },
  pro: {
    maxUsers: 25,
    maxBranches: 10,
    maxProducts: 1000,
    maxInvoicesPerMonth: 500,
  },
};

// Check if company can perform action based on plan
export async function checkPlanLimit(
  companyId: string,
  limitType: keyof PlanLimit
): Promise<{ allowed: boolean; current: number; limit: number; planName: string }> {
  const stats = await getCompanyUsageStats(companyId);

  if (!stats) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      planName: "unknown",
    };
  }

  const planName = stats.plan?.name ?? "unknown";
  const limits = stats.limits as Record<string, number>;
  const currentUsage = stats.usage as Record<string, number>;

  // Map limit type to actual key in limits object
  const limitKeyMap: Record<keyof PlanLimit, string> = {
    maxUsers: "max_users",
    maxBranches: "max_branches",
    maxProducts: "max_products",
    maxInvoicesPerMonth: "max_invoices_per_month",
  };

  const limit = limits?.[limitKeyMap[limitType]] ?? 0;
  const current =
    currentUsage?.[limitType.replace("max", "").toLowerCase()] ?? 0;

  return {
    allowed: limit === 0 || current < limit,
    current,
    limit,
    planName,
  };
}

// Middleware to verify user has access to company
export async function requireCompanyAccess(companyId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: membership, error } = await supabase
    .from("company_users")
    .select("role, is_active")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .single();

  if (error || !membership) {
    throw new Error("Access denied to this company");
  }

  if (!membership.is_active) {
    throw new Error("Your access to this company has been deactivated");
  }

  return {
    userId: user.id,
    role: membership.role,
    companyId,
  };
}

// Middleware to verify user is owner or admin of company
export async function requireCompanyAdmin(companyId: string) {
  const access = await requireCompanyAccess(companyId);

  if (!["owner", "admin"].includes(access.role)) {
    throw new Error("Admin access required for this action");
  }

  return access;
}

// Middleware to verify user is owner of company
export async function requireCompanyOwner(companyId: string) {
  const access = await requireCompanyAccess(companyId);

  if (access.role !== "owner") {
    throw new Error("Owner access required for this action");
  }

  return access;
}

// Middleware to verify user has active subscription
export async function requireActiveSubscription(companyId: string) {
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("company_id", companyId)
    .eq("status", "active")
    .single();

  if (error || !subscription) {
    throw new Error("Active subscription required for this action");
  }

  return true;
}

// Middleware to check plan limits before performing action
export async function enforcePlanLimit(
  companyId: string,
  limitType: keyof PlanLimit
) {
  const result = await checkPlanLimit(companyId, limitType);

  if (!result.allowed) {
    const featureName = limitType.replace("max", "").toLowerCase();
    throw new Error(
      `Cannot add more ${featureName}. Your ${result.planName} plan allows ${result.limit} ${featureName}. Please upgrade your plan.`
    );
  }

  return result;
}
