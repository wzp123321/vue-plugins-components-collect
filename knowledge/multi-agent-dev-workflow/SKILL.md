---
name: multi-agent-dev-workflow
description: 多智能体协同开发流程。当用户提出一个需求，需要走「需求讨论澄清 → 前后端分别设计并互相协同对齐契约 → 设计评审 → 并行开发 → 验收自测」的完整流程时使用。触发词：多智能体开发、协同开发流程、需求到交付全流程、前后端协同设计、agent 流水线开发。
---

# 多智能体协同开发流程

把一个需求拆成 6 个阶段，由 8 个角色 Agent 在阶段门控下协作完成。

## 核心机制

### 1. 契约先行（Contract-First）
前后端并行设计最大的坑是「各写各的、评审时才发现对不上」。解法：**先对齐接口契约，再写详细设计**。
契约是唯一真相源，任何一方发现契约问题，走 `contract-change-request` 变更流程，**不得私自改**。

### 2. 阶段门控（Gate）
每个阶段有出口标准。未达标 → 本阶段内循环修订，`max_rounds = 3` 熔断升级给人。

### 3. 结构化交接
Agent 间状态传递走 `schemas/handoff.schema.json`。禁止用大段自然语言转述上游产出——下游只拿到 `artifacts` 里的文档路径 + 自己的 `context_budget`。

### 4. 双向信号
接收方必须回 `ACCEPTED / REJECTED / NEEDS_CHANGE`。`REJECTED` 必须带 `reject_reasons`（可执行的修订项，不是「我觉得不好」）。

### 5. 上下文预算
每个 Agent 的 `context_budget` 显式声明它需要读哪些文档。编排者按预算投递，不转发全量历史。
这条直接治「Agent 重复提问」——它问，是因为没拿到该拿的东西。

## 流程总览

```mermaid
flowchart TD
    P0[Phase 0 需求输入 · 人] --> P1
    subgraph P1[Phase 1 需求澄清 · 串行多轮]
        A1[01 需求分析师] -->|草案| A2[02 需求挑战者]
        A2 -->|REJECTED + 问题清单| A1
        A2 -->|ACCEPTED| G1
    end
    G1{{GATE-1 需求冻结 · 人确认}} --> P2
    subgraph P2[Phase 2 契约对齐 · 并行后汇聚]
        B1[03 前端架构师 · 契约诉求] --> N[05 契约协调者]
        B2[04 后端架构师 · 契约草案] --> N
        N -->|有冲突| B1
        N -->|有冲突| B2
    end
    N -->|共识契约 v1| P3
    subgraph P3[Phase 3 详细设计 · 并行]
        C1[03 前端架构师 · 前端设计]
        C2[04 后端架构师 · 后端设计]
    end
    P3 --> P4
    subgraph P4[Phase 4 设计评审 · 串行]
        D1[06 设计评审官] -->|REJECTED| P3
    end
    D1 -->|APPROVED| G2
    G2{{GATE-2 设计评审通过 · 人确认}} --> P5
    subgraph P5[Phase 5 开发 · 并行]
        E1[07 前端开发]
        E2[07 后端开发]
    end
    P5 --> G3{{GATE-3 开发完成 · 自测+lint+单测}}
    G3 --> P6
    subgraph P6[Phase 6 验收自测 · 串行]
        F1[08 验收自测] -->|FAIL + 缺陷清单| P5
    end
    F1 -->|PASS| G4{{GATE-4 交付 · 人确认}}
```

## 阶段说明

| Phase | 名称 | 并行性 | 角色 | 产出 | 出口门控 |
|---|---|---|---|---|---|
| 0 | 需求输入 | — | 人 | 原始需求 | — |
| 1 | 需求澄清 | 串行多轮 | 01 / 02 | `requirement-spec.md` | GATE-1 |
| 2 | 契约对齐 | 并行→汇聚 | 03 / 04 / 05 | `interface-contract.md` | 契约零冲突 |
| 3 | 详细设计 | 并行 | 03 / 04 | `frontend-design.md` / `backend-design.md` | 符合契约 |
| 4 | 设计评审 | 串行 | 06 | `design-review-report.md` | GATE-2 |
| 5 | 开发实现 | 并行 | 07 | 代码 + 自测 | GATE-3 |
| 6 | 验收自测 | 串行 | 08 | `acceptance-report.md` | GATE-4 |

## 角色清单

| ID | 角色 | 文件 | 做什么 | 不做什么 |
|---|---|---|---|---|
| — | 编排者 | [`agents/00-orchestrator.md`](./agents/00-orchestrator.md) | 调度、投递上下文、守门控、熔断 | 不产出业务内容 |
| 01 | 需求分析师 | [`agents/01-requirement-analyst.md`](./agents/01-requirement-analyst.md) | 澄清需求、写需求规格 | 不做技术选型 |
| 02 | 需求挑战者 | [`agents/02-requirement-critic.md`](./agents/02-requirement-critic.md) | 挑刺、找歧义/遗漏/不可测项 | 不写方案 |
| 03 | 前端架构师 | [`agents/03-frontend-architect.md`](./agents/03-frontend-architect.md) | 前端契约诉求 + 前端设计 | 不定后端实现 |
| 04 | 后端架构师 | [`agents/04-backend-architect.md`](./agents/04-backend-architect.md) | 后端契约草案 + 后端设计 | 不定前端交互 |
| 05 | 契约协调者 | [`agents/05-integration-negotiator.md`](./agents/05-integration-negotiator.md) | 对齐前后端契约差异 | 不裁决业务优先级（升级给人） |
| 06 | 设计评审官 | [`agents/06-design-reviewer.md`](./agents/06-design-reviewer.md) | 按 rubric 评审并给结论 | 不改设计 |
| 07 | 开发工程师 | [`agents/07-developer.md`](./agents/07-developer.md) | 按设计文档实现 | 不改设计/契约（走 CR） |
| 08 | 验收自测 | [`agents/08-qa-acceptance.md`](./agents/08-qa-acceptance.md) | 按验收标准逐条验证 | 不修 bug |

## 使用方式

1. **启动**：把原始需求交给 `00-orchestrator`，编排者创建 `task_id` 并初始化 handoff。
2. **逐阶段推进**：每个阶段结束，编排者校验 gate（见 [`checklists/gates.md`](./checklists/gates.md)），达标才发下一轮 handoff。
3. **人工确认点**：GATE-1（需求冻结）、GATE-2（设计评审通过）、GATE-4（交付）必须停等人。
4. **产出落地**：所有文档写到 `<项目>/.workbuddy/runs/<task_id>/` 下，模板见 [`templates/`](./templates/)。

## 防踩坑

- **不要让两个架构师直接对话**：走 05 协调者。点对点协商会发散，且没有仲裁记录。
- **不要让开发 Agent 改契约**：它觉得契约不对，提交 `contract-change-request` 给 05，由 05 裁决并同步双方。
- **不要让验收 Agent 修 bug**：它只报缺陷清单，回 Phase 5。修验一体会掩盖问题。
- **不要转发全量历史**：按 `context_budget` 投递，token 是乘法级放大的。
- **REJECTED 必须可执行**：「这个设计不好」不是理由，「P2 接口缺分页参数，会导致列表超 1000 条时 OOM」才是。
