---
name: integrations
description: >
  Integrations with external services in HermesSales: Supabase Auth, Storage (real buckets),
  RLS, hCaptcha, Google OAuth, GitHub OAuth. Use when working with authentication,
  file uploads, RLS policies, maps, or any external service in the project.
---

# Integrations — HermesSales

## Supabase Clients — Which One to Use

| Context | Import | When |
|---|---|---|
| Server Components / Server Actions | `SupabaseServerClient()` from `@lib/server` | Normal server-side read/write |
| Admin operations (bypass RLS) | `SupabaseAdminClient()` from `@lib/server-admin` | Triggers, cross-tenant operations |
| Client Components | `createClientFromLib()` from `@lib/client` | Only for authenticated listeners on the client |
| Proxy server components | `@lib/proxy` | Server components with revalidation |

**Never initialize `createServerClient()` or `createBrowserClient()` directly.**

```typescript
// ✅ Server Action / Server Component
import { SupabaseServerClient } from “@lib/supabase/server”;
const supabase = await SupabaseServerClient();

// ✅ Admin (bypass RLS)
import { SupabaseAdminClient } from “@lib/supabase/server-admin”;
const supabase = await SupabaseAdminClient();
```

## Supabase Auth

```typescript
// Get current user on server (always use getUser, never getSession)
const { data: { user } } = await supabase.auth.getUser();

// Verify session in Server Action via sessionService
const { sessionService } = await modules(cookieStore);
const userId = await sessionService.getCurrentUserId();
if (!userId) throw new Error(“exception”);
```

### User Roles (cookies)
```typescript
const { cookiesService } = await module(cookieStore);

const role = await cookiesService.getProfileRole();
// “admin” | ‘seller’ | “client”

const realEstateId = await cookiesService.getCom();
```

Cookie names defined in `COOKIE_NAMES` in `@config/constants.ts`:
- `ROLE`: `“user_role”`
- `REAL_ESTATE`: `“real_estate_id”`
- `REAL_ESTATE_ROLE`: `“real_estate_role”`

## Supabase Storage — actual project buckets

```typescript
import { STORAGE_BUCKETS } from “@config/constants”;

// STORAGE_BUCKETS.AVATARS          = “avatars”
```

### upload files
```typescript
const supabase = await SupabaseServerClient();

const { data, error } = await supabase.storage
  .from(STORAGE_BUCKETS.SOME)
  .upload(`${some}/${id}/${fileName}`, file, {
    cacheControl: "3600",
    upsert: false,
  });

if (error) throw new Error(`Upload fallido: ${error.message}`);
```

### public URL
```typescript
const { data } = supabase.storage
  .from(STORAGE_BUCKETS.SOME)
  .getPublicUrl(`${some}/${id}/${fileName}`);

const url = data.publicUrl;
```

### delete file
```typescript
await supabase.storage
  .from(STORAGE_BUCKETS.SOME)
  .remove([`${some}/${id}/${fileName}`]);
```

### limit files (FILE_LIMITS de constants.ts)
```typescript
// FILE_LIMITS.AVATAR_MAX_SIZE   = 5MB
// FILE_LIMITS.LOGO_MAX_SIZE     = 2MB
// FILE_LIMITS.ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
```

## Google OAuth

```typescript
// modules/auth/components/google-auth.tsx
// Use @react-oauth/google
// Vars: NEXT_PUBLIC_GOOGLE_CLIENT_ID
// Callback from app/auth/callback/route.ts
```

## hCaptcha

```typescript
// modules/auth/components — sign-up and sign-in forms
// Uses @hcaptcha/react-hcaptcha
// Variable: NEXT_PUBLIC_HCAPTCHA_SITE_KEY
```

## Notifications (server)

```typescript
// infrastructure/notifications/notification.service.ts
// Used for internal system notifications
import { NotificationService } from “@modules/notifications/notification.service”;
```

## Integrating a new external service

1. Define the port in `@modules/services/<service>.services.ts`
3. Register it in `@modules/module.ts`
4. Credentials in `.env.local` (never hardcoded)
5. Access only from Server Actions — never from Client Components

## App routes (`@config/routes.ts`)

```typescript
import { createRouter } from “@/i18n/router”;

// On the server
const routes = createRouter();
routes.dashboard()
routes.properties()
routes.property(id)
routes.listings ()
routes.listing(id)
routes.realEstates()
routes.realEstate(id)
routes.users()
routes.profile()
// etc.

// On the client
import { useRoutes } from “@/i18n/client-router”;
const routes = useRoutes();
```
