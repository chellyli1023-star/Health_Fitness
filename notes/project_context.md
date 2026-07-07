# 🍐 AI Coach

Last Updated: 2026-07-07

---

# Project Mission

构建一个长期运行的 AI Coach，帮助用户完成 2026-09-13 太舞崇礼25K越野赛备赛，并逐步演化为 Life OS 的 Health 模块。

产品目标不是记录训练，而是降低每天的训练决策成本。

AI Coach 每天回答四个问题：

1. 今天该做什么？
2. 为什么这样安排？
3. 本周完成到哪里？
4. AI 最近是否调整了计划？

Apple Health 负责记录数据。

AI Coach 负责训练决策。

---

# Current Milestone

Phase V1

完成一个长期可维护的 MVP：

- 单页 Dashboard
- GitHub Pages 部署
- PWA（可添加到 iPhone 主屏幕）
- JSON 驱动
- Codex 更新 Dashboard
- GPT 负责训练决策

当前暂不追求自动化。

稳定运行优先。

---

# Long-term Vision

Health 将成为整个 Life OS 的第一个模块。

最终 Life OS：

- Health
- AI Learning
- Cocktail
- Secondhand

共享统一架构：

User

↓

GPT（Planner）

↓

Codex（Executor）

↓

Dashboard

所有模块遵循同一套设计思想。

---

# Validated Principles

## Product

AI Coach 不是：

- Garmin
- Apple Health
- Fitness Tracker

AI Coach 是：

AI Decision Layer。

---

Dashboard 不展示所有数据。

Dashboard 只展示：

- 今天训练
- 为什么
- 本周计划
- AI 最近一次调整

---

Apple Health：

负责趋势数据。

AI Coach：

负责每天的行动。

---

单页。

一屏。

不能滚动。

---

所有训练讨论发生在 GPT。

Dashboard 只是结果展示。

---

Codex 永远负责执行。

GPT 永远负责决策。

职责不交叉。

---

JSON 为唯一数据来源。

Dashboard 不保存状态。

Dashboard 永远只读取 `data/state.json`。

`today.md` 不给 Dashboard 直接读取。

`training_log.json`、`body_log.json`、`coach_journal.json` 只用于 GPT 决策，不给 Dashboard 直接读取。

---

事实（Facts）：

`current/today.md`

`training_log.json`

`body_log.json`

计划（Plans）：

`state.json`

`weekly_plan.json`

计划唯一来源：

`data/weekly_plan.json`

`data/state.json`

其中：

- `weekly_plan.json` = 当前周完整计划
- `state.json` = Dashboard 当前展示状态 / 已确认临时调整

Daily Brief 必须根据当前日期匹配 `weekly_plan.json` 中对应日期；若 `state.json` 有已确认临时调整，以 `state.json` 为准。

`today.md` 只作为恢复和身体状态输入，不作为计划来源。

禁止从 `today.md` 推导明天计划。

不新增 `tomorrow.md`。

因为 tomorrow 不是事实，而是系统当前计划。

`current/today.md` 只记录当天事实：

- 今天完成了什么
- 身体状态
- 睡眠
- 体重
- 疼痛
- 主观疲劳
- 当天约束
- GPT 当天判断

`current/today.md` 不允许包含：

- Tomorrow Plan
- Next Training
- 明天训练安排

如果发现这些内容，忽略并提示：

today.md should not contain future plan. Use weekly_plan.json/state.json instead.

---

训练历史：

Append Only。

永不覆盖。

---

# Working Hypotheses

未来可演化：

- 自动 Agent
- OpenAI API
- 自动更新 Dashboard
- Apple Health 接入

目前均未验证。

---

未来可能增加：

恢复评分

比赛完成概率

风险预测

均未验证。

---

# Current Architecture

User

↓

ChatGPT

↓

Daily Brief

↓

用户确认：更新

↓

Codex

↓

Update JSON

↓

GitHub Pages

↓

PWA

↓

iPhone

---

# Dashboard

唯一页面。

模块：

Header

↓

Today

↓

Reason

↓

Week Plan

↓

Weekly Goal

↓

Last AI Adjustment

结束。

---

# Repository Structure

notes/

project_context.md

memory/

memory.md

current/

today.md

roadmap.md

decision_log.md

data/

state.json

weekly_plan.json

training_log.json

body_log.json

coach_journal.json

dashboard/

scripts/

---

# Data Files

state.json

Dashboard 唯一读取文件。

当前系统状态。

保存当前训练状态、当前周目标、Dashboard 展示数据、下一次训练计划。

weekly_plan.json

当前周计划。

training_log.json

Append Only。

body_log.json

Append Only。

coach_journal.json

Append Only。

current/today.md

唯一 Daily Working Context。

每天覆盖。

永远只保留今天。

不承担历史记录职责。

实现辅助文件可以存在，例如：

settings.json

update_plan.json

schemas/

docs/

deploy.sh

但它们不是 Dashboard 数据来源，也不是 Daily Brief 核心读取来源。

---

# Daily Brief Input Order

1. notes/project_context.md

2. memory/memory.md

3. decision_log.md

4. roadmap.md

5. current/today.md

6. data/state.json

7. data/weekly_plan.json

8. data/training_log.json

9. data/body_log.json

10. data/coach_journal.json

不得调整顺序。

---

# Deployment

GitHub Pages

PWA

无后端。

纯静态部署。

---

# Daily Workflow

用户训练

↓

GPT讨论

↓

GPT 更新 current/today.md

↓

GPT 输出 Daily Brief

↓

用户确认：

更新

↓

GPT 输出 Dashboard Update

↓

Codex 更新 JSON

↓

deploy.sh

↓

GitHub Pages

↓

iPhone 查看最新计划
