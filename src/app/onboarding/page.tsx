import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/modules/onboarding/components/onboarding-wizard";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Setup Your Company | HermesSales",
  description: "Complete your company setup wizard",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(ROUTES.signin);
  }

  // Check if onboarding is already completed
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  // If already completed, redirect to dashboard
  if (profile?.onboarding_completed) {
    redirect(ROUTES.dashboard);
  }

  // Check if user has a company
  const { data: membership } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!membership) {
    // User has no company, redirect to signup to create one
    redirect(ROUTES.signup);
  }

  return <OnboardingWizard userId={user.id} />;
}
