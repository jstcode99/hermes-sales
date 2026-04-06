"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user as User | null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  return { user, isLoading, signOut };
}

interface CompanyMembership {
  company_id: string;
  role: string;
  is_active: boolean;
}

interface UseCompanyReturn {
  companies: CompanyMembership[];
  currentCompany: CompanyMembership | null;
  setCurrentCompany: (companyId: string) => void;
  isLoading: boolean;
}

export function useCompany(): UseCompanyReturn {
  const [companies, setCompanies] = useState<CompanyMembership[]>([]);
  const [currentCompany, setCurrentCompanyState] = useState<CompanyMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const setCurrentCompany = useCallback((companyId: string) => {
    const company = companies.find((c) => c.company_id === companyId);
    if (company) {
      setCurrentCompanyState(company);
      if (typeof window !== "undefined") {
        localStorage.setItem("current_company_id", companyId);
      }
    }
  }, [companies]);

  useEffect(() => {
    if (!user) {
      // No user - no companies to fetch, keep initial state
      return;
    }

    let cancelled = false;

    const fetchCompanies = async () => {
      const supabase = createBrowserClient();
      
      const { data, error } = await supabase
        .from("company_users")
        .select("company_id, role, is_active")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (cancelled) return;

      if (error) {
        console.error("Error fetching companies:", error);
        return;
      }

      setCompanies(data || []);
      
      // Try to restore current company from localStorage
      if (typeof window !== "undefined") {
        const savedCompanyId = localStorage.getItem("current_company_id");
        if (savedCompanyId) {
          const saved = data?.find((c) => c.company_id === savedCompanyId);
          if (saved) {
            setCurrentCompanyState(saved);
          }
        }
      }
    };

    fetchCompanies();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Update isLoading based on whether user exists - this is a derived state pattern
  // isLoading stays true while we wait for the effect to complete
  // Once user is known (null or present), effect will have run

  return { companies, currentCompany, setCurrentCompany, isLoading };
}

interface UseSessionReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useSession(): UseSessionReturn {
  const { user, isLoading } = useAuth();
  return {
    isAuthenticated: !!user,
    isLoading,
  };
}
