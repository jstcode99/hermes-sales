"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { companyProfileSchema, branchSchema, inviteSchema, completeOnboardingSchema } from "../schema/onboarding.schema";
import { CACHE_TAGS } from "@/config/constants";
import { STORAGE_BUCKETS, FILE_LIMITS } from "@/config/constants";

// ============ Step 1: Company Profile Actions ============

export async function updateCompanyProfileAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = companyProfileSchema.parse(raw);

  // Update company
  const { error: companyError } = await supabase
    .from("companies")
    .update({
      email: input.email,
      phone: input.phone,
      address: input.address,
      billing_name: input.billingName,
      billing_document: input.billingDocument,
      billing_document_type: input.billingDocumentType,
      billing_address: input.billingAddress,
      billing_email: input.billingEmail,
      billing_phone: input.billingPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.companyId);

  if (companyError) throw new Error(companyError.message);

  // Update or create billing config
  const { data: existingConfig } = await supabase
    .from("billing_configs")
    .select("id")
    .eq("company_id", input.companyId)
    .single();

  if (existingConfig) {
    await supabase
      .from("billing_configs")
      .update({
        tax_name: "IVA",
        tax_rate: 19,
      })
      .eq("company_id", input.companyId);
  } else {
    await supabase
      .from("billing_configs")
      .insert({
        company_id: input.companyId,
        tax_name: "IVA",
        tax_rate: 19,
      });
  }

  revalidateTag(CACHE_TAGS.COMPANIES.DETAIL(input.companyId), { expire: 0 });
  revalidateTag(CACHE_TAGS.BILLING.BY_COMPANY(input.companyId), { expire: 0 });

  return { success: true };
}

export async function uploadCompanyLogoAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const companyId = formData.get("companyId") as string;
  const file = formData.get("logo") as File;

  if (!file || !companyId) {
    throw new Error("Company ID and logo file are required");
  }

  // Validate file type
  if (!FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed");
  }

  // Validate file size
  if (file.size > FILE_LIMITS.LOGO_MAX_SIZE) {
    throw new Error("File size exceeds 2MB limit");
  }

  // Upload to Supabase Storage
  const fileName = `logo-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
  
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.COMPANY_LOGOS)
    .upload(`${companyId}/${fileName}`, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS.COMPANY_LOGOS)
    .getPublicUrl(`${companyId}/${fileName}`);

  // Update company with logo URL
  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_url: urlData.publicUrl })
    .eq("id", companyId);

  if (updateError) throw new Error(updateError.message);

  revalidateTag(CACHE_TAGS.COMPANIES.DETAIL(companyId), { expire: 0 });

  return { success: true, logoUrl: urlData.publicUrl };
}

// ============ Step 2: Branches Actions ============

export async function createBranchAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = branchSchema.parse(raw);

  // Verify permissions
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

  // Check plan limits
  const { data: company } = await supabase
    .from("companies")
    .select("plan_id")
    .eq("id", input.companyId)
    .single();

  const { data: plan } = await supabase
    .from("plans")
    .select("branch_limit")
    .eq("id", company?.plan_id)
    .single();

  const { data: branchCount } = await supabase
    .from("branches")
    .select("id", { count: "exact" })
    .eq("company_id", input.companyId)
    .single();

  if (branchCount && plan && branchCount >= plan.branch_limit) {
    throw new Error(`Branch limit reached. Your plan allows ${plan.branch_limit} branches`);
  }

  // Create branch
  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  
  const { data: branch, error } = await supabase
    .from("branches")
    .insert({
      company_id: input.companyId,
      name: input.name,
      slug,
      address: input.address,
      phone: input.phone,
      email: input.email,
      is_main: input.isMain,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If this is set as main, update other branches
  if (input.isMain) {
    await supabase
      .from("branches")
      .update({ is_main: false })
      .eq("company_id", input.companyId)
      .neq("id", branch.id);
  }

  revalidateTag(CACHE_TAGS.BRANCHES.BY_COMPANY(input.companyId), { expire: 0 });

  return { success: true, branch };
}

export async function updateBranchAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const branchId = formData.get("branchId") as string;
  const companyId = formData.get("companyId") as string;
  
  // Extract other fields
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key !== "branchId" && key !== "companyId") {
      data[key] = value;
    }
  });

  // Verify permissions
  const { data: membership, error: checkError } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .single();

  if (checkError || !membership) {
    throw new Error("Access denied to this company");
  }

  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Insufficient permissions to update branches");
  }

  // Update branch
  const { error } = await supabase
    .from("branches")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", branchId);

  if (error) throw new Error(error.message);

  revalidateTag(CACHE_TAGS.BRANCHES.BY_COMPANY(companyId), { expire: 0 });

  return { success: true };
}

export async function setMainBranchAction(branchId: string, companyId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  // Verify permissions
  const { data: membership, error: checkError } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .single();

  if (checkError || !membership) {
    throw new Error("Access denied to this company");
  }

  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Insufficient permissions");
  }

  // Set this branch as main
  await supabase
    .from("branches")
    .update({ is_main: true })
    .eq("id", branchId);

  // Unset other branches
  await supabase
    .from("branches")
    .update({ is_main: false })
    .eq("company_id", companyId)
    .neq("id", branchId);

  revalidateTag(CACHE_TAGS.BRANCHES.BY_COMPANY(companyId), { expire: 0 });

  return { success: true };
}

// ============ Step 3: Invite Team Actions ============

export async function inviteUserAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = inviteSchema.parse(raw);

  // Verify permissions
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
    throw new Error("Insufficient permissions to invite users");
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from("company_users")
    .select("id")
    .eq("company_id", input.companyId)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    throw new Error("User is already a member of this company");
  }

  // Check if invitation already exists
  const { data: existingInvite } = await supabase
    .from("invitations")
    .select("id")
    .eq("company_id", input.companyId)
    .eq("email", input.email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existingInvite) {
    throw new Error("An invitation has already been sent to this email");
  }

  // Generate token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // Create invitation
  const { error } = await supabase
    .from("invitations")
    .insert({
      email: input.email,
      company_id: input.companyId,
      role: input.role,
      token,
      expires_at: expiresAt,
      invited_by: user.id,
    });

  if (error) throw new Error(error.message);

  // TODO: Send invitation email with magic link

  return { success: true, token };
}

export async function cancelInvitationAction(invitationId: string, companyId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  // Verify permissions
  const { data: membership, error: checkError } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .single();

  if (checkError || !membership) {
    throw new Error("Access denied to this company");
  }

  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Insufficient permissions");
  }

  // Delete invitation
  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitationId);

  if (error) throw new Error(error.message);

  return { success: true };
}

// ============ Step 4: Complete Onboarding Actions ============

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = completeOnboardingSchema.parse(raw);

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidateTag(CACHE_TAGS.SESSION.CURRENT_USER, { expire: 0 });

  return { success: true, redirect: "/dashboard" };
}

// ============ Progress Actions ============

export async function getOnboardingProgressAction(userId: string) {
  const supabase = await createClient();
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return {
    completed: profile?.onboarding_completed ?? false,
  };
}
