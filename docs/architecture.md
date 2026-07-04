# Life OS Health_Fitness Architecture

## Core Principle

🍐的AI教练 is an AI Coach decision layer, not a fitness tracker and not an Apple Health replacement.

Apple Health owns long-term health trends:

- weight
- heart rate
- sleep
- workouts
- VO2max
- HRV

This Dashboard owns only the daily training decision:

1. What should I do today?
2. Why?
3. Am I on track this week?
4. What did AI change most recently?

V1 final does not use `tomorrow.md`. Tomorrow is a plan, not a fact. Plans live in `data/state.json` and `data/weekly_plan.json`.

## Layers

### UI

Location: `dashboard/`

Files:

- `index.html`
- `style.css`
- `app.js`

Responsibilities:

- Render a single iPhone-first page
- Fit the full decision view in one screen
- Read only `data/state.json`
- Never read history directly
- Never make training decisions

### Current State

Location: `data/state.json`

This is the only file the Dashboard reads.

It contains only single-page presentation data:

- `race`
- `today`
- system-approved next training plan
- `reasons`
- `week.days`
- `week.progress`
- `last_ai_adjustment`
- `last_updated`

No trend payload belongs here. Trends live in Apple Health.

### Update Input

Location: `data/update_plan.json`

This is the current execution staging file Codex uses for updates.

GPT generates it after the user confirms a training decision. Codex executes it.

It is not a Dashboard data source and not an additional product state source. The product state remains `data/state.json` and `data/weekly_plan.json`.

### Daily Working Context

Location: `current/today.md`

This is the daily working context shared by GPT and Codex.

It is not history, not a database, and not the Dashboard. It is overwritten every day and only keeps today's working context.

It represents facts that have already happened today plus current constraints. It does not store tomorrow's plan.

Responsibilities:

- Capture today's working context for GPT and Codex
- Provide the current inputs for Daily Brief and Dashboard Update decisions
- Stay in Markdown
- Avoid storing long-term history

Required sections:

- Date
- Race Countdown
- Training Today
- Recovery
- Body Status
- Current Constraints
- Weekly Progress Snapshot
- Coach Notes / Current AI Judgment

Historical facts from `current/today.md` must be moved into append-only logs when they become records:

- `data/training_log.json`
- `data/body_log.json`
- `data/coach_journal.json`

### Daily Brief Input Order

When generating a Daily Brief, Dashboard Update, or training plan, read files in this exact order:

1. `notes/project_context.md`
2. `memory/memory.md`
3. `decision_log.md`
4. `roadmap.md`
5. `current/today.md`
6. `data/state.json`
7. `data/weekly_plan.json`
8. `data/training_log.json`
9. `data/body_log.json`
10. `data/coach_journal.json`

Do not change the read order.

### Facts and Plans

Facts live in:

- `current/today.md`
- `data/training_log.json`
- `data/body_log.json`

Plans live in:

- `data/state.json`
- `data/weekly_plan.json`

`current/today.md` is overwritten daily.

`data/training_log.json`, `data/body_log.json`, and `data/coach_journal.json` are append-only.

`data/state.json` always represents the current system state.

`data/weekly_plan.json` always represents the current training plan.

### Update Executor

Location: `scripts/apply_update_plan.js`

Responsibilities:

- Validate `update_plan.json`
- Append `training_log.json`
- Append `body_log.json`
- Update `weekly_plan.json`
- Append `coach_journal.json`
- Regenerate `state.json`
- Refresh the embedded fallback state in `dashboard/index.html`

### Editable Plan

Location: `data/weekly_plan.json`

This stores the current week plan and completion state.

### Append-only Logs

Locations:

- `data/training_log.json`
- `data/body_log.json`
- `data/coach_journal.json`

Rules:

- append only
- do not delete history
- do not overwrite previous records

These logs exist so GPT can reason over history in future conversations. The Dashboard does not read them directly.

### Settings

Location: `data/settings.json`

Stores long-term configuration such as target weight, race distance, weekly targets, theme, and user preferences.

This is an implementation support file. It is not part of the Daily Brief input order and not a Dashboard data source.

## Daily Workflow

```text
User trains
↓
User discusses training and body state with GPT
↓
GPT updates current/today.md
↓
GPT outputs Daily Brief
↓
User says: 更新
↓
Codex reads current/today.md
↓
GPT or user provides the confirmed Dashboard Update
↓
Codex runs node scripts/apply_update_plan.js
↓
state.json is regenerated
↓
Dashboard refreshes
```

The next morning, Dashboard and Daily Brief read the latest state directly. No `tomorrow.md` is created.

## Separation of Responsibilities

GPT decides.

Codex executes.

Dashboard displays.

This separation keeps the Health module maintainable after one year of continuous updates.
