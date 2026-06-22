# CLAUDE.md

Claude Code entry point. The canonical, cross-agent rules live in
[`AGENTS.md`](AGENTS.md) and are imported below — keep rules there, not
here. This file adds only the Claude-Code-specific wiring.

@AGENTS.md

## Claude Code specifics

- **Per-codebase rules load on demand.** Editing a codebase triggers
  the matching skill in `.claude/skills/<dir>/SKILL.md`, which redirects
  to the canonical `<dir>/AGENTS.md` (`backend`, `mobile`, `web-admin`, `docs`).
  Read that file before changing code in that tree.
- **Language how-to skills.** Best-practice / how-to questions (not
  directory edits) trigger `.claude/skills/<lang>/SKILL.md` — `rails`,
  `ruby` (→ `backend/AGENTS.md`), `react` (→ `web-admin/AGENTS.md`),
  `react-native` (→ `mobile/AGENTS.md`). Each redirects to the same
  canonical per-codebase ruleset.
- **Enforcement hooks** (deterministic, Claude-only) are wired in
  [`.claude/settings.json`](.claude/settings.json) → `.claude/hooks/`:
  - `no-todo.sh` — `PostToolUse`, **blocks** a just-edited code file
    that contains a `TODO`/`FIXME` comment (AGENTS.md "Universal forbidden").
  - `docs-with-code.sh` — `Stop`, **warns** when the tree has
    `backend`/`mobile`/`web-admin` changes but no `docs/` change
    (AGENTS.md rule 5).
- **Token-efficiency rules** (AGENTS.md rule 7) are spelled out in
  [`.claude/commands/token-efficiency.md`](.claude/commands/token-efficiency.md).

Other agents (Codex, Cursor, …): see
[`AGENTS.md`](AGENTS.md) "Agent-specific entry points".
