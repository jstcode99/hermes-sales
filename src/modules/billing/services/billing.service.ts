import { createAdminClient } from "@/lib/supabase/admin";

// ==========================================
// Types
// ==========================================

export interface BillingConfig {
  id: string;
  company_id: string;
  payment_methods: {
    cash: boolean;
    transfer: boolean;
    card: boolean;
  } | null;
  tax_name: string | null;
  tax_rate: number | null;
  tax_default: boolean | null;
  invoice_prefix: string | null;
  invoice_series: string | null;
  invoice_auto_number: boolean | null;
  currency: string | null;
  currency_symbol: string | null;
  default_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Billing Queries
// ==========================================

// Get company billing config
export async function getBillingConfig(companyId: string): Promise<BillingConfig | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("billing_configs")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching billing config:", error.message);
    return null;
  }

  return data;
}

// Update billing config
export async function updateBillingConfig(
  companyId: string,
  updates: Partial<{
    paymentMethods: { cash: boolean; transfer: boolean; card: boolean };
    taxName: string;
    taxRate: number;
    taxDefault: boolean;
    invoicePrefix: string;
    invoiceSeries: string;
    invoiceAutoNumber: boolean;
    currency: string;
    currencySymbol: string;
    defaultNotes: string;
  }>
): Promise<void> {
  const supabase = await createAdminClient();

  const updateObj: Record<string, unknown> = {};
  if (updates.paymentMethods) updateObj.payment_methods = updates.paymentMethods;
  if (updates.taxName) updateObj.tax_name = updates.taxName;
  if (updates.taxRate !== undefined) updateObj.tax_rate = updates.taxRate;
  if (updates.taxDefault !== undefined) updateObj.tax_default = updates.taxDefault;
  if (updates.invoicePrefix) updateObj.invoice_prefix = updates.invoicePrefix;
  if (updates.invoiceSeries !== undefined) updateObj.invoice_series = updates.invoiceSeries;
  if (updates.invoiceAutoNumber !== undefined) updateObj.invoice_auto_number = updates.invoiceAutoNumber;
  if (updates.currency) updateObj.currency = updates.currency;
  if (updates.currencySymbol) updateObj.currency_symbol = updates.currencySymbol;
  if (updates.defaultNotes !== undefined) updateObj.default_notes = updates.defaultNotes;

  const { error } = await supabase
    .from("billing_configs")
    .update(updateObj)
    .eq("company_id", companyId);

  if (error) throw new Error(error.message);
}

// ==========================================
// Plan Switching
// ==========================================

// Switch company plan
export async function switchCompanyPlan(
  companyId: string,
  planId: string
): Promise<void> {
  const supabase = await createAdminClient();

  // Update company plan
  const { error: companyError } = await supabase
    .from("companies")
    .update({ plan_id: planId })
    .eq("id", companyId);

  if (companyError) throw new Error(companyError.message);

  // Update or create subscription
  const { data: existingSub, error: subFindError } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("company_id", companyId)
    .eq("status", "active")
    .single();

  if (subFindError && subFindError.code !== "PGRST116") {
    throw new Error(subFindError.message);
  }

  if (existingSub) {
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({
        plan_id: planId,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId)
      .eq("status", "active");

    if (subError) throw new Error(subError.message);
  } else {
    const { error: subError } = await supabase.from("subscriptions").insert({
      company_id: companyId,
      plan_id: planId,
      status: "active",
      start_date: new Date().toISOString(),
    });

    if (subError) throw new Error(subError.message);
  }
}
