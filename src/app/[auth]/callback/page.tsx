import { redirect } from "next/navigation";
import { handleOAuthCallback } from "@modules/auth/actions/oauth.actions";

interface CallbackPageProps {
  searchParams: Promise<{ error?: string; code?: string }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const params = await searchParams;

  // Check for error in URL
  if (params.error) {
    console.error("OAuth error:", params.error);
    redirect("/signin?error=oauth_failed");
  }

  // Handle the OAuth callback
  try {
    await handleOAuthCallback();
  } catch (error) {
    console.error("Callback error:", error);
    redirect("/signin?error=callback_failed");
  }

  // If we reach here, redirect should have happened
  redirect("/dashboard");
}
