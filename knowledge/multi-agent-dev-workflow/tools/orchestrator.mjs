#!/usr/bin/env node
/**
 * orchestrator.mjs — 多智能体协同开发流程的编排执行器（零依赖，Node >= 18）
 *
 * 定位：这是「00 编排者」的工具，不是 Agent 的替代品。
 *   它负责机械活：状态持久化、handoff 结构校验、gate 自动化检查、CCR 记录、成本统计。
 *   它不负责创作：需求、设计、代码、评审结论仍由各角色 Agent 产出。
 *
 * 状态目录：<root>/.workbuddy/runs/<task_id>/
 *   state.json          唯一真相源（phase / gates / artifacts / open_questions / pending_ccr / cost_log）
 *   handoffs/NNN-*.json 每次交接的结构化记录（按 schemas/handoff.schema.json 校验）
 *   gates/GATE-n.json   gate 自动检查结果快照
 *
 * 用法速查：
 *   node orchestrator.mjs init    --task <id> [--level S|M|L] [--root <项目根>]
 *   node orchestrator.mjs handoff --task <id> --from <agent> --to <agent> --phase <P> --goal "<一句话>"
 *                        [--read a.md,b.md] [--not-read x.md] [--constraint "..."]...
 *                        [--artifact type|path|version|status]... [--blocking-question "..."] [--est-tokens 30000]
 *   node orchestrator.mjs ack     --task <id> [--handoff NNN|latest] --signal ACCEPTED|REJECTED|NEEDS_CHANGE|ESCALATED
 *                        [--reason "<可执行的修订项>"]...   （REJECTED/NEEDS_CHANGE 必填）
 *   node orchestrator.mjs gate    --task <id> --gate GATE-1|GATE-2|GATE-3|GATE-4 --check
 *   node orchestrator.mjs gate    --task <id> --gate GATE-3 --cmd "<测试命令>" --check   （可多次 --cmd）
 *   node orchestrator.mjs gate    --task <id> --gate GATE-2 --confirm                    （人工项确认后写 PASSED）
 *   node orchestrator.mjs advance --task <id> --to <phase>                               （校验进入条件）
 *   node orchestrator.mjs ccr     --task <id> --from <agent> --section "<契约章节>" --reason "<为何不成立>"
 *   node orchestrator.mjs ccr     --task <id> --resolve <ccr-id> --verdict APPROVED|REJECTED [--note "..."]
 *   node orchestrator.mjs status  --task <id>
 *   node orchestrator.mjs cost    --task <id>
 *
 * 自动化边界：AUTO 项（artifact 存在性 / schema 合法性 / signal 齐全 / round<=3 / 测试命令退出码）
 * 由本工具判定；MANUAL 项（语义质量）只打印提醒，由 --confirm 显式确认，工具不替人点头。
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/* ---------- 常量（与 schemas/handoff.schema.json、checklists/gates.md 对齐） ---------- */

const PHASES = ['P0-input', 'P1-requirement', 'P2-contract', 'P3-design', 'P4-review', 'P5-develop', 'P6-acceptance'];
const SIGNALS = ['REVIEW_REQUESTED', 'ACCEPTED', 'REJECTED', 'NEEDS_CHANGE', 'ESCALATED', 'CCR_SUBMITTED'];
const NEEDS_REASON = new Set(['REJECTED', 'NEEDS_CHANGE']);
const ARTIFACT_TYPES = ['requirement-spec', 'interface-contract', 'frontend-design', 'backend-design', 'design-review-report', 'acceptance-report', 'code', 'ccr'];
const ARTIFACT_STATUS = ['DRAFT', 'LOCKED', 'FROZEN'];
const LEVELS = ['S', 'M', 'L'];
const MAX_ROUNDS = 3;

/** 进入某阶段的前置条件（advance 时校验） */
const PHASE_ENTRY_REQ = {
  'P2-contract': { gate: 'GATE-1' },
  'P3-design': { artifact: 'interface-contract', status: 'LOCKED' },
  'P4-review': { artifacts: ['frontend-design', 'backend-design'] },
  'P5-develop': { gate: 'GATE-2' },
  'P6-acceptance': { gate: 'GATE-3' },
};

/** gate 的 AUTO 检查 + MANUAL 提醒（MANUAL 摘自 checklists/gates.md，不在此重复全文） */
const GATE_DEFS = {
  'GATE-1': {
    title: '需求冻结（需人确认）',
    auto: (s) => [
      ['requirement-spec 已产出', hasArtifact(s, 'requirement-spec')],
      ['无 blocking open_questions', !(s.open_questions || []).some((q) => q.blocking)],
      [`round ≤ ${MAX_ROUNDS}`, (s.round || 1) <= MAX_ROUNDS],
    ],
    manual: ['每条验收标准可判定', '术语表已定义', '资产陈述已附路径', 'out-of-scope 已写', '人确认需求范围'],
  },
  'GATE-2': {
    title: '设计评审通过（需人确认）',
    auto: (s) => [
      ['interface-contract 已 LOCKED', artifactStatus(s, 'interface-contract') === 'LOCKED'],
      ['契约未解决差异已清空（pending_ccr 无 OPEN）', !(s.pending_ccr || []).some((c) => c.status === 'OPEN')],
      ['frontend-design 已产出', hasArtifact(s, 'frontend-design')],
      ['backend-design 已产出', hasArtifact(s, 'backend-design')],
      ['两份设计引用的接口与契约版本一致', designContractVersionAligned(s)],
    ],
    manual: ['验收标准在两份设计中完全覆盖', '资产可验证：复用陈述有路径', '06 结论 APPROVED / APPROVED_WITH_CHANGES', '不可逆改动有回滚方案', '人确认设计可执行'],
  },
  'GATE-3': {
    title: '开发完成（自动 + 人抽查）',
    auto: (s) => [
      ['frontend-design / backend-design 已产出', hasArtifact(s, 'frontend-design') && hasArtifact(s, 'backend-design')],
      ['无 OPEN 状态的 CCR', !(s.pending_ccr || []).some((c) => c.status === 'OPEN')],
    ],
    manual: ['评审 P1 项已清零', '范围外问题已汇报未擅修'],
    cmds: true, // --cmd 传入的测试命令由本工具执行，退出码 0 才算过
  },
  'GATE-4': {
    title: '交付（需人确认）',
    auto: (s) => [
      ['acceptance-report 已产出', hasArtifact(s, 'acceptance-report')],
      [`round ≤ ${MAX_ROUNDS}`, (s.round || 1) <= MAX_ROUNDS],
    ],
    manual: ['L1 契约层 + L2 UI 层均 PASS（单层 PASS 是 CONTRACT_PASS，不得交付）', '每条 AC 有证据', '异常路径已验证', '回归通过', '人确认可交付'],
  },
};

/* ---------- 基础工具 ---------- */

const now = () => new Date().toISOString();
const die = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
const ok = (msg) => console.log(`✓ ${msg}`);

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) { args[key] = true; }
      else if (args[key] !== undefined) { args[key] = [].concat(args[key], next); i++; } // 重复 flag 自动成数组
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

function multi(args, key) {
  const raw = args[key];
  if (raw === undefined) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.flatMap((v) => String(v).split(',').map((s) => s.trim()).filter(Boolean));
}

function runsDir(root, task) { return path.join(root, '.workbuddy', 'runs', task); }
function statePath(root, task) { return path.join(runsDir(root, task), 'state.json'); }

function loadState(root, task) {
  const p = statePath(root, task);
  if (!fs.existsSync(p)) die(`state 不存在：${p}\n先跑 init --task ${task}`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveState(root, task, state) {
  state.updated_at = now();
  const dir = runsDir(root, task);
  fs.mkdirSync(path.join(dir, 'handoffs'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'gates'), { recursive: true });
  fs.writeFileSync(statePath(root, task), `${JSON.stringify(state, null, 2)}\n`);
}

function hasArtifact(s, type) { return (s.artifacts || []).some((a) => a.type === type); }
function artifactStatus(s, type) { const a = (s.artifacts || []).find((x) => x.type === type); return a ? a.status : null; }
function artifactVersion(s, type) { const a = (s.artifacts || []).find((x) => x.type === type); return a ? a.version : null; }

/** 两份设计记录的契约版本必须与契约当前版本一致（版本号从 handoff 的 --artifact 带入） */
function designContractVersionAligned(s) {
  const v = artifactVersion(s, 'interface-contract');
  if (!v) return false;
  return ['frontend-design', 'backend-design'].every((t) => {
    const a = (s.artifacts || []).find((x) => x.type === t);
    return a && a.contract_version === v;
  });
}

/** handoff 结构校验（按 schemas/handoff.schema.json 的 required + enum；不引第三方校验器） */
function validateHandoff(h) {
  const errs = [];
  for (const k of ['task_id', 'phase', 'from', 'to', 'goal', 'signal']) {
    if (h[k] === undefined || h[k] === '') errs.push(`缺少必填字段 ${k}`);
  }
  if (h.phase && !PHASES.includes(h.phase)) errs.push(`phase 非法：${h.phase}（可选 ${PHASES.join(' / ')}）`);
  if (h.signal && !SIGNALS.includes(h.signal)) errs.push(`signal 非法：${h.signal}（可选 ${SIGNALS.join(' / ')}）`);
  if (h.round !== undefined && (!Number.isInteger(h.round) || h.round < 1)) errs.push('round 必须是 ≥1 的整数');
  for (const a of h.artifacts || []) {
    if (!a.type || !a.path) errs.push('artifact 必须含 type 和 path');
    else if (!ARTIFACT_TYPES.includes(a.type)) errs.push(`artifact.type 非法：${a.type}`);
    if (a.status && !ARTIFACT_STATUS.includes(a.status)) errs.push(`artifact.status 非法：${a.status}`);
  }
  return errs;
}

function listHandoffs(root, task) {
  const dir = path.join(runsDir(root, task), 'handoffs');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => ({
    seq: Number.parseInt(f, 10),
    file: f,
    data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')),
  }));
}

function nextSeq(root, task) {
  const list = listHandoffs(root, task);
  return list.length ? list[list.length - 1].seq + 1 : 1;
}

function bumpPhaseRound(state, phase) {
  // round 语义：当前阶段的重试轮次。阶段切换时重置，同阶段内 ack REJECTED/NEEDS_CHANGE 时 +1
  if (state._round_phase !== phase) { state._round_phase = phase; state.round = 1; }
}

/* ---------- 子命令 ---------- */

function cmdInit(args) {
  const task = args.task || die('缺少 --task');
  if (!/^[a-z0-9][a-z0-9-]{1,63}$/i.test(task)) die('task id 只允许字母数字连字符，2-64 位');
  const level = (args.level || 'M').toUpperCase();
  if (!LEVELS.includes(level)) die(`--level 非法：${level}（${LEVELS.join(' / ')}）`);
  const root = path.resolve(args.root || process.cwd());
  const p = statePath(root, task);
  if (fs.existsSync(p)) die(`task 已存在：${p}\n续跑请用 status --task ${task}（断点恢复）`);
  const state = {
    task_id: task,
    task_level: level,
    phase: 'P0-input',
    round: 1,
    gates: {},
    artifacts: [],
    open_questions: [],
    pending_ccr: [],
    cost_log: [],
    handoff_seq: 0,
    created_at: now(),
    updated_at: now(),
  };
  saveState(root, task, state);
  ok(`初始化 ${p}`);
  console.log(`  level=${level} phase=P0-input —— 下一步：handoff --to 01-requirement-analyst --phase P1-requirement`);
}

function cmdHandoff(args) {
  const task = args.task || die('缺少 --task');
  const root = path.resolve(args.root || process.cwd());
  const state = loadState(root, task);
  const from = args.from || die('缺少 --from');
  const to = args.to || die('缺少 --to');
  const phase = args.phase || state.phase;
  const goal = args.goal || die('缺少 --goal（一句话说清本轮要达成什么）');

  const h = {
    task_id: task,
    task_level: state.task_level,
    phase,
    round: state.round || 1,
    from,
    to,
    goal,
    signal: args.signal || 'REVIEW_REQUESTED',
    current_state: args.state || undefined,
    completed_steps: multi(args, 'completed') || undefined,
    pending_steps: multi(args, 'pending') || undefined,
    constraints: multi(args, 'constraint'),
    artifacts: [],
    context_budget: {
      must_read: multi(args, 'read'),
      must_not_read: multi(args, 'not-read'),
      max_tokens: args['max-tokens'] ? Number(args['max-tokens']) : undefined,
      estimated_tokens: args['est-tokens'] ? Number(args['est-tokens']) : undefined,
    },
    open_questions: [],
    reject_reasons: [],
    timeout_budget: { max_rounds: MAX_ROUNDS, escalate_to: 'human' },
    seq: nextSeq(root, task),
    created_at: now(),
    ack: null,
  };

  for (const spec of multi(args, 'artifact')) {
    const [type, p2, version, status] = String(spec).split('|');
    if (!type || !p2) die(`--artifact 格式：type|path|version|status，收到「${spec}」`);
    h.artifacts.push({ type, path: p2, version, status });
  }
  for (const q of multi(args, 'blocking-question')) {
    h.open_questions.push({ id: `Q-${(state.open_questions || []).length + 1}`, question: q, blocking: true });
  }

  const errs = validateHandoff(h);
  if (errs.length) { errs.forEach((e) => console.error(`✗ ${e}`)); die('handoff 校验未过，未写入'); }

  // 同步 artifact 与 open_questions 进 state（state 是真相源）
  for (const a of h.artifacts) {
    const i = state.artifacts.findIndex((x) => x.type === a.type);
    const rec = { type: a.type, path: a.path, version: a.version, status: a.status || 'DRAFT' };
    if (a.type === 'frontend-design' || a.type === 'backend-design') {
      rec.contract_version = artifactVersion(state, 'interface-contract'); // 记下对齐的契约版本，GATE-2 要查
    }
    if (i >= 0) state.artifacts[i] = rec; else state.artifacts.push(rec);
  }
  for (const q of h.open_questions) if (!(state.open_questions || []).some((x) => x.question === q.question)) state.open_questions.push(q);
  state.handoff_seq = h.seq;
  bumpPhaseRound(state, phase);

  const file = `${String(h.seq).padStart(3, '0')}-${from}-to-${to}-${phase}.json`;
  saveState(root, task, state);
  fs.writeFileSync(path.join(runsDir(root, task), 'handoffs', file), `${JSON.stringify(h, null, 2)}\n`);
  ok(`handoff #${h.seq} → ${file}`);
  console.log(`  goal: ${goal}`);
  if (h.context_budget.max_tokens) console.log(`  token 预算: max=${h.context_budget.max_tokens} est=${h.context_budget.estimated_tokens || '未估'}`);
  console.log(`  等 ${to} 回 signal：ack --handoff ${h.seq} --signal ACCEPTED|REJECTED|NEEDS_CHANGE`);
}

function cmdAck(args) {
  const task = args.task || die('缺少 --task');
  const root = path.resolve(args.root || process.cwd());
  const state = loadState(root, task);
  const list = listHandoffs(root, task);
  if (!list.length) die('还没有 handoff 记录');
  const target = args.handoff === undefined || args.handoff === 'latest' ? list[list.length - 1] : list.find((x) => x.seq === Number(args.handoff));
  if (!target) die(`找不到 handoff #${args.handoff}`);
  const signal = (args.signal || '').toUpperCase();
  if (!SIGNALS.includes(signal)) die(`--signal 非法：${signal}（${SIGNALS.join(' / ')}）`);
  const reasons = multi(args, 'reason');
  if (NEEDS_REASON.has(signal) && !reasons.length) die(`${signal} 必须带 --reason（可执行的修订项，不许「我觉得不好」）`);

  const rejectReasons = reasons.map((r, i) => {
    const m = /^(P0|P1|P2)\s*[|:：]?\s*(.*)$/.exec(r);
    return m ? { severity: m[1], description: m[2], location: args.location || undefined, required_change: args.change || undefined }
             : { severity: 'P1', description: r, location: args.location || undefined, required_change: args.change || undefined };
  });

  target.data.ack = { signal, at: now(), reject_reasons: rejectReasons };
  fs.writeFileSync(path.join(runsDir(root, task), 'handoffs', target.file), `${JSON.stringify(target.data, null, 2)}\n`);

  if (signal === 'REJECTED' || signal === 'NEEDS_CHANGE') {
    state.round = (state.round || 1) + 1;
    saveState(root, task, state);
    ok(`#${target.seq} → ${signal}（${state._round_phase || state.phase} round=${state.round}）`);
    if (state.round > MAX_ROUNDS) {
      console.log(`⏭ round ${state.round} > ${MAX_ROUNDS} —— 熔断：停止循环，输出分歧摘要交人二选一（模板见 agents/00-orchestrator.md）`);
    }
  } else {
    // ACCEPTED / ESCALATED / CCR_SUBMITTED：若本阶段已有 ACCEPTED 回执，推进 stage round 计数
    saveState(root, task, state);
    ok(`#${target.seq} → ${signal}`);
  }
  if (rejectReasons.length) rejectReasons.forEach((r, i) => console.log(`  [${r.severity}] ${i + 1}. ${r.description}`));
}

function cmdGate(args) {
  const task = args.task || die('缺少 --task');
  const root = path.resolve(args.root || process.cwd());
  const state = loadState(root, task);
  const gate = (args.gate || '').toUpperCase();
  const def = GATE_DEFS[gate];
  if (!def) die(`--gate 非法：${gate}（${Object.keys(GATE_DEFS).join(' / ')}）`);

  if (args.confirm) {
    const g = state.gates[gate];
    if (!g || g.status !== 'AUTO_PASSED') die(`先跑 gate --gate ${gate} --check 且自动项全过，再 --confirm（当前：${g ? g.status : '未检查'}）`);
    state.gates[gate] = { status: 'PASSED', at: now(), auto: g.auto, manual_confirmed_by: 'human' };
    saveState(root, task, state);
    ok(`${gate} PASSED（人工项已确认）`);
    const next = Object.entries(PHASE_ENTRY_REQ).find(([, req]) => req.gate === gate);
    if (next) console.log(`  可推进：advance --to ${next[0]}`);
    return;
  }

  // --check：跑 AUTO 项 + 打印 MANUAL 提醒
  const results = def.auto(state).map(([name, pass]) => ({ name, pass: Boolean(pass) }));
  const cmds = multi(args, 'cmd');
  if (def.cmds && cmds.length) {
    for (const c of cmds) {
      const r = spawnSync(c, { shell: true, cwd: root, encoding: 'utf8', timeout: 120000 });
      const pass = r.status === 0 && !r.error;
      results.push({ name: `命令：${c}`, pass, output: pass ? undefined : String(r.error?.message || r.stderr || r.stdout).slice(0, 500) });
    }
  }
  const autoFail = results.filter((r) => !r.pass);
  results.forEach((r) => {
    console.log(`  ${r.pass ? '✓' : '✗'} [AUTO] ${r.name}`);
    if (!r.pass && r.output) console.log(`      ${r.output.split('\n').slice(0, 3).join('\n      ')}`);
  });
  def.manual.forEach((m) => console.log(`  👤 [MANUAL] ${m}`));
  const prev = state.gates[gate];
  const newStatus = autoFail.length ? 'FAILED' : 'AUTO_PASSED';
  // 已 PASSED（人确认过）的 gate 不被自动检查降级——PASSED 是历史结论，未过项仅作遗留提醒
  // （典型场景：GATE-2 已 PASSED 进开发，Phase 5 新提未决 CCR，再 check 不应追溯性废掉 GATE-2）
  if (prev && prev.status === 'PASSED' && autoFail.length) {
    console.log(`\n⚠ ${gate} 此前已 PASSED，保留该结论；${autoFail.length} 个未过项作为遗留提醒`);
    state.gates[gate] = { ...prev, last_auto_warning: results };
  } else {
    state.gates[gate] = { status: newStatus, at: now(), auto: results };
  }
  saveState(root, task, state);
  const snap = path.join(runsDir(root, task), 'gates', `${gate}.json`);
  fs.writeFileSync(snap, `${JSON.stringify(state.gates[gate], null, 2)}\n`);
  console.log('');
  if (autoFail.length) { console.log(`✗ ${gate} ${def.title}：${autoFail.length} 个自动项未过，修完再 check`); process.exit(1); }
  console.log(`✓ ${gate} ${def.title}：自动项全过。人工项（👤）逐条确认后：gate --gate ${gate} --confirm`);
}

function cmdAdvance(args) {
  const task = args.task || die('缺少 --task');
  const root = path.resolve(args.root || process.cwd());
  const state = loadState(root, task);
  const to = args.to || die('缺少 --to');
  if (!PHASES.includes(to)) die(`--to 非法：${to}（${PHASES.join(' / ')}）`);
  const cur = PHASES.indexOf(state.phase);
  if (PHASES.indexOf(to) <= cur) die(`不能回退：当前 ${state.phase} → ${to}（返工走根因分层，见 SKILL.md）`);

  const req = PHASE_ENTRY_REQ[to];
  if (req) {
    if (req.gate) {
      const g = state.gates[req.gate];
      if (!g || g.status !== 'PASSED') die(`进入 ${to} 需要 ${req.gate} PASSED（当前：${g ? g.status : '未检查'}）`);
    }
    if (req.artifact && artifactStatus(state, req.artifact) !== req.status) {
      die(`进入 ${to} 需要 ${req.artifact} 状态为 ${req.status}（当前：${artifactStatus(state, req.artifact) || '不存在'}）`);
    }
    if (req.artifacts) {
      const missing = req.artifacts.filter((t) => !hasArtifact(state, t));
      if (missing.length) die(`进入 ${to} 缺少 artifact：${missing.join(' / ')}`);
    }
  }
  // 记录上一阶段成本
  const phaseCost = listHandoffs(root, task).filter((x) => x.data.phase === state.phase).reduce((sum, x) => sum + (x.data.context_budget?.estimated_tokens || 0), 0);
  if (phaseCost) state.cost_log.push({ phase: state.phase, estimated_tokens: phaseCost, rounds: state.round || 1 });

  state.phase = to;
  state.round = 1;
  state._round_phase = to;
  saveState(root, task, state);
  ok(`推进到 ${to}`);
  const nextRole = { 'P1-requirement': '01-requirement-analyst', 'P2-contract': '03-frontend-architect / 04-backend-architect（并行）', 'P3-design': '03 / 04（并行）', 'P4-review': '06-design-reviewer', 'P5-develop': '07-developer（并行）', 'P6-acceptance': '08-qa-acceptance' }[to];
  if (nextRole) console.log(`  下一棒：${nextRole}`);
}

function cmdCcr(args) {
  const task = args.task || die('缺少 --task');
  const root = path.resolve(args.root || process.cwd());
  const state = loadState(root, task);
  if (args.resolve) {
    const c = (state.pending_ccr || []).find((x) => x.id === args.resolve);
    if (!c) die(`找不到 CCR ${args.resolve}`);
    const verdict = (args.verdict || '').toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(verdict)) die('--verdict 只能 APPROVED / REJECTED');
    c.status = verdict === 'APPROVED' ? 'RESOLVED' : 'REJECTED';
    c.resolved_at = now();
    c.verdict_note = args.note;
    saveState(root, task, state);
    ok(`CCR ${c.id} → ${c.status}${verdict === 'APPROVED' ? '（记得同步通知受影响方 + 推契约新版本）' : ''}`);
    if (verdict === 'APPROVED') console.log('  后续：handoff --artifact interface-contract|<path>|<新版本>|LOCKED 推新契约版本');
    return;
  }
  const from = args.from || die('缺少 --from');
  const section = args.section || die('缺少 --section（契约章节，如 §2 IF-1）');
  const reason = args.reason || die('缺少 --reason（为何现状不成立）');
  const id = `CCR-${String((state.pending_ccr || []).length + 1).padStart(2, '0')}`;
  state.pending_ccr = state.pending_ccr || [];
  state.pending_ccr.push({ id, from, section, reason, status: 'OPEN', at: now() });
  saveState(root, task, state);
  ok(`${id} 已记录（OPEN）→ 交 05-integration-negotiator 裁决：ccr --resolve ${id} --verdict APPROVED|REJECTED`);
}

function cmdStatus(args) {
  const task = args.task || die('缺少 --task');
  const root = path.resolve(args.root || process.cwd());
  const state = loadState(root, task);
  const list = listHandoffs(root, task);
  console.log(`task ${state.task_id} · level=${state.task_level} · phase=${state.phase} · round=${state.round || 1}`);
  console.log(`gates: ${Object.entries(state.gates).map(([k, v]) => `${k}=${v.status}`).join(' · ') || '（未检查）'}`);
  console.log(`artifacts:`);
  (state.artifacts || []).forEach((a) => console.log(`  - ${a.type} ${a.version || ''} [${a.status}] ${a.path}`));
  const openQ = (state.open_questions || []).filter((q) => q.blocking);
  if (openQ.length) console.log(`blocking questions: ${openQ.map((q) => q.id).join(', ')}`);
  const openCcr = (state.pending_ccr || []).filter((c) => c.status === 'OPEN');
  if (openCcr.length) console.log(`open CCR: ${openCcr.map((c) => `${c.id}(${c.section})`).join(', ')}`);
  const last = list[list.length - 1];
  if (last) console.log(`last handoff: #${last.seq} ${last.data.from} → ${last.data.to} ack=${last.data.ack ? last.data.ack.signal : '待回执'}`);
  const cost = (state.cost_log || []).reduce((s, c) => s + c.estimated_tokens, 0);
  if (cost) console.log(`cost_log 累计: ${cost.toLocaleString()} tokens（明细：cost --task ${task}）`);
  console.log(`updated: ${state.updated_at}`);
}

function cmdCost(args) {
  const task = args.task || die('缺少 --task');
  const root = path.resolve(args.root || process.cwd());
  const state = loadState(root, task);
  const byPhase = {};
  for (const x of listHandoffs(root, task)) {
    const est = x.data.context_budget?.estimated_tokens || 0;
    byPhase[x.data.phase] = (byPhase[x.data.phase] || 0) + est;
  }
  console.log(`task ${task} 投递预算（estimated_tokens 按 handoff 累加）：`);
  let total = 0;
  for (const [p, v] of Object.entries(byPhase)) { console.log(`  ${p.padEnd(16)} ${v.toLocaleString()}`); total += v; }
  console.log(`  ${'合计'.padEnd(14)} ${total.toLocaleString()}`);
  console.log('  （真实消耗需 Agent 侧上报，此处为编排侧预估值，用于校准 max_tokens）');
}

/* ---------- 入口 ---------- */

const USAGE = `子命令：init | handoff | ack | gate | advance | ccr | status | cost
详细参数见文件头注释，或 tools/README.md`;

/** 子命令可在任意位置（含全局参数前后）：跳过 --flag 及其值后，第一个命中子命令表的 token 即 cmd */
function extractCmd(argv, table) {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { i++; continue; }
    if (table[argv[i]]) return { cmd: argv[i], rest: [...argv.slice(0, i), ...argv.slice(i + 1)] };
  }
  return { cmd: null, rest: argv };
}

function main() {
  const table = { init: cmdInit, handoff: cmdHandoff, ack: cmdAck, gate: cmdGate, advance: cmdAdvance, ccr: cmdCcr, status: cmdStatus, cost: cmdCost };
  const { cmd, rest } = extractCmd(process.argv.slice(2), table);
  if (!cmd) { console.log(USAGE); process.exit(process.argv.length > 2 ? 1 : 0); }
  const args = parseArgs(rest);
  table[cmd](args);
}

main();
