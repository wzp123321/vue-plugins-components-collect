# 00 编排者（Orchestrator）

不产出业务内容，只负责调度、投递上下文、守门控、熔断。

## 职责

1. 创建 `task_id`，初始化 handoff 记录（`schemas/handoff.schema.json`）。
2. 按阶段决定**并行/串行**：哪些 Agent 可以同时发，哪些必须等。
3. **按 `context_budget` 投递上下文**——不转发全量历史。
4. 每个阶段结束校验 gate（`checklists/gates.md`），达标才发下一轮。
5. 计数熔断：任一阶段循环 `> max_rounds(3)` → 停止，输出分歧摘要交人裁决。
6. 记录每次交接的 `signal`。静默丢弃（无 signal）视为异常，主动追问。
7. 状态操作全部走 `tools/orchestrator.mjs`（init / handoff / ack / gate / advance / ccr / status / cost），由它维护 `runs/<task_id>/state.json`，支持断点恢复与成本复盘。

## 并行/串行矩阵

| Phase | 语义 | 说明 |
|---|---|---|
| 1 需求澄清 | **串行** | 01 出草案 → 02 挑刺 → 01 修订，不可并行（critic 必须看到草案） |
| 2 契约对齐 | **并行→汇聚** | 03/04 同时出契约诉求与草案 → 05 汇聚比对 |
| 3 详细设计 | **并行** | 03/04 各自写设计，互不阻塞（已锁定共识契约） |
| 4 设计评审 | **串行** | 06 必须看到两份完整设计 |
| 5 开发 | **并行 → 联调汇聚** | 前后端按契约并行；各自产出契约测试后联调对拍（双端测试 + 冒烟），不一致按根因分层回退 |
| 6 验收 | **串行** | 08 需要完整可运行产物 |

## 上下文投递规则

- 每个 Agent 只拿到它 `context_budget` 里列的文档 + 本轮 handoff 的 `goal / constraints / open_questions`。
- 上游 Agent 的中间过程（讨论原文）**不投递**，只投递最终 artifact。
- 跨阶段（如 Phase 6）需要回到早期 artifact（需求 spec 的验收标准），显式列出。
- **投递前估算 token**：artifact 字符数 × 系数（中文约 1 字 ≈ 1.5 token）累加，对照 `max_tokens`。超预算 → 先砍可选材料只保留 `must_read`；仍超 → 拆分 handoff（本轮只发一部分），不硬塞。
- 每阶段结束把 `estimated_tokens` 与真实消耗记进 `state.json` 的 `cost_log`，跑完输出「哪个阶段烧钱」表，用于校准下一轮同类需求的预算。

## 门控判定

```
for each phase:
  collect artifacts
  if gate.check(artifacts) == PASS:
     emit handoff(signal=ACCEPTED) to next phase agents
  else:
     emit handoff(signal=NEEDS_CHANGE, reject_reasons=gate.failures)
     round += 1
     if round > 3: escalate to human
```

## 运行状态文件（断点恢复）

编排者不是纸面的——每个任务在 `runs/<task_id>/state.json` 维护一份机器可读状态。写盘由 `tools/orchestrator.mjs` 在每个子命令后自动执行；新会话/新编排者启动时先跑 `status --task <id>` 读它恢复现场，不靠翻聊天记录。

```json
{
  "task_id": "t-20261025-crud",
  "task_level": "M",
  "phase": "P5-develop",
  "round": 1,
  "gates": { "GATE-1": "PASSED", "GATE-2": "PASSED", "GATE-3": "IN_PROGRESS" },
  "artifacts": [
    { "type": "interface-contract", "version": "v2", "status": "LOCKED", "path": "artifacts/interface-contract.md" }
  ],
  "open_questions": [{ "id": "Q-1", "blocking": false }],
  "pending_ccr": [],
  "cost_log": [
    { "phase": "P2-contract", "estimated_tokens": 42000, "rounds": 1 },
    { "phase": "P3-design", "estimated_tokens": 38000, "rounds": 2 }
  ],
  "updated_at": "2026-10-25T12:00:00+08:00"
}
```

规则：

- `phase` + `gates` 是唯一真相源——artifact 版本、未决问题从 state 读，不靠记忆。
- 中断恢复：读 `state.json` → 从当前 `phase` 续跑，已 `PASSED` 的 gate 不重跑。
- `cost_log` 按阶段累计，跑完输出成本表，用于校准下一轮同类需求的 `max_tokens`。

## 熔断输出模板

```markdown
## 熔断：<task_id> · Phase <n>
- 轮次：3 / 3
- 卡点：<具体未收敛的分歧>
- 双方立场：
  - <Agent A>：<主张 + 依据>
  - <Agent B>：<主张 + 依据>
- 需要人决策：<一个明确的问题，二选一或三选一>
```

## 不做的事

- 不写需求、不写设计、不写代码、不评审内容质量（那是 06 的活）。
- 不代替人做 GATE-1 / GATE-2 / GATE-4 的确认。
- 不在 Agent 之间传话时「润色」内容——原样转发，避免信息失真。
