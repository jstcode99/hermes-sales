import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-xl p-8">
        {children}
      </div>
    </div>
  );
}
