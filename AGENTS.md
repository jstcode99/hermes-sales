# Hermes Sales — Claude Code Context

The **Hermes Sales** system is a responsive web platform designed for online sales management and electronic invoicing

## Stack

- **Next.js 16** App Router, React 19, strict TypeScript
- **Supabase** — auth, PostgreSQL with RLS, Storage
- **Modules/DDD** — app → app.modules → modules
- **Tailwind CSS** + shadcn/ui + Radix UI
- **Zod** (validation), **react-hook-form**, **Vitest** (tests)
- **bun**

## Available Agents

- `@task-orchestrator` — routes requests to the correct agent
- `@builder` — implements Linear features and issues end-to-end
- `@implementation-tester` — validates using Vitest, type checks, and project patterns
- `@linear-planning-agent` — creates and manages issues in Linear (never GitHub Issues)
- `@linear-planning-agent` — creates and manages issues in Linear (never GitHub Issues)


## Development Cycle
 
```
“create issue_id”
    │
    ▼
@issue-starter ── creates worktree + branch + Linear: In Progress
    │
    ▼
@builder ── implements in worktree with granular semantic commits
    │
    ▼
@implementation-tester ── type check + tests + patterns
    │ NEEDS FIXES → back to @builder
    │ APPROVED
    ▼
@pr-manager (Phase 1) ── push + create PR + Linear: In Review
    │
    ▼
[you review the PR on GitHub — Dokploy preview active]
    │
    ▼ “approved” / “merge issue_id”
@pr-manager (Phase 2) ── squash merge + Linear: Done + delete worktree
```
 
## Available Skills

Skills are loaded on demand using the `skill` tool.

| Skill | When to use it |
|---|---|
| `accessibility` | Audit and improve web accessibility following WCAG 2.2 guidelines. Use when asked to "improve accessibility", "a11y audit", "WCAG compliance", "screen reader support", "keyboard navigation", or "make accessible". |
| `architecture` | Actual project architecture — Modular with Next.js App Router. ALWAYS use this when creating new modules, routes, components, or when a user asks where to place a file or how to organize new code. |
| `Bun` | Use when building, running, testing, or bundling JavaScript/TypeScript applications. Reach for Bun when you need to execute scripts, manage packages, run tests, or bundle code for production. Bun is a drop-in replacement for Node.js with integrated package manager, test runner, and bundler. |
| `code-conventions` | Project code conventions — TypeScript, Server Actions, React, forms, hooks, cache. ALWAYS refer to this when writing or reviewing any TypeScript/React file in the project, or when a user asks how to implement something. |
| `frontend-design` | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics. |
| `git-workflow` | Git workflow for the hermes-sales project — issue-based worktrees, granular semantic commits, PRs via the GitHub CLI, and merge squashes. Always use this when working with branches, worktrees, commits, or PRs. |
| `integrations` | Integrations with external services in HermesSales: Supabase Auth, Storage (real buckets), RLS, hCaptcha, Google OAuth, GitHub OAuth. Use when working with authentication, file uploads, RLS policies, maps, or any external service in the project. |
| `linear` | Use this skill whenever the user wants to connect with linear, by MCP. |
| `next-best-practices` | Next.js best practices - file conventions, RSC boundaries, data patterns, async APIs, metadata, error handling, route handlers, image/font optimization, bundling |
| `next-cache-components` | Next.js 16 Cache Components - PPR, use cache directive, cacheLife, cacheTag, updateTag |
| `next-upgrade` | Upgrade Next.js to the latest version following official migration guides and codemods |
| `nodejs-backend-patterns` | Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures. |
| `nodejs-best-practices` | Node.js development principles and decision-making. Framework selection, async patterns, security, and architecture. Teaches thinking, not copying. |
| `seo` | Optimize for search engine visibility and ranking. Use when asked to "improve SEO", "optimize for search", "fix meta tags", "add structured data", "sitemap optimization", or "search engine optimization". |
| `shadcn` | Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file. Also triggers for "shadcn init", "create an app with --preset", or "switch to --preset". |
| `supabase-postgres-best-practices` | Postgres performance optimization and best practices from Supabase. Use this skill when writing, reviewing, or optimizing Postgres queries, schema designs, or database configurations. |
| `tailwind-css-patterns` | Provides comprehensive Tailwind CSS utility-first styling patterns including responsive design, layout utilities, flexbox, grid, spacing, typography, colors, and modern CSS best practices. Use when styling React/Vue/Svelte components, building responsive layouts, implementing design systems, or optimizing CSS workflow. |
| `tailwind-v4-shadcn` | Production-tested setup for Tailwind CSS v4 with shadcn/ui, Vite, and React. Use when: initializing React projects with Tailwind v4, setting up shadcn/ui, implementing dark mode, debugging CSS variable issues, fixing theme switching, migrating from Tailwind v3, or encountering color/theming problems. Covers: @theme inline pattern, CSS variable architecture, dark mode with ThemeProvider, component composition, vite.config setup, common v4 gotchas, and production-tested patterns. |
| `typescript-advanced-types` | Master TypeScript's advanced type system including generics, conditional types, mapped types, template literals, and utility types for building type-safe applications. Use when implementing complex type logic, creating reusable type utilities, or ensuring compile-time type safety in TypeScript projects. |
| `vercel-composition-patterns` | React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes. |
| `vercel-react-best-practices` | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements. |
| `workflows` | HermesSales project workflows: local development, Supabase migrations, cache tags, testing with Vitest, deployment. Use when asking about commands, migrations, cache, tests, or any task in the development cycle. |
# MCPs available per agent
 
| Agent | linear | supabase | context7 |
|---|---|---|---|
| `issue-starter` | ✅ | ❌ | ❌ |
| `builder` | ❌ | ✅ | ✅ |
| `implementation-tester` | ❌ | ✅ | ❌ |
| `pr-manager` | ✅ | ❌ | ❌ |
| `linear-planning-agent` | ✅ | ❌ | ❌ |

## Branch conventions
 
- Features: `feature/issue_id`
- Bugs: `fix/issue_id`
- Worktrees in: `~/projects/HermesSales-<issue_id>/`

## Rules for All Agents

- Read the relevant skill BEFORE writing code
- Never instantiate Supabase clients outside of `@lib/supabase/`
- Use `withServerAction` in all Server Actions — never use manual try/catch
- Use `CACHE_TAGS` from constants.ts — never use raw strings for revalidateTag
- No `any` in TypeScript (except for mappers with untyped Supabase rows)
- Use `@` for all imports — never relative paths
- Issues only on Linear — never GitHub Issues
- Follow the usage structure of useTranslation
