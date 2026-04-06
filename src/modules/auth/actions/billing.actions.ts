"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { billingConfigSchema, switchPlanSchema } from "../schema/auth.schema";
import { CACHE_TAGS } from "@/config/constants";
import {
  getCompanyBillingConfig,
  getCompanySubscription,
  getAllPlans,
  getCompanyUsageStats,
} from "../services/company.service";

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

  // Build update object
  const updateObj: Record<string, unknown> = {};
  if (input.paymentMethods) updateObj.payment_methods = input.paymentMethods;
  if (input.taxName) updateObj.tax_name = input.taxName;
  if (input.taxRate !== undefined) updateObj.tax_rate = input.taxRate;
  if (input.taxDefault !== undefined) updateObj.tax_default = input.taxDefault;
  if (input.invoicePrefix) updateObj.invoice_prefix = input.invoicePrefix;
  if (input.invoiceSeries !== undefined) updateObj.invoice_series = input.invoiceSeries;
  if (input.invoiceAutoNumber !== undefined) updateObj.invoice_auto_number = input.invoiceAutoNumber;
  if (input.currency) updateObj.currency = input.currency;
  if (input.currencySymbol) updateObj.currency_symbol = input.currencySymbol;
  if (input.defaultNotes !== undefined) updateObj.default_notes = input.defaultNotes;

  const { error } = await supabase
    .from("billing_configs")
    .update(updateObj)
    .eq("company_id", input.companyId);

  if (error) throw new Error(error.message);

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

// Switch plan (simplified - just updates the company plan_id)
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

  // Update company plan
  const { error: companyError } = await supabase
    .from("companies")
    .update({ plan_id: input.planId })
    .eq("id", input.companyId);

  if (companyError) throw new Error(companyError.message);

  // Update or create subscription
  const existingSub = await getCompanySubscription(input.companyId);

  if (existingSub) {
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        plan_id: input.planId,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", input.companyId)
      .eq("status", "active");

    if (subError) throw new Error(subError.message);
  } else {
    const { error: subError } = await supabase.from("subscriptions").insert({
      company_id: input.companyId,
      plan_id: input.planId,
      status: "active",
      start_date: new Date().toISOString(),
    });

    if (subError) throw new Error(subError.message);
  }

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true };
}
