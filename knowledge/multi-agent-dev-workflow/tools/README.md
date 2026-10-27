# orchestrator.mjs — 编排执行器

`00 编排者`的命令行工具。零依赖（Node ≥ 18），单文件，随 skill 分发，不拖 node_modules。

## 定位：管机械活，不管创作

| 工具做 | 工具不做 |
|---|---|
| 状态持久化（`runs/<task_id>/state.json`） | 写需求/设计/代码/评审结论（角色 Agent 的活） |
| handoff 结构校验（对齐 `schemas/handoff.schema.json`） | 判断内容质量（06 评审的活） |
| gate 自动项检查 + 人工项 👤 提醒 | 替人确认 GATE-1/2/4（人的活） |
| CCR 记录与裁决状态跟踪 | 裁决内容本身（05 的活） |
| token 预算累加与分阶段统计 | 真实 token 消耗（需 Agent 侧上报） |

## 快速开始

```bash
# 在项目根目录执行（--root 默认取 cwd）
node tools/orchestrator.mjs init --task t-20261025-crud --level M

# 派活：01 → 02
node tools/orchestrator.mjs handoff --task t-20261025-crud \
  --from 01-requirement-analyst --to 02-requirement-critic \
  --phase P1-requirement --goal "澄清教师信息管理需求" \
  --artifact "requirement-spec|artifacts/requirement-spec.md|v1|DRAFT" \
  --read "artifacts/requirement-spec.md,00-raw-requirement.md" \
  --max-tokens 20000 --est-tokens 12000

# 02 回执（REJECTED / NEEDS_CHANGE 必须带可执行的 --reason）
node tools/orchestrator.mjs ack --task t-20261025-crud --signal ACCEPTED
node tools/orchestrator.mjs ack --task t-20261025-crud --signal REJECTED \
  --reason "P0: 删除语义未定义（逻辑/物理？）" --reason "P0: 关联课程时删除行为未定义"

# 过门禁：先 --check 看自动项，人工项逐条确认后 --confirm
node tools/orchestrator.mjs gate --task t-20261025-crud --gate GATE-1 --check
node tools/orchestrator.mjs gate --task t-20261025-crud --gate GATE-1 --confirm

# 推进阶段（进入条件不满足会被拒，含 gate PASSED / 契约 LOCKED / artifact 齐全）
node tools/orchestrator.mjs advance --task t-20261025-crud --to P2-contract

# 随时看进度 —— 这也是断点恢复的入口
node tools/orchestrator.mjs status --task t-20261025-crud
```

## 子命令一览

| 命令 | 作用 | 要点 |
|---|---|---|
| `init` | 建任务，初始化 state.json | `--level S\|M\|L`；重复 init 被拒（提示用 status 续跑） |
| `handoff` | 发一轮交接 | 按 schema 校验后落盘；`--artifact type\|path\|version\|status` 可重复；`--read/--not-read` 支持逗号分隔；`--max-tokens/--est-tokens` 记预算 |
| `ack` | 回执 signal | `REJECTED/NEEDS_CHANGE` 必须带 `--reason`（自动解析 `P0\|P1:` 前缀为 severity）；round +1，超 3 打印熔断提示 |
| `gate --check` | 跑自动项 + 打印人工项 | AUTO 项任一不过 → 退出码 1；`--cmd "<命令>"` 可重复，退出码 0 才算过（GATE-3 用） |
| `gate --confirm` | 人确认后写 PASSED | 必须先 `--check` 且自动项全过；已 PASSED 的不被后续 check 降级 |
| `advance` | 推进 phase | 只进不退；返工走根因分层（见 SKILL.md 流程图 RT 节点） |
| `ccr` | 提交契约变更请求 | 记 OPEN；`--resolve <id> --verdict APPROVED\|REJECTED` 记录裁决 |
| `status` | 看进度 | 纯读 state.json，不写盘——新会话/换人后的恢复入口 |
| `cost` | 成本统计 | 按 phase 累加 estimated_tokens，用于校准下一轮 `max_tokens` |

## 产出结构

```
runs/<task_id>/
├── state.json          唯一真相源：phase / gates / artifacts / open_questions / pending_ccr / cost_log
├── handoffs/
│   └── NNN-<from>-to-<to>-<phase>.json   每次交接（含 ack 回执与 reject_reasons）
└── gates/
    └── GATE-n.json     自动检查结果快照
```

## 自动化边界（AUTO vs MANUAL）

- **AUTO**（工具判定，可写进 CI）：artifact 存在性、契约 `LOCKED` 状态、两份设计与契约版本对齐、无 OPEN CCR、`round ≤ 3`、`--cmd` 测试命令退出码、handoff schema 合法性（required + enum）
- **MANUAL**（工具只打印 👤 提醒）：验收标准可判定性、资产陈述有路径、评审结论、回归范围、人确认——由 `gate --confirm` 显式确认，**工具不替人点头**
- 已 `PASSED` 的 gate 不被后续 `--check` 降级：PASSED 是人确认过的历史结论；新出现的未过项转为遗留提醒（典型场景：GATE-2 已过，Phase 5 新提未决 CCR）

## 设计决策

1. **零依赖**：不引 ajv，按 schema 的 `required + enum` 手写校验。skill 要能跟着仓库走，不制造 node_modules 依赖。
2. **子命令位置自由**：`--root x init ...` 与 `init --root x ...` 等价（自动跳过 flag 及其值后定位子命令）。
3. **advance 只进不退**：回退是决策不是操作。返工按缺陷根因分层回 Phase 2/3/1/5，由编排者判，CLI 不提供 `--back`。
4. **每步写盘**：init/handoff/ack/gate/advance/ccr 都立即落 state.json。崩溃、换会话、换人执行后，`status` 即恢复现场。
5. **重复 flag 自动成数组**：`--reason a --reason b`、`--read x,y` 都可以，不必记特殊语法。

## 已验证（2026-10-25）

全生命周期 + 负例 20+ 场景跑通：

- 正向：init → 6 阶段推进（含并行 handoff）→ 4 道 gate check/confirm → CCR 提交/裁决（APPROVED 与 REJECTED）→ status/cost
- 负例（全部正确拒绝，退出码 1）：`REJECTED` 不带 reason、非法 signal、ack 不存在的 handoff、重复 init、advance 回退、未 check 就 confirm、OPEN CCR 时 confirm GATE-2
- 边界：GATE-3 命令退出码 1/0 分别判 FAIL/PASS；已 PASSED 的 GATE-2 遇新 OPEN CCR 保留 PASSED + ⚠ 遗留提醒；双 reason 完整落盘
