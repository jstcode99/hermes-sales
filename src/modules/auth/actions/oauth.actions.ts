"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CACHE_TAGS } from "@/config/constants";
import { getDefaultPlan } from "../services/company.service";

// Sign in with Google
export async function signInWithGoogleAction(credential: string) {
  const supabase = await createClient();

  // Exchange Google credential for Supabase session
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: credential,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No user data received");
  }

  // Check if user has a profile, if not create one
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    // Get user info from the ID token claims
    const userMeta = data.user.user_metadata;

    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: userMeta?.full_name || userMeta?.name || "User",
      phone: userMeta?.phone || "",
      document_id: "",
      document_type: "cc",
      referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    });
  }

  revalidateTag(CACHE_TAGS.SESSION.CURRENT_USER, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.USER_ID, { expire: 0 });

  redirect("/dashboard");
}

// Sign up with Google (creates company if needed)
export async function signUpWithGoogleAction(
  credential: string,
  companyName?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: credential,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No user data received");
  }

  // Get user info from metadata
  const userMeta = data.user.user_metadata;

  // Create profile if doesn't exist
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!existingProfile) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: userMeta?.full_name || userMeta?.name || "User",
      phone: userMeta?.phone || "",
      document_id: "",
      document_type: "cc",
      referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    });
  }

  // Create company if name provided
  if (companyName) {
    const defaultPlan = await getDefaultPlan();

    const { data: company } = await supabase
      .from("companies")
      .insert({
        name: companyName,
        plan_id: defaultPlan?.id,
      })
      .select()
      .single();

    if (company) {
      // Create main branch
      await supabase.from("branches").insert({
        company_id: company.id,
        name: "Principal",
        slug: "principal",
        is_main: true,
      });

      // Link user as owner
      await supabase.from("company_users").insert({
        user_id: data.user.id,
        company_id: company.id,
        role: "owner",
        accepted_at: new Date().toISOString(),
      });

      // Create subscription
      await supabase.from("subscriptions").insert({
        company_id: company.id,
        plan_id: defaultPlan?.id,
        status: "active",
        start_date: new Date().toISOString(),
      });
    }
  }

  revalidateTag(CACHE_TAGS.SESSION.CURRENT_USER, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.USER_ID, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  redirect("/dashboard");
}

// Sign in with GitHub - redirects to GitHub OAuth
export async function signInWithGithubAction() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }

  throw new Error("No redirect URL received");
}

// Handle OAuth callback
export async function handleOAuthCallback() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication failed");
  }

  // Check/create profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const userMeta = user.user_metadata;

    await supabase.from("profiles").insert({
      id: user.id,
      full_name: userMeta?.full_name || userMeta?.name || "User",
      phone: userMeta?.phone || "",
      document_id: "",
      document_type: "cc",
      referral_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    });
  }

  revalidateTag(CACHE_TAGS.SESSION.CURRENT_USER, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.USER_ID, { expire: 0 });
  revalidateTag(CACHE_TAGS.SESSION.COMPANIES, { expire: 0 });

  redirect("/dashboard");
}
