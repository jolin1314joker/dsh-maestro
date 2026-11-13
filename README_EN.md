<p align="right">
  <a href="./README.md">简体中文</a> · <strong>English</strong>
</p>

<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="dsh-maestro turns a single DeepSeek Harness session into a coordinated multi-agent team">
</p>

# dsh-maestro

> A multi-agent orchestration plugin for DeepSeek Harness where a Leader makes decisions and Members execute tasks.
>
> **Forked and customized from [NanmiCoder/dsh-agent-teams](https://github.com/NanmiCoder/dsh-agent-teams).**

## What is this

`dsh-maestro` turns your current session into a coordinated team: **the model you select acts as the Leader**, responsible for architectural decisions, task breakdown, and final integration; **a group of low-cost subagents act as Members**, executing isolated atomic tasks in parallel.

It introduces no external workflow engine. The host side registers 14 coordination tools and writes scriptable disk state, while the web client provides a real-time activity panel. The Leader drives the entire pipeline through natural language.

## Differences from Upstream

This repository is a customized version of upstream `dsh-agent-teams`, with changes focused on the following areas:

| Aspect | Upstream `dsh-agent-teams` | This Repo `dsh-maestro` |
| --- | --- | --- |
| Package Identifier | `@nanmicoder/dsh-agent-teams` | `@local/dsh-maestro` |
| Plugin Registration Name | `agent-teams` | `dsh-maestro` |
| State Directory | `.agent-teams` | `.maestro` |
| Web Route Prefix | `/plugins/dsh-agent-teams/` | `/plugins/dsh-maestro/` |
| Preset Source | Requires external bundle declaration | Self-registers the `team` preset |
| Team Entry Point | Session header button + right sidebar tab | Retains only the Activity Panel (Formation view) |
| Sidebar Panel | — | Removed |
| Model Settings Page | — | Removed |

**The only retained UI is the Formation view**: team cards, member lists, task board, dependency graphs, and staged plan editing. Sidebar icons, team settings pages, and model configuration pages have all been removed.

**How Members are distinguished**: No longer registers presets like "Team Mode - Member" that clutter the new-session menu. Members inherit the Leader's preset, have their responsibilities defined via `executionPrompt`, and have their permissions automatically restricted at runtime by Leader-only tool denial rules (see `src/tool-policies.ts`).

## Installation

### Option 1: One-Click Install via Custom Plugin Marketplace (Recommended)

1. Open DeepSeek Harness and complete initial setup. Go to **Plugins**, click **More** next to "Experimental Plugins", and enable **Custom Plugin Marketplace**.
2. Go to **Discover → Add Index Source**, and enter the following community index URL:
   ```text
   https://jolin1314joker.github.io/purge-proxy-bridge/index.json
   ```
3. Locate **DSH Maestro** in the list, verify that the source is `jolin1314joker/dsh-maestro` and the package name is `@local/dsh-maestro`, then click **Install**.
4. **Fully restart** DeepSeek Harness after installation, and select **Team Mode** from the preset menu when starting a new session.

### Option 2: Build and Install from Local Source (For Development)

```bash
# Clone the repository and build artifacts
git clone https://github.com/jolin1314joker/dsh-maestro.git
cd dsh-maestro
pnpm install && pnpm build

# Add to your target profile
dsh plugin --profile desktop add C:\path\to\dsh-maestro
```

Fully restart DeepSeek Harness after installation, and select **Team Mode** from the preset menu when creating a new session.

## Usage

Select your preferred model (it will serve as the Leader throughout the session), and describe your goal in natural language:

```text
Refactor the authentication module of this project using Team Mode; break down the tasks first and implement them in parallel.
```

The Leader will: survey the directory → write interface contracts to disk → break down atomic tasks (with exclusive file scopes and self-check criteria) → spawn Members with designated models → aggregate results → handle entry-point wiring and full integration.

The UI entry point is the **Formation** view inside the session, displaying teams, task dependencies, and real-time progress.

### Model Tiering

The Leader model is chosen in your session input box. Which models Members can use is controlled by DSH's built-in **Plugins → Subagent → Model Selection**; once enabled and whitelisted with lower-cost models, the Leader can assign different model routes to atomic tasks based on difficulty.

## Tools Overview

| Tool | Purpose |
| --- | --- |
| `agent_teams_create` | Create a team and declare members and tasks |
| `agent_teams_add_member` / `agent_teams_remove_member` | Add or remove team members |
| `agent_teams_create_task` / `agent_teams_amend_task` | Create tasks and revise contracts |
| `agent_teams_reassign_task` | Reassign or take over tasks |
| `agent_teams_claim_task` / `agent_teams_update_task` | Member task claiming and submission |
| `agent_teams_send_message` | Communication between Leader and Members |
| `agent_teams_status` | Query team and task status |
| `agent_teams_edit_plan` / `agent_teams_approve` | Edit and approve staged plans |
| `agent_teams_resume` / `agent_teams_delete` | Resume and archive teams |

## Development

```bash
pnpm install
pnpm build        # Build both Host and Browser bundles
pnpm typecheck    # Typecheck both sides
pnpm verify       # Full verification (including compatibility and contract tests)
```

- `src/index.ts` — Host entry point; registers tools, web routes, and presets
- `src/tools.ts` — Implementation of the 14 coordination tools
- `src/presets.ts` — `team` preset composition and Leader instructions
- `src/client/` — Browser-side activity panel and card rendering
- `cordis.patch.yml` — Bundle mounting declaration

## Compatibility

Known working host: DeepSeek Harness `0.2.2-rc.x`. Build dependencies are pinned to `0.2.1-rc.2` type definitions; runtime does not depend on that specific version. See [`compatibility.json`](./compatibility.json) for the full matrix.

## License

[MIT](./LICENSE). Original copyright belongs to [NanmiCoder](https://github.com/NanmiCoder) and `dsh-agent-teams` contributors; modifications in this repository are likewise released under the MIT License.
