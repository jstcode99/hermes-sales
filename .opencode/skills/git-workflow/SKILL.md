---
name: git-workflow
description: Git workflow for the hermes-sales project — issue-based worktrees, granular semantic commits, PRs via the GitHub CLI, and merge squashes. Always use this when working with branches, worktrees, commits, or PRs.
compatibility: opencode
---

# Git Workflow — hermes-sales

## Branch conventions

| Type | Format |
|---|---|
| Feature | `feature/issue_id` |
| Bug fix | `fix/issue_id` |
| Refactor | `refactor/issue_id` |

Examples: `feature/issue_id`, `fix/issue-131`

## Worktrees — Standard Structure

```
~/projects/
├── hermes-sales/               ← main repo (master)
├── hermes-sales-issue_id/  ← worktree for issue 123
└── hermes-sales-issue_id/  ← worktree for issue 124
```

```bash
# Create a new worktree from master
git fetch origin
git worktree add ../hermes-sales-<issue_id> -b <branch> origin/master

# Resume an existing worktree (branch already on the remote)
git worktree add ../hermes-sales-<issue_id> <branch>

# List active worktrees
git worktree list

# Remove after merge
git worktree remove ../hermes-sales-<issue_id> --force
```

## Semantic commits — one per logical unit

**Format:** `<type>(<scope>): <description in lowercase>`

| What you implemented | Commit |
|---|---|
| Entity + enums | `feat(module): add <entity> entity and enums` |
| Yup Schema | `feat(module): add <entity> validation schema` |
| Mapper | `feat(module): add <entity> mapper` |
| Registration in appModule | `feat(module): register <entity> in app module` |
| Server Action | `feat(module): add <entity> server actions` |
| SQL Migration | `feat(db): add <entity> migration and release policies` |
| UI Component | `feat(ui): add <entity> form/list/card component` |
| Page/Route | `feat(ui): add <entity> page route` |
| Bug fix | `fix(<scope>): <concise description>` |

```bash
git add -A
git commit -m “feat(module): add inquiry entity and enums”
```

**One commit per logical unit — never save everything for the end.**

## PR workflow with the GitHub CLI

```bash
# Push
git push -u origin <branch>

# Create PR
gh pr create \
  --title “feature: issue_id — issue title” \
  --body “...” \
  --base master

# View status and checks
gh pr status
gh pr checks <number>

# Squash merge (only when user approves)
gh pr merge <number> --squash --delete-branch

# Update local master
cd ~/projects/hermes-sales && git pull origin master
```

## PR Title
`feat: issue_id — [issue title in Spanish]`
`fix: issue_id — [issue title]`

## PR Body — template

```markdown
## Description
[what this change does and why]

## Issue
Closes issue_id

## Changes
- `@app/`: [description]
- `@modules/`: [description]

## Commits
[git log --oneline output]

## Checklist
- [x] `bun tsc --noEmit` passes
- [x] `bun test:run` passes
- [x] Project guidelines followed
- [x] Translations in es/ and en/
```

## Dokploy deploy
- Push to branch → automatic preview deploy in the PR
- Merge to `master` → automatic production deploy

## Squash merge message
`feat: issue_id — [title] (#PR-number)`
