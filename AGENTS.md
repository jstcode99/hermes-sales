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
| `architecture` | Create features, modules, routes — where each file goes |
| `code-conventions` | Write or review any TypeScript/React code |
| `integrations` | Supabase Auth, Storage, RLS, Google Maps |
| `workflows` | Migrations, CACHE_TAGS, bun commands, testing |
| `git-workflow` | Worktrees, semantic commits, PRs, merge squash |

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
