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

```text
Health_Fitness/
├── dashboard/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── manifest.json
│   ├── service-worker.js
│   └── icons/
├── data/
│   ├── state.json
│   ├── update_plan.json
│   ├── weekly_plan.json
│   ├── training_log.json
│   ├── body_log.json
│   ├── coach_journal.json
│   └── settings.json
├── schemas/
│   ├── state.schema.json
│   ├── update_plan.schema.json
│   ├── weekly_plan.schema.json
│   ├── training_log.schema.json
│   ├── body_log.schema.json
│   ├── coach_journal.schema.json
│   └── settings.schema.json
├── scripts/
│   └── apply_update_plan.js
├── docs/
│   └── architecture.md
├── deploy.sh
└── README.md
```

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

## Responsibility Split

GPT decides:

- Today's completion status
- Whether the plan should change
- Tomorrow's training
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
ChatGPT outputs 🍐 AI Coach Dashboard Update
↓
User sends update to Codex
↓
Codex updates JSON
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
