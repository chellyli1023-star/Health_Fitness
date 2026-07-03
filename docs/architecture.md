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
- `reasons`
- `week.days`
- `week.progress`
- `last_ai_adjustment`
- `last_updated`

No trend payload belongs here. Trends live in Apple Health.

### Update Input

Location: `data/update_plan.json`

This is the only input Codex uses for updates.

GPT generates it after the user confirms a training decision. Codex executes it.

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

## Daily Workflow

```text
User trains
↓
User discusses training and body state with GPT
↓
GPT decides whether plan changes
↓
GPT outputs data/update_plan.json
↓
User says: 更新
↓
Codex runs node scripts/apply_update_plan.js
↓
state.json is regenerated
↓
Dashboard refreshes
```

## Separation of Responsibilities

GPT decides.

Codex executes.

Dashboard displays.

This separation keeps the Health module maintainable after one year of continuous updates.
