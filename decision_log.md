# Important Decisions

## Decision 001

Apple Health

负责：

数据。

AI Coach

负责：

决策。

避免重复建设。

Status：

Accepted

---

## Decision 002

Dashboard：

单页。

一屏。

不滚动。

Status：

Accepted

---

## Decision 003

Dashboard 只展示：

- Today
- Reason
- Week Plan
- Weekly Goal
- Last AI Adjustment

删除：

趋势页。

Status：

Accepted

---

## Decision 004

GPT：

负责：

训练判断。

Codex：

负责：

执行。

Dashboard：

负责：

展示。

Status：

Accepted

---

## Decision 005

所有历史：

Append Only。

禁止覆盖。

Status：

Accepted

---

## Decision 006

部署：

GitHub Pages

PWA

纯静态。

不引入服务器。

Status：

Accepted

---

## Decision 007

每日工作流：

训练

↓

GPT

↓

Dashboard Update

↓

Codex

↓

Deploy

↓

Dashboard

Status：

Accepted

---

## Decision 008

当前阶段：

优先稳定。

暂不追求：

OpenAI API

Webhook

自动 Agent

等待未来验证。

Status：

Accepted

---

## Decision 009

V1 Final 架构：

不新增：

tomorrow.md

原因：

"明天" 是计划。

不是事实。

事实存放：

today.md

training_log.json

body_log.json

计划存放：

state.json

weekly_plan.json

Dashboard 永远只读取：

state.json

历史数据只用于 GPT 决策。

Status：

Accepted

---

## Future Agent Vision

未来演化：

User

↓

GPT（Coach）

↓

Codex（Executor）

↓

GitHub

↓

PWA

↓

Life OS

最终：

多个项目共享：

统一 Planner

统一 Executor

统一 Dashboard

统一数据结构。

当前仍采用 V1 工作流，不实施自动 Agent。

---

## D009

Title

Training Adjustment Principles

---

## Validation Record

Decision

D009

Validation Date

2026-07-05

Case

因天气取消户外长距离。

第二天改为室内跑步机完成 7.60 km。

恢复状态正常。

Result

成功完成原计划。

未降低训练量。

未增加恢复风险。

Conclusion

External Constraint → Postpone

首次验证成功。

继续作为默认决策规则执行。

Status

Accepted

Date

2026-07-04

---

Background

训练过程中会出现计划无法按原定执行的情况。

AI 应区分：

- External Constraints（外部约束）
- Internal Constraints（内部约束）

并采用不同策略。

---

Rule 1

External Constraints

例如：

- 下雨
- 出差
- 场地关闭
- 不可抗力

如果：

用户恢复状态正常。

（无伤痛、睡眠正常、疲劳可接受）

默认采用：

Postpone（顺延）

而不是：

Reduce（降低训练量）。

保持：

训练内容

训练距离

训练目标

整体顺延。

---

Rule 2

Internal Constraints

例如：

- 膝盖疼痛
- 明显疲劳
- 睡眠严重不足
- 生病

默认重新评估训练。

AI 可以：

降低训练量

改为恢复训练

取消训练

优先保证恢复。

---

Rule 3

事实（Facts）

存放：

today.md

training_log.json

body_log.json

事实不可修改。

---

Rule 4

计划（Plans）

存放：

weekly_plan.json

state.json

计划允许动态调整。

---

Rule 5

除非恢复状态发生变化，

否则因天气等外部因素导致取消训练，

默认：

整体顺延。

而不是：

压缩训练。

也不是：

额外补课。

---

Reason

保持训练刺激连续性，同时避免因为外部因素导致训练计划失真。

长期优先保证：

恢复

训练一致性

比赛准备质量

而不是机械完成每日计划。
