"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { billingConfigSchema, switchPlanSchema } from "../schemas/billing.schema";
import { CACHE_TAGS } from "@/config/constants";
import {
  getBillingConfig,
  updateBillingConfig,
  switchCompanyPlan,
} from "../services/billing.service";
import {
  getCompanySubscription,
  getAllPlans,
  getCompanyUsageStats,
} from "@modules/subscriptions";

// ==========================================
// Billing Actions
// ==========================================

// Update billing config
export async function updateBillingConfigAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = billingConfigSchema.parse(raw);

  // Verify user is owner/admin of company
  const { data: membership, error: checkError } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("company_id", input.companyId)
    .eq("is_active", true)
    .single();

  if (checkError || !membership) {
    throw new Error("Access denied to this company");
  }

  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Insufficient permissions to update billing");
  }

  // Update billing config using service
  await updateBillingConfig(input.companyId, {
    paymentMethods: input.paymentMethods,
    taxName: input.taxName,
    taxRate: input.taxRate,
    taxDefault: input.taxDefault,
    invoicePrefix: input.invoicePrefix,
    invoiceSeries: input.invoiceSeries,
    invoiceAutoNumber: input.invoiceAutoNumber,
    currency: input.currency,
    currencySymbol: input.currencySymbol,
    defaultNotes: input.defaultNotes,
  });

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true };
}

// Get available plans
export async function getPlansAction() {
  const plans = await getAllPlans();
  return plans;
}

// Get company subscription status
export async function getSubscriptionStatusAction(companyId: string) {
  const subscription = await getCompanySubscription(companyId);
  return subscription;
}

// Get company usage stats
export async function getUsageStatsAction(companyId: string) {
  const stats = await getCompanyUsageStats(companyId);
  return stats;
}

// Switch plan
export async function switchPlanAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = switchPlanSchema.parse(raw);

  // Verify user is owner of company
  const { data: membership, error: checkError } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("company_id", input.companyId)
    .eq("is_active", true)
    .single();

  if (checkError || !membership) {
    throw new Error("Access denied to this company");
  }

  if (membership.role !== "owner") {
    throw new Error("Only company owners can switch plans");
  }

  // Get usage stats to check limits
  const stats = await getCompanyUsageStats(input.companyId);
  const newPlan = await getAllPlans().then((plans) =>
    plans.find((p) => p.id === input.planId)
  );

  if (!newPlan) {
    throw new Error("Plan not found");
  }

  const newLimits = newPlan.limits as Record<string, number> | null;
  const newLimitsParsed = newLimits ?? {};

  // Check if current usage exceeds new plan limits
  if (stats?.usage && newLimitsParsed) {
    if (
      newLimitsParsed.max_users &&
      stats.usage.users > newLimitsParsed.max_users
    ) {
      throw new Error(
        `Cannot switch to this plan: you have ${stats.usage.users} users but the plan only allows ${newLimitsParsed.max_users}`
      );
    }
    if (
      newLimitsParsed.max_branches &&
      stats.usage.branches > newLimitsParsed.max_branches
    ) {
      throw new Error(
        `Cannot switch to this plan: you have ${stats.usage.branches} branches but the plan only allows ${newLimitsParsed.max_branches}`
      );
    }
  }

  // Switch plan using service
  await switchCompanyPlan(input.companyId, input.planId);

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true };
}
