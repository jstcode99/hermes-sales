import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CACHE_TAGS } from "@/config/constants";

// Type definitions
interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_name?: string;
  billing_document?: string;
  billing_document_type?: string;
  billing_address?: string;
  billing_email?: string;
  billing_phone?: string;
  plan_id?: string;
}

interface Branch {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  is_main: boolean;
}

interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface Invitation {
  id: string;
  email: string;
  company_id: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  invited_by?: string;
  created_at: string;
}

// Get company details with billing
export async function getCompanyWithBilling(companyId: string) {
  const supabase = await createClient();
  
  const { data: company, error } = await supabase
    .from("companies")
    .select(`
      *,
      billing_configs (*)
    `)
    .eq("id", companyId)
    .single();

  if (error) throw new Error(error.message);
  return company as Company & { billing_configs: any };
}

// Get company branches
export async function getCompanyBranches(companyId: string) {
  const supabase = await createClient();
  
  const { data: branches, error } = await supabase
    .from("branches")
    .select("*")
    .eq("company_id", companyId)
    .order("is_main", { ascending: false });

  if (error) throw new Error(error.message);
  return branches as Branch[];
}

// Get company members
export async function getCompanyMembers(companyId: string) {
  const supabase = await createClient();
  
  const { data: members, error } = await supabase
    .from("company_users")
    .select(`
      *,
      user:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
  return members as (CompanyUser & { user: Pick<Profile, "id" | "email" | "full_name" | "avatar_url"> })[];
}

// Get pending invitations
export async function getPendingInvitations(companyId: string) {
  const supabase = await createClient();
  
  const { data: invitations, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("company_id", companyId)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString());

  if (error) throw new Error(error.message);
  return invitations as Invitation[];
}

// Get plan limits
export async function getPlanLimits(planId: string) {
  const supabase = await createAdminClient();
  
  const { data: plan, error } = await supabase
    .from("plans")
    .select("branch_limit, user_limit")
    .eq("id", planId)
    .single();

  if (error) throw new Error(error.message);
  return { branchLimit: plan?.branch_limit ?? 1, userLimit: plan?.user_limit ?? 5 };
}

// Check if user has completed onboarding
export async function checkOnboardingStatus(userId: string) {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }
  
  return profile?.onboarding_completed ?? false;
}

// Get user's primary company
export async function getUserPrimaryCompany(userId: string) {
  const supabase = await createClient();
  
  const { data: membership, error } = await supabase
    .from("company_users")
    .select(`
      company_id,
      role,
      company:companies (
        id,
        name,
        slug,
        plan_id
      )
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  
  return {
    companyId: membership.company_id,
    role: membership.role,
    company: membership.company,
  };
}
