---
name: linear
description: >
  Use this skill whenever the user wants to integrate Linear with OpenCode via MCP.
  Covers configuring the Linear MCP server in OpenCode, workflows for reading issues,
  creating tasks, updating statuses, and using Linear as live context during coding
  sessions. Trigger when the user mentions "Linear", "issues", "tickets", "tasks",
  "Linear project", or asks how to connect their project management tool to OpenCode.
  Also trigger if the user asks how to use MCP with OpenCode in general and mentions
  Linear as the target service.
---

# Linear + OpenCode via MCP
linear-opencode
This skill guides you through connecting Linear (your project management tool) directly to OpenCode using the MCP protocol. Once configured, the agent can read issues, create tasks, update statuses and comments — without leaving the terminal.

---

## 1. Prerequisites

- **OpenCode installed**: `npm install -g opencode-ai` or via `brew install opencode-ai/tap/opencode`
- **Linear account** with access to your workspace
- **Node.js 18+** (only needed for the local MCP server option)

---

## 2. Connection methods

### Option A — Linear's official remote server (recommended)

Linear provides a remote MCP server at `https://mcp.linear.app/sse`. OpenCode handles OAuth automatically.

Add this to your OpenCode config:

**Global** (`~/.config/opencode/opencode.json`) — applies to all your projects:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "linear": {
      "type": "remote",
      "url": "https://mcp.linear.app/sse",
      "enabled": true
    }
  }
}
```

**Per project** (`opencode.json` in the repo root) — applies only to that project:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "linear": {
      "type": "remote",
      "url": "https://mcp.linear.app/sse",
      "enabled": true
    }
  }
}
```

**Authentication**: The first time OpenCode tries to use Linear, it will open the OAuth flow in your browser. Authorize access and tokens are saved automatically.

To manually authenticate before using it:
```bash
opencode mcp auth linear
```

---

### Option B — Local server with API Key

If you prefer not to use OAuth or already have a Linear API key:

1. Get your API key at: **Linear → Settings → API → Personal API keys**

2. Configure the local server:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "linear": {
      "type": "local",
      "command": ["npx", "-y", "@linear/mcp-server"],
      "enabled": true,
      "environment": {
        "LINEAR_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

> ⚠️ **Security**: Never put the API key directly in files you'll commit. Use system environment variables instead:
> ```json
> "environment": {
>   "LINEAR_API_KEY": "{env:LINEAR_API_KEY}"
> }
> ```
> Then export the variable in your shell: `export LINEAR_API_KEY=lin_api_xxx`

---

## 3. Verify the connection

Once configured, start OpenCode and verify Linear is available:

```bash
opencode
```

In the TUI, type a test prompt:
```
use the linear tool to show my assigned issues
```

If it responds with your actual Linear issues, the connection is working.

---

## 4. Core workflows

### View issues assigned to you
```
use linear to list issues assigned to me in the current sprint
```

### Read issue details before coding
```
use linear to get the details of issue ENG-142, including description and comments
```

### Create an issue from the terminal
```
use linear to create an issue in the Frontend team titled "Fix: payment button unresponsive on mobile",
high priority, and assign it to me
```

### Update status when done
```
use linear to mark issue ENG-142 as "In Review"
```

### Add a comment with a summary of changes
```
use linear to add a comment to issue ENG-142 with this summary: [your summary]
```

### Full workflow: issue → code → close
```
1. Fetch the details of issue ENG-200 from Linear
2. Implement the required changes in the code
3. When done, update the status to "Done" and add a comment describing what you did
```

---

## 5. Using Linear as context in AGENTS.md

To have OpenCode always pull Linear context at startup, add instructions to your project rules file:

```markdown
# AGENTS.md

## Linear workflow
- Before starting any task, fetch the relevant Linear issue using the `linear` tool
- When a task is complete, update the issue status in Linear
- If you find an untracked bug, create a Linear issue before fixing it
- Use the issue number (e.g. ENG-142) in commit messages
```

---

## 6. Context management (important)

The Linear MCP adds tools to the LLM's context window. To avoid wasting tokens:

- **Enable Linear only when needed**: Disable it with `"enabled": false` and enable it on demand.
- **Be specific in prompts**: Instead of "show me the issues", say "show me issues assigned to me with status In Progress".
- **Per agent**: If you use multiple agents in OpenCode, configure Linear only for the project management agent.

### Enable/disable per agent

In your agent config (`.opencode/agents/pm.json`):
```json
{
  "name": "Project Manager",
  "description": "Agent with Linear access for task management",
  "mcp": ["linear"]
}
```

---

## 7. Troubleshooting

| Problem | Solution |
|---|---|
| "MCP server not found" | Verify the name under `mcp` matches what you reference in the prompt |
| Authentication error | Run `opencode mcp auth linear` to re-authenticate |
| Timeout loading tools | Increase the timeout: `"timeout": 15000` in the MCP config |
| Too many tokens used | Disable Linear when not in use: `"enabled": false` |
| Invalid API key (Option B) | Check the key hasn't expired at Linear → Settings → API |

---

## 8. Available tools reference

The Linear MCP exposes these capabilities to the LLM:

- **Read**: issues, projects, teams, comments, users, workflow states, cycles/sprints, labels
- **Write**: create issues, update status, assign, add comments, create projects
- **Search**: search issues by text, filter by team/priority/status/assignee

To see the exact tools available in your current session:
```
list all available tools from the linear server
```
