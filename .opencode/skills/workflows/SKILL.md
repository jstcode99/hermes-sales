---
name: workflows
description: >
  HermesSales project workflows: local development, Supabase migrations,
  cache tags, testing with Vitest, deployment. Use when asking about commands, migrations,
  cache, tests, or any task in the development cycle.
---

# Workflows — HermesSales

## Project Commands

```bash
# Development
bun dev                        # Next.js dev server
bun build                      # production build
bun lint                       # ESLint

# Testing
bun test                       # Vitest watch mode
bun test:run                   # a run (CI)
bun test:watch                 # explicit watch
bun test:coverage              # with coverage

# Local Supabase
bun supabase:start             # Starts Docker + local Supabase
bun supabase:stop              # Stops Supabase
bun supabase:status            # Service status
bun supabase:reset             # Full reset of local DB
bun supabase:migration:new     # Create new migration

# Supabase production
bun supabase:db:push           # apply migrations to production
bun supabase:gen:types         # generate types → types/supabase.ts

# TypeScript
bun tsc --noEmit               # type check without compiling
```

## Database Migrations

```bash
# 1. Create migration
bun supabase:migration:new descriptive-name
# → supabase/migrations/<timestamp>_descriptive-name.sql

# 2. Write the SQL

# 3. Apply locally
bun supabase:reset

# 4. Regenerate types
bun supabase:gen:types
# → types/supabase.ts

# 5. Apply to production
bun supabase:db:push
```

### Migration Template

NEVER A SINGLE MIGRATION; ALWAYS SEPARATE BY ENTITY

1. create_table_<entity>.sql
2. rls_table_<entity>.sql
3. enums_table_<entity>.sql
4. othe_table_<entity>.sql

```sql
-- Table with RLS
CREATE TABLE IF NOT EXISTS public.my_table (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  some_id uuid NOT NULL REFERENCES public.some(id) ON DELETE CASCADE,
  name          text NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Define policies
CREATE POLICY “some policy”
  ON public.my_table FOR ALL
  USING (
    id IN (
    SELECT id FROM public.some_agents
      WHERE id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_my_table_some ON public.some(some_fk_id);
CREATE INDEX IF NOT EXISTS idx_some_created_at ON public.some(created_at DESC);
```

## Cache — CACHE_TAGS

All tags are in `@config/constants.ts`. **Always** use constants, never raw strings. If you create a feature with a new entity, document it in the constants:

```typescript
// In Server Actions — invalidate on mutation
revalidateTag(CACHE_TAGS.SOME.ALL, { expire: 0 });
revalidateTag(CACHE_TAGS.SOME.DETAIL(id), { expire: 0 });
revalidateTag(CACHE_TAGS.SOME.PRINCIPAL, { expire: 0 });

//example:
revalidateTag(CACHE_TAGS.SOME.PRINCIPAL, { expire: 0 });
revalidateTag(CACHE_TAGS.SOME.BY_REAL_ESTATE(real_estate_id), { expire: 0 });

// In Services — read with cache
unstable_cache(fn, CACHE_TAGS.KEY.SOME() | CACHE_TAGS.KEY.SOME, { revalidate: 300, tags: [CACHE_TAGS.SOME, CACHE_TAGS.SOME] })

//example: 
  getCachedById(id: string) {
    return unstable_cache(
      async () => this.service.findById(id),
      [CACHE_TAGS.SOME. KEYS.BY_ID(id)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.SOME.PRINCIPAL, CACHE_TAGS.SOME.DETAIL(id)],
      },
    )();
  }
```

Current tags: `

`.

**When adding a new entity**, add its tags to `constants.ts`:
```typescript
SOME: {
  PRINCIPAL: “some”,
  ALL: “some:all”,
  COUNT: “some-count”,
  DETAIL: (id: string) => `some:${id}`,
  KEYS: {
    ALL: (filter?: object) =>
      filter ? `some:all:${JSON.stringify(filter)}` : “some:all”,
      BY_ID: (id: string) => `some:${id}`
  }
},
```

## Testing

### Stack
- **Vitest 2** + **Testing Library** for unit/integration
- **Playwright** for E2E

### Pattern — domain services (priority)

```typescript
// __tests__/modules/services/my-entity.service.test.ts
import { describe, it, expect, vi, beforeEach } from “vitest”;
import { SomeService } from “@modules/services/my-entity.service”;

describe(“SomeService”, () => {
  let service: SomeService;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      // ...all methods of the port
    };
    service = new SomeService(mockRepo);
  });

  it(“creates entity correctly”, async () => {
    vi.mocked(mockRepo.create).mockResolvedValue({ id: “1”, name: “Test” });
    const result = await service.create({ name: “Test” });
    expect(result.name).toBe(“Test”);
    expect(mockRepo.create).toHaveBeenCalledWith({ name: “Test” });
  });
});
```

### Pattern — React Components

```typescript
// __tests__/features/my-feature/my-component.test.tsx
import { render, screen } from “@testing-library/react”;
import userEvent from “@testing-library/user-event”;

it(“shows error if field is empty”, async () => {
  render(<MyForm />);
  await userEvent.click(screen.getByRole(“button”, { name: /save/i }));
  expect(screen.getByText(/required/i)).toBeInTheDocument();
});
```

Setup in `__tests__/setup/components.tsx` — check for provider wrappers.

### What NOT to test directly
- Supabase adapters (test the service with a port mock)
- Server Actions directly
- Next.js page components

## Issue management

**Linear only** — never GitHub Issues or other boards.
See the `linear-planning` skill (`.opencode/skills/linear-planning/`) for the full workflow.

## Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # server-side only

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# hCaptcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## Pre-commit checklist

- [ ] `bun tsc --noEmit` runs without errors
- [ ] `bun test:run` passes
- [ ] `bun lint` with no new warnings
- [ ] If there were schema changes: migration created and types regenerated
- [ ] Cache tags invalidated in the corresponding actions
- [ ] No new `any` in TypeScript
