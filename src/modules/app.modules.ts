import { cookies } from "next/headers";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CACHE_TAGS, COOKIE_NAMES, COOKIE_OPTIONS } from "@/config/constants";

// ==========================================
// Cookies Service
// ==========================================

export interface CookiesService {
  getCompanyId(): Promise<string | null>;
  setCompanyId(companyId: string): Promise<void>;
  getRole(): Promise<string | null>;
  setRole(role: string): Promise<void>;
  getAll(): Record<string, string>;
}

class CookiesServiceImpl implements CookiesService {
  async getCompanyId(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAMES.COMPANY);
    return cookie?.value || null;
  }

  async setCompanyId(companyId: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.COMPANY, companyId, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  async getRole(): Promise<string | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAMES.ROLE);
    return cookie?.value || null;
  }

  async setRole(role: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.ROLE, role, COOKIE_OPTIONS);
  }

  getAll(): Record<string, string> {
    // This is a sync method that can be used in middleware
    // For async access, use the async methods above
    return {}; // Middleware handles this differently
  }
}

// ==========================================
// Session Service
// ==========================================

export interface SessionService {
  getCurrentUserId(): Promise<string | null>;
  getCurrentUser(): Promise<unknown>;
  getUserCompanies(): Promise<Array<{ company_id: string; role: string }>>;
}

class SessionServiceImpl implements SessionService {
  async getCurrentUserId(): Promise<string | null> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  async getCurrentUser(): Promise<unknown | null> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  async getUserCompanies(): Promise<Array<{ company_id: string; role: string }>> {
    const userId = await this.getCurrentUserId();
    if (!userId) return [];

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("company_users")
      .select("company_id, role")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching user companies:", error);
      return [];
    }

    return data || [];
  }
}

// ==========================================
// Auth Service
// ==========================================

export interface AuthService {
  signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<{ userId: string; session?: unknown }>;
  signIn(email: string, password: string): Promise<{ userId: string }>;
  signOut(): Promise<void>;
  verifyEmail(email: string): Promise<boolean>;
}

class AuthServiceImpl implements AuthService {
  async signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<{ userId: string; session?: unknown }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Failed to create user");

    return {
      userId: data.user.id,
      session: data.session,
    };
  }

  async signIn(email: string, password: string): Promise<{ userId: string }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Failed to sign in");

    return { userId: data.user.id };
  }

  async signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  async verifyEmail(email: string): Promise<boolean> {
    const supabase = await createAdminClient();
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error || !users) return false;
    const user = users.find((u) => u.email === email);
    return user?.email_confirmed_at !== null;
  }
}

// ==========================================
// Module Factory
// ==========================================

export type AppModule = "cookies" | "session" | "auth";

export function getModules(): AppModules {
  return {
    cookiesService: new CookiesServiceImpl(),
    sessionService: new SessionServiceImpl(),
    authService: new AuthServiceImpl(),
  };
}

export interface AppModules {
  cookiesService: CookiesService;
  sessionService: SessionService;
  authService: AuthService;
}
