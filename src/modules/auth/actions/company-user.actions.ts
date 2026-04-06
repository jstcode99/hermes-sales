"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { inviteUserSchema, updateUserRoleSchema } from "../schema/auth.schema";
import { CACHE_TAGS } from "@/config/constants";
import { getCompanyMembers, userHasCompanyAccess, getUserCompanyRole } from "../services/company.service";

// Invite user to company
export async function inviteUserAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = inviteUserSchema.parse(raw);

  // Verify inviter is owner
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
    throw new Error("Only company owners can invite users");
  }

  // Check if user already exists in auth
  const { data: existingUser } = await supabase.auth.admin.listUsers();

  const inviteData = {
    company_id: input.companyId,
    role: input.role,
    branch_id: input.branchId,
    invited_by: user.id,
    invited_at: new Date().toISOString(),
  };

  // Try to find existing user by email
  const existingTargetUser = existingUser?.users.find(
    (u) => u.email?.toLowerCase() === input.email.toLowerCase()
  );

  if (existingTargetUser) {
    // Link existing user to company
    const { error: linkError } = await supabase.from("company_users").insert({
      user_id: existingTargetUser.id,
      ...inviteData,
    });

    if (linkError) {
      if (linkError.code === "23505") {
        throw new Error("User already belongs to this company");
      }
      throw new Error(linkError.message);
    }
  } else {
    // Create invitation (would need invitation tokens in real implementation)
    // For now, we'll skip this and rely on user registration flow
    throw new Error("User not found. They must register first.");
  }

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true };
}

// Update user role in company
export async function updateUserRoleAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  const raw = Object.fromEntries(formData);
  const input = updateUserRoleSchema.parse(raw);

  // Verify requester is owner
  const { data: requesterMembership, error: checkError } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("company_id", input.companyId)
    .eq("is_active", true)
    .single();

  if (checkError || !requesterMembership) {
    throw new Error("Access denied to this company");
  }

  if (requesterMembership.role !== "owner") {
    throw new Error("Only company owners can update user roles");
  }

  // Cannot change owner role
  const { data: targetMembership } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", input.userId)
    .eq("company_id", input.companyId)
    .single();

  if (targetMembership?.role === "owner") {
    throw new Error("Cannot change owner role");
  }

  // Update user membership
  const updateObj: Record<string, unknown> = {
    role: input.role,
  };

  if (input.isActive !== undefined) {
    updateObj.is_active = input.isActive;
  }

  const { error } = await supabase
    .from("company_users")
    .update(updateObj)
    .eq("user_id", input.userId)
    .eq("company_id", input.companyId);

  if (error) throw new Error(error.message);

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true };
}

// Remove user from company
export async function removeUserFromCompanyAction(
  userId: string,
  companyId: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required");

  // Verify requester is owner
  const { data: requesterMembership, error: checkError } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .eq("is_active", true)
    .single();

  if (checkError || !requesterMembership) {
    throw new Error("Access denied to this company");
  }

  if (requesterMembership.role !== "owner") {
    throw new Error("Only company owners can remove users");
  }

  // Cannot remove owner
  const { data: targetMembership } = await supabase
    .from("company_users")
    .select("role")
    .eq("user_id", userId)
    .eq("company_id", companyId)
    .single();

  if (targetMembership?.role === "owner") {
    throw new Error("Cannot remove company owner");
  }

  // Deactivate membership
  const { error } = await supabase
    .from("company_users")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("company_id", companyId);

  if (error) throw new Error(error.message);

  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  return { success: true };
}

// Get company members
export async function getCompanyMembersAction(companyId: string) {
  const { data: { user } } = await createClient().then((s) => s.auth.getUser());

  if (!user) throw new Error("Authentication required");

  const hasAccess = await userHasCompanyAccess(user.id, companyId);
  if (!hasAccess) {
    throw new Error("Access denied to this company");
  }

  const members = await getCompanyMembers(companyId);
  return members;
}
