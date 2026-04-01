---
name: code-conventions
description: >
  Project code conventions — TypeScript, Server Actions, React,
  forms, hooks, cache. ALWAYS refer to this when writing or reviewing any
  TypeScript/React file in the project, or when a user asks how to implement something.
---

# Code Conventions — Modular Architecture

## Server Actions

Every action resides in `src/modules/<domain>/actions.ts` with this exact structure:

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@supabase/server";
import { someSchema } from "@modules/<module>/schemas/some.schema";

export async function createModuleAction(formData: FormData) {
  const supabase = await createClient();
  const routes = createRouter();

  const raw = Object.fromEntries(formData);
  const input = someSchema.parse(raw);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("exception");

  const { error } = await supabase
    .from("my_entities")
    .insert({ ...input, user_id: user.id });

  if (error) throw new Error(error.message);

 revalidatePath(routes.module());
 // if neccesary 
 revalidateTag(CACHE_TAGS.MODULE.ALL, { expire: 0 });
}
```

**Action rules:**
- Always include `“use server”` at the beginning of the file
- Instantiate the Supabase client **inside** the action using `createClient()` — never pass it as a parameter
- Validate using Zod (`.parse()` automatically throws an error if there is one) using the schema from the same module (`./schema`)
- Verify auth with `supabase.auth.getUser()` when the operation requires it
- Revalidate paths with `revalidatePath` and/or tags with `revalidateTag`
- No intermediate layers: the action calls Supabase **directly**, not a service or adapter
- Kebab-case for file names `some-one.<ext>`

## Services — Read queries

All read/query functions are located in `src/modules/<domain>/services/some.service.ts`:

```typescript
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// without cache — for directly reads or data that changed so much
export async function getMyEntityById(id: string) {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from("my_entities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("exception");
  return data;
}

// With cache — for Server Components that read stable data
export const getCachedMyEntities = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("my_entities")
      .select("*");

    if (error) throw new Error("exceptions");
    return data;
  },
  [CACHE_TAGS.SOME.THING()],
  { revalidate: 300, tags: [CACHE_TAGS.SOME, CACHE_TAGS.SOME.KEY] },
);
```

**Service rules:**
- Read-only (`select`) — writes always go in `actions.ts`
- Instantiate `createClient()` **inside** each function — not at the module level
- Expose two variants when applicable: direct function + `getCached*` with `unstable_cache`
- Import the client from `@lib/supabase/server` — never the browser client

## schemas Zod

```typescript
import { z } from "zod";
import i18next from "i18next";
const { t } = i18next;

export const someSchema = z.object({
  name: z.string().min(
    0,
    t("schemas:min.numeric", {
      attribute: "built_area",
      min: "0",
    }),
  ).max(100),
  description: z.string().optional(),
});

export type someInput = z.infer<typeof someSchema>;

export const defaultSomeValues: someInput = {
  name: "",
  description: "",
};
```

**Schema Rules:**
- Use **Zod** (not Yup) — `.parse()` to validate in actions, `safeParse()` when you want to handle the error manually
- The schema is the **true source** of types: always use `z.infer<typeof schema>` instead of manual types
- One `schema.ts` file per module — if it gets too large, split it into `schema/<name>.schema.ts` files within the module
- Actions and hooks in the same module import it using `“./schema”` (relative)

## Forms in Client Components

Using `react-hook-form` with `zodResolver` and components from `@components/ui/form`:

```typescript
"use client";

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@components/ui/field"
import { Input } from "@components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@components/ui/input-group"
import { moduleSchema, ModuleInput, defaultModuleValues } from "@modules/<module>/schemas/some.schema";
import { createModuleAction } from "@modules/<module>/actions/some.action";

export function MyEntityForm() {
  const form = useForm<MyEntityInput>({
    resolver: zodResolver(moduleSchema),
    defaultValues: defaultModuleValues,
    mode: "onBlur",
  });

  async function onSubmit(data: MyEntityInput) {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));

    try {
      await createMyEntityAction(formData);
      toast.success("messages");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    }
  }

  return (
  <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
    <FieldGroup>
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-demo-title">
              Bug Title
            </FieldLabel>
            <Input
              {...field}
              id="form-rhf-demo-title"
              aria-invalid={fieldState.invalid}
              placeholder="Login button not working on mobile"
              autoComplete="off"
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-demo-description">
              Description
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id="form-rhf-demo-description"
                placeholder="Im having an issue with the login button on mobile."
                rows={6}
                className="min-h-24 resize-none"
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                  {field.value.length}/100 characters
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              Include steps to reproduce, expected behavior, and what
              actually happened.
            </FieldDescription>
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />
    </FieldGroup>
  </form>
  );
}
```

**Form Rules:**
- Always use `zodResolver` — never `yupResolver`
- Import the schema and types from `“../schema”` (same module, relative)
- Call the action directly — without intermediate wrapper hooks
- `mode: “onBlur”` by default for validation
- Split large forms into sections with `<Form.Set>`

## TypeScript

- **No `any`** — except when typing raw Supabase rows before casting
- **`interface` for props and component contracts**, `type` for unions and aliases
- **No `React.FC`** — regular functions with prop destructuring
- **Path aliases `@`** always — never relative paths that go up more than one level (`../../`)
- Group imports: external libraries → internal `@` → module-relative (`./`)

```typescript
// ✅ Props
interface MyComponentProps {
  entity: MyEntityInput;
  onSave?: () => void;
}

export function MyComponent({ entity, onSave }: MyComponentProps) { ... }

// ❌ Not do it
const MyComponent: React.FC<Props> = ...
```

## React / Next.js

- **Server Components by default** — `“use client”` is only used for: state hooks, event handlers, `useState`, `useEffect`, and browser APIs
- Pages in `@app/<route>/page.tsx` import **directly** from the corresponding module
- There is no container layer between the page and the module

```typescript
// ✅ Server Component — calls the module's service directly
import { getCachedMyEntities } from “@modules/<module>/services/some.service.ts”;
import { MyEntityList } from “@modules/<module>/components/my-entity-list”;

export default async function MyEntitiesPage() {
  const entities = await getCachedMyEntities();
  return <MyEntityList entities={entities} />;
}

// ✅ Client Component — only when there is interactivity
“use client”;
import { SomeForm } from “@modules/<module>/components/some-form”;

export default function page() {
  return <SomeForm />;
}
```

## Icons and Images

- Icons: `@iconify/react` → `<Icon icon="mdi:home" />` or `@tabler/icons-react`
- Images: `next/image` with `fill` or explicit dimensions — never `<img>`

## Styles

- **Tailwind CSS** — utility classes in JSX
- `cn()` from `@lib/utils` for conditional classes
- Variants with `cva` (class-variance-authority) in components with multiple states
- `framer-motion` for animations

## File Naming

| Type | Convention | Example |
|---|---|---|
| schema + types | `schema.ts` | `@modules/<module>/schema/some.schema.ts` |
| Queries (reads) | `services.ts` | `@modules/<module>/services/some.service.ts` |
| Mutations | `actions.ts` | `@modules/<module>/actions/some.action.ts` |
| Client hooks | `hooks.ts` | `@modules/<module>/hooks/some.hook.ts` |
| Component | `kebab-case.tsx` | `ticket-form.tsx` |
| Global hook | `use-<name>.ts` | `hooks/use-mobile.ts` |
| Supabase client | `client.ts / server.ts / admin.ts` | `@lib/supabase/server.ts` |
