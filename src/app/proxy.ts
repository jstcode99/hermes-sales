import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserCompanies } from "@/modules/companies";
import { getCompanySubscription, getPlanInfo } from "@/modules/subscriptions";
import {
  ROUTES,
  isProtectedRoute,
  isProRoute,
} from "@/config/routes";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle root redirect to dashboard
  const isBase = request.nextUrl.pathname === ROUTES.base;
  if (isBase) {
    const redirectUrl = new URL(ROUTES.dashboard, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check for static assets and API routes - skip middleware
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.includes(".") // files with extensions
  ) {
    return response;
  }

  // Define route types using routes config
  const isAuthRoute =
    request.nextUrl.pathname.startsWith(ROUTES.auth) ||
    request.nextUrl.pathname === ROUTES.signin ||
    request.nextUrl.pathname === ROUTES.signup ||
    request.nextUrl.pathname === ROUTES.callback;

  const isProtected = isProtectedRoute(request.nextUrl.pathname);

  // If user is not authenticated and trying to access protected route
  if (!user && isProtected) {
    const redirectUrl = new URL(ROUTES.signin, request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth routes or root, redirect to dashboard
  if (user && (isAuthRoute || isBase)) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  // If user is authenticated, check plan access for protected routes
  if (user && isProtected) {
    // Get user's companies to find their subscription
    const companies = await getUserCompanies(user.id);
    
    if (companies && companies.length > 0) {
      // Get first company's subscription
      const companyId = companies[0].company_id;
      const subscription = await getCompanySubscription(companyId);
      const planInfo = getPlanInfo(subscription);
      const pathname = request.nextUrl.pathname;

      // Check if trying to access Pro-only route with Free plan
      if (isProRoute(pathname) && !planInfo.isPro) {
        // Redirect to upgrade page
        const redirectUrl = new URL(ROUTES.plans, request.url);
        redirectUrl.searchParams.set("upgrade", "required");
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};