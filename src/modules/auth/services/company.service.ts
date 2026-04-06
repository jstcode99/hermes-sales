import { createAdminClient } from "@/lib/supabase/admin";

export interface CompanyWithPlan {
  id: string;
  name: string;
  slug: string;
  wildcard: string | null;
  logo_url: string | null;
  plan_id: string | null;
  plan_name?: string;
  plan_price?: number;
  is_active: boolean;
  created_at: string;
}

// Get company by ID
export async function getCompanyById(id: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*, plans(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Get company by slug
export async function getCompanyBySlug(slug: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*, plans(*)")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Get company by wildcard (subdomain)
export async function getCompanyByWildcard(wildcard: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*, plans(*)")
    .eq("wildcard", wildcard)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Get user's companies
export async function getUserCompanies(userId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("company_users")
    .select(`
      *,
      company:companies(*, plans(*))
    `)
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return data;
}

// Get active subscription for company
export async function getCompanySubscription(companyId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("company_id", companyId)
    .eq("status", "active")
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data;
}

// Check if user has access to company
export async function userHasCompanyAccess(userId: string, companyId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("company_users")
    .select("id")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .single();

  if (error) return false;
  return !!data;
}

// Get user's role in company
export async function getUserCompanyRole(
  userId: string,
  companyId: string
): Promise<string | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data?.role ?? null;
}

// Get company branches
export async function getCompanyBranches(companyId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("company_id", companyId)
    .eq("is_active", true)
    .order("is_main", { ascending: false })
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

// Get company billing config
export async function getCompanyBillingConfig(companyId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("billing_configs")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  return data;
}

// Get plan by ID
export async function getPlanById(id: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Get all plans
export async function getAllPlans() {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("price");

  if (error) throw new Error(error.message);
  return data;
}

// Get default plan
export async function getDefaultPlan() {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_default", true)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Get company members
export async function getCompanyMembers(companyId: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("company_users")
    .select(`
      *,
      user:auth.users!inner(email, raw_user_meta_data)
    `)
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return data;
}

// Check if company slug is available
export async function isCompanySlugAvailable(slug: string) {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error && error.code === "PGRST116") return true;
  if (error) throw new Error(error.message);
  return !data;
}

// Get subscription usage stats for a company
export async function getCompanyUsageStats(companyId: string) {
  const supabase = await createAdminClient();

  // Get current plan and limits
  const company = await getCompanyById(companyId);
  if (!company?.plan_id) {
    return null;
  }

  const plan = await getPlanById(company.plan_id);
  const limits = plan?.limits as Record<string, number> | null;

  // Get current usage counts
  const [userCount, branchCount] = await Promise.all([
    supabase
      .from("company_users")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_active", true)
      .then(({ count }) => count ?? 0),
    supabase
      .from("branches")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_active", true)
      .then(({ count }) => count ?? 0),
  ]);

  return {
    plan,
    limits: limits ?? {},
    usage: {
      users: userCount,
      branches: branchCount,
    },
    canAddUser: limits ? userCount < (limits.max_users ?? Infinity) : true,
    canAddBranch: limits ? branchCount < (limits.max_branches ?? Infinity) : true,
  };
}
