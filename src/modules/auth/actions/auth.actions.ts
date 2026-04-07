"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signUpSchema, createCompanySchema, createBranchSchema } from "../schema/auth.schema";
import { CACHE_TAGS } from "@/config/constants";
import { ROUTES } from "@/config/routes";
import { getDefaultPlan, getCompanyBySlug } from "../services/company.service";

// Sign up new user with company
export async function signUpAction(formData: FormData) {
  const supabase = await createClient();

  const raw = Object.fromEntries(formData);
  const input = signUpSchema.parse(raw);

  // Check if user already exists
  const { data: { user: existingUser } } = await supabase.auth.getUser();

  if (existingUser) {
    throw new Error("User already authenticated");
  }

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        phone: input.phone,
      },
    },
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Failed to create user");

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    full_name: input.fullName,
    phone: input.phone,
    document_id: input.documentId,
    document_type: input.documentType,
    department_id: input.departmentId,
    municipality_id: input.municipalityId,
    referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    referred_by_code: input.referralCode || null,
  });

  if (profileError) throw new Error(profileError.message);

  // If company name provided, create company
  if (input.companyName) {
    const companyInput = createCompanySchema.parse({
      name: input.companyName,
    });

    const defaultPlan = await getDefaultPlan();

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: companyInput.name,
        slug: companyInput.slug,
        plan_id: defaultPlan?.id,
      })
      .select()
      .single();

    if (companyError) throw new Error(companyError.message);

    // Create main branch
    const { error: branchError } = await supabase.from("branches").insert({
      company_id: company.id,
      name: "Principal",
      slug: "principal",
      is_main: true,
    });

    if (branchError) throw new Error(branchError.message);

    // Link user to company as owner
    const { error: linkError } = await supabase.from("company_users").insert({
      user_id: authData.user.id,
      company_id: company.id,
      role: "owner",
      accepted_at: new Date().toISOString(),
    });

    if (linkError) throw new Error(linkError.message);

    // Create subscription
    const { error: subError } = await supabase.from("subscriptions").insert({
      company_id: company.id,
      plan_id: defaultPlan?.id,
      status: "active",
      start_date: new Date().toISOString(),
    });

    if (subError) console.error("Subscription error:", subError.message);
  }

  // If company was created, set onboarding_completed = false explicitly
  if (input.companyName && authData.user) {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: false })
      .eq("id", authData.user.id);
  }

  revalidatePath("/");
  revalidateTag(CACHE_TAGS.SESSION.CURRENT_USER, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.USER_ID, { expire: 0 });

  // Redirect to onboarding if company was created, otherwise to signin
  const result = {
    success: true as const,
    userId: authData.user.id,
  };
  
  if (input.companyName) {
    return { ...result, redirectTo: ROUTES.onboarding };
  }
  
  return result;
}

// Sign in existing user
export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  const adminClient = await createAdminClient();

  const raw = Object.fromEntries(formData);
  const input = signUpSchema.shape.email.parse(raw.email);
  const password = signUpSchema.shape.password.parse(raw.password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input,
    password,
  });

  if (error) throw new Error(error.message);

  // Check if user has a company
  const { data: membership } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  // If user has a company, check onboarding status
  let redirectTo: string = ROUTES.dashboard;
  
  if (membership) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", data.user.id)
      .single();

    // If onboarding not completed, redirect to onboarding
    if (profile && !profile.onboarding_completed) {
      redirectTo = ROUTES.onboarding;
    }
  } else {
    // No company - redirect to signup to create one
    redirectTo = ROUTES.signup;
  }

  revalidatePath("/");
  revalidateTag(CACHE_TAGS.SESSION.CURRENT_USER, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.USER_ID, { expire: 0 });

  return {
    success: true as const,
    userId: data.user.id,
    redirectTo,
  };
}

// Sign out
export async function signOutAction() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidateTag(CACHE_TAGS.SESSION.CURRENT_USER, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.USER_ID, { expire: 0 });

  return { success: true };
}

// Create new company for existing user
export async function createCompanyAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = createCompanySchema.parse(raw);

  const defaultPlan = await getDefaultPlan();

  const { data: company, error } = await supabase
    .from("companies")
    .insert({
      name: input.name,
      slug: input.slug,
      billing_name: input.billingName,
      billing_document: input.billingDocument,
      billing_document_type: input.billingDocumentType,
      billing_address: input.billingAddress,
      billing_email: input.billingEmail,
      billing_phone: input.billingPhone,
      plan_id: defaultPlan?.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Create main branch
  const { error: branchError } = await supabase.from("branches").insert({
    company_id: company.id,
    name: "Principal",
    slug: "principal",
    is_main: true,
  });

  if (branchError) throw new Error(branchError.message);

  // Link user to company as owner
  const { error: linkError } = await supabase.from("company_users").insert({
    user_id: user.id,
    company_id: company.id,
    role: "owner",
    accepted_at: new Date().toISOString(),
  });

  if (linkError) throw new Error(linkError.message);

  // Create subscription
  const { error: subError } = await supabase.from("subscriptions").insert({
    company_id: company.id,
    plan_id: defaultPlan?.id,
    status: "active",
    start_date: new Date().toISOString(),
  });

  if (subError) console.error("Subscription error:", subError.message);

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true, company };
}

// Create branch for company
export async function createBranchAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = createBranchSchema.parse(raw);

  // Verify user has access to company
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
    throw new Error("Insufficient permissions to create branches");
  }

  const { data: branch, error } = await supabase
    .from("branches")
    .insert({
      company_id: input.companyId,
      name: input.name,
      slug: input.slug || input.name.toLowerCase().replace(/\s+/g, "-"),
      address: input.address,
      phone: input.phone,
      email: input.email,
      is_main: input.isMain,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true, branch };
}
