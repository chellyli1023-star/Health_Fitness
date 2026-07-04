# 🍐的AI教练 V1

Production MVP for the Health module of a future Life OS.

This is not a fitness tracker and not an Apple Health replacement.

Apple Health records data. 🍐的AI教练 makes training decisions visible.

## Product Goal

Help the user finish the 2026-09-13 太舞崇礼25K trail race.

Every morning before 9:00, the iPhone home-screen app should answer:

1. What should I do today?
2. Why?
3. Am I on track this week?

The daily operating goal is low interaction cost:

1. User discusses training with GPT at night
2. User says: 更新
3. Codex updates the Dashboard
4. The next morning, Dashboard and Daily Brief read the latest state directly

The system does not use `tomorrow.md`. Tomorrow is a plan, not a fact. Plans belong in `data/state.json` and `data/weekly_plan.json`.

## Product Boundary

Apple Health owns:

- Weight
- Heart rate
- Sleep
- Training records
- VO2max
- HRV

🍐的AI教练 owns:

- Today's training decision
- Why this decision was made
- Current week plan
- Weekly completion progress
- Latest AI plan adjustment

No trend page. No analytics dashboard. No second page.

## Local Use

Start the static server from the project root:

```bash
python3 -m http.server 8765 --bind 0.0.0.0
```

Open on iPhone Safari while Mac and iPhone are on the same Wi-Fi:

```text
http://192.168.0.105:8765/dashboard/index.html
```

Then use Safari share button → Add to Home Screen.

## Project Structure

V1 final core architecture:

```text
Health_Fitness/
├── notes/
│   └── project_context.md
├── memory/
│   └── memory.md
├── current/
│   └── today.md
├── roadmap.md
├── decision_log.md
├── data/
│   ├── state.json
│   ├── weekly_plan.json
│   ├── training_log.json
│   ├── body_log.json
│   └── coach_journal.json
├── dashboard/
├── scripts/
└── README.md
```

Implementation support files such as `data/update_plan.json`, `data/settings.json`, `schemas/`, `docs/`, and `deploy.sh` may exist to keep the static app maintainable, but they are not additional product state sources.

## Data Rules

Dashboard reads only:

```text
data/state.json
```

History files are append-only:

- `data/training_log.json`
- `data/body_log.json`
- `data/coach_journal.json`

Do not overwrite history.

Facts live in:

- `current/today.md`
- `data/training_log.json`
- `data/body_log.json`

Plans live in:

- `data/state.json`
- `data/weekly_plan.json`

`data/state.json` is the current system state. It stores the current training state, current week target, Dashboard display data, and the system-approved next training plan.

`data/weekly_plan.json` stores the full current week plan. When GPT adjusts training, update this file.

## Daily Working Context

`current/today.md` is the daily working context shared by GPT and Codex.

It is not history, not a database, and not the Dashboard. It is overwritten every day and only keeps today's working context.

It represents facts that have already happened today plus current constraints. It does not store tomorrow's plan.

All history belongs in append-only JSON files:

- `data/training_log.json`
- `data/body_log.json`
- `data/coach_journal.json`

`current/today.md` uses Markdown and contains:

- Date
- Race Countdown
- Training Today
- Recovery
- Body Status
- Current Constraints
- Weekly Progress Snapshot
- Coach Notes / Current AI Judgment

## Daily Brief Input Order

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

## Daily Brief Format

GPT Daily Brief output:

```text
今天：

训练日 / 恢复日 / 休息日

内容：

……

原因：

……

本周进度：

……

Dashboard：

需要更新 / 不需要更新

如果需要更新：

生成 🍐 AI Coach Dashboard Update。

否则结束。
```

## Update Workflow

Future GPT output format:

```text
==============================
🍐 AI Coach Dashboard Update
==============================
...
==============================
```

When Codex receives that update, Codex executes data changes only:

1. Update `data/state.json`
2. Update `data/weekly_plan.json`
3. Append `data/training_log.json`
4. Append `data/body_log.json` if provided
5. Append `data/coach_journal.json` if the plan changed
6. Refresh Dashboard fallback state

No UI changes during routine updates.

Current script path:

```bash
node scripts/apply_update_plan.js
```

The current script uses `data/update_plan.json` as an execution staging file. That file is not a Dashboard data source and not a separate product state source.

## Responsibility Split

GPT decides:

- Today's completion status
- Whether the plan should change
- The next training plan
- Risk and recovery judgment
- Reasons behind the plan

Codex executes:

- JSON updates
- Append-only logs
- Dashboard refresh
- Deployment

Dashboard displays:

- Today's decision
- Reasons
- Week plan
- Week goals
- Latest AI adjustment

Dashboard never reads `current/today.md`, `data/training_log.json`, `data/body_log.json`, or `data/coach_journal.json` directly. Historical data is for GPT decision-making only.

## GitHub Repository Setup

Initialize Git locally:

```bash
git init
git branch -M main
git add .
git commit -m "Initial AI Coach production MVP"
```

Create a new GitHub repository named `Health_Fitness`.

Connect local repo:

```bash
git remote add origin https://github.com/YOUR_USERNAME/Health_Fitness.git
git push -u origin main
```

## GitHub Pages

Recommended stable setup:

1. Open repository `Settings`
2. Open `Pages`
3. Source: `GitHub Actions`
4. Save if GitHub shows a save button
5. Push to `main`
6. Open the `Actions` tab and wait for `Deploy GitHub Pages` to turn green

Public URL:

```text
https://YOUR_USERNAME.github.io/Health_Fitness/
```

The root URL redirects to `dashboard/index.html`.

This is HTTPS, static, and can be added to iPhone Home Screen.

## Deploy

After JSON updates:

```bash
./deploy.sh
```

`deploy.sh` runs:

```bash
git add .
git commit -m "Update dashboard"
git push origin main
```

When finished it prints:

```text
Dashboard deployed successfully.
```

GitHub Pages usually updates shortly after push.

## PWA

The app includes:

- `dashboard/manifest.json`
- `dashboard/service-worker.js`
- SVG favicon
- PNG app icons
- Apple touch icon

The app is pure static HTML/CSS/JavaScript. No server, no Express, no backend, no database.

## Daily Production Workflow

```text
User finishes training
↓
User discusses with ChatGPT
↓
ChatGPT updates current/today.md
↓
ChatGPT outputs Daily Brief
↓
If user confirms: 更新
↓
Codex reads current/today.md
↓
Codex updates JSON
↓
Codex refreshes Dashboard
↓
Codex runs ./deploy.sh
↓
GitHub Pages updates
↓
iPhone Home Screen app shows latest plan
```

## Priorities

1. Stability
2. Long-term maintainability
3. Visual quality
4. Automation

Keep the architecture simple until automation is truly needed.
