import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export const metadata = {
  title: "Dashboard | HermesSales",
  description: "Your sales management dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(ROUTES.signin);
  }

  // Check if onboarding is completed
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .single();

  // If onboarding not completed, redirect to onboarding
  if (profile && !profile.onboarding_completed) {
    redirect(ROUTES.onboarding);
  }

  // Get user's company
  const { data: membership } = await supabase
    .from("company_users")
    .select(`
      role,
      company:companies (
        name,
        slug
      )
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  // Handle company being array or object
  const companyData = membership?.company;
  const companyArray = Array.isArray(companyData) ? companyData : companyData ? [companyData] : [];
  const companyName = companyArray[0]?.name || "Your Company";
  const userName = profile?.full_name || "User";

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome{userName ? `, ${userName}` : ""}!
        </p>
        
        {membership && (
          <div className="mt-8 rounded-lg border p-6">
            <h2 className="text-xl font-semibold">{companyName}</h2>
            <p className="text-sm text-muted-foreground">
              Your role: <span className="font-medium capitalize">{membership.role}</span>
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Sales</h3>
            <p className="text-sm text-muted-foreground">Manage your sales</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Invoices</h3>
            <p className="text-sm text-muted-foreground">View and create invoices</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Products</h3>
            <p className="text-sm text-muted-foreground">Manage your catalog</p>
          </div>
        </div>
      </div>
    </div>
  );
}
