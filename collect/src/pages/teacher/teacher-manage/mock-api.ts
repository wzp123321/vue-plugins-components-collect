/**
 * 契约 mock 实现（契约 §2 IF-1 ~ IF-6）
 *
 * 演练用：后端未就位，这里按 interface-contract.md v2 逐字实现接口语义，
 * 包括逻辑删除、乐观锁、工号唯一、引用检查、错误码。
 * 后端就绪后，把本文件替换为真实 axios 请求即可，页面代码无需改动。
 */

import {
  SUBJECT_OPTIONS,
  type ApiErrorCode,
  type Subject,
  type Teacher,
  type TeacherCreatePayload,
  type TeacherListQuery,
  type TeacherListResult,
  type TeacherReferences,
  type TeacherStatus,
  type TeacherUpdatePayload,
} from './types';

export class ContractError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ContractError';
  }
}

/** 演示用权限开关：切到 false 可验证 AC-7（无 edit 权限时操作按钮不渲染） */
export const mockPerms = { view: true, edit: true };

const LATENCY = 180;
const sleep = (ms = LATENCY) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const SURNAMES = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
const GIVEN = ['伟', '芳', '娜', '敏', '静', '磊', '强', '洋', '艳', '勇'];

interface Row extends Teacher {
  isDeleted: number;
  createAt: number;
}

/** 50 条种子数据，用于验证 AC-1（3 页，每页 20 条） */
function seed(): Row[] {
  const list: Row[] = [];
  for (let i = 0; i < 50; i += 1) {
    const id = `t-${String(i + 1).padStart(3, '0')}`;
    list.push({
      id,
      name: `${SURNAMES[i % SURNAMES.length]}${GIVEN[(i * 3) % GIVEN.length]}`,
      code: `T${String(i + 1).padStart(4, '0')}`,
      phone: `13${String(100000000 + i * 1234567).slice(0, 9)}`,
      subject: SUBJECT_OPTIONS[i % SUBJECT_OPTIONS.length] as Subject,
      status: (i % 9 === 0 ? 'off' : 'on') as TeacherStatus,
      hireDate: `20${10 + (i % 15)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      version: 0,
      isDeleted: 0,
      createAt: Date.now() - i * 86400000,
    });
  }
  return list;
}

const db: Row[] = seed();
let seq = db.length;

const alive = () => db.filter((r) => r.isDeleted === 0);
const toTeacher = (r: Row): Teacher => ({
  id: r.id,
  name: r.name,
  code: r.code,
  phone: r.phone,
  subject: r.subject,
  status: r.status,
  hireDate: r.hireDate,
  version: r.version,
});

function assertEdit() {
  if (!mockPerms.edit) throw new ContractError('E_NO_PERM', '无操作权限');
}

function validate(payload: Partial<TeacherCreatePayload>) {
  const name = (payload.name ?? '').trim();
  if (!name || name.length > 32) throw new ContractError('E_PARAM', '姓名为 1-32 个字符');
  const code = (payload.code ?? '').trim();
  if (!/^[A-Za-z0-9]{4,16}$/.test(code)) throw new ContractError('E_PARAM', '工号为 4-16 位字母或数字');
  if (!/^1\d{10}$/.test((payload.phone ?? '').trim())) throw new ContractError('E_PARAM', '手机号格式不正确');
  if (!payload.hireDate) throw new ContractError('E_PARAM', '请选择入职日期');
  return { name, code, phone: payload.phone!.trim(), subject: payload.subject!, hireDate: payload.hireDate! };
}

/** IF-1 列表（分页 + 姓名模糊 + 学科/状态筛选） */
export async function fetchTeachers(q: TeacherListQuery): Promise<TeacherListResult> {
  await sleep();
  const page = Math.max(1, q.page ?? 1);
  const size = Math.min(100, Math.max(1, q.size ?? 20));

  let rows = alive();
  if (q.keyword?.trim()) {
    const kw = q.keyword.trim();
    rows = rows.filter((r) => r.name.includes(kw));
  }
  if (q.subject) rows = rows.filter((r) => r.subject === q.subject);
  if (q.status) rows = rows.filter((r) => r.status === q.status);

  const total = rows.length;
  const start = (page - 1) * size;
  return { list: rows.slice(start, start + size).map(toTeacher), total };
}

/** IF-2 详情 */
export async function fetchTeacher(id: string): Promise<Teacher> {
  await sleep(80);
  const row = db.find((r) => r.id === id && r.isDeleted === 0);
  if (!row) throw new ContractError('E_NOT_FOUND', '记录不存在或已删除');
  return toTeacher(row);
}

/** IF-3 新增 */
export async function createTeacher(payload: TeacherCreatePayload): Promise<Teacher> {
  await sleep();
  assertEdit();
  const v = validate(payload);
  if (alive().some((r) => r.code === v.code)) {
    throw new ContractError('E_DUPLICATE_CODE', `工号 ${v.code} 已存在`);
  }
  seq += 1;
  const row: Row = {
    id: `t-${seq}`,
    ...v,
    status: 'on',
    version: 0,
    isDeleted: 0,
    createAt: Date.now(),
  };
  db.unshift(row);
  return toTeacher(row);
}

/** IF-4 编辑（version 乐观锁：不一致返回 E_VERSION_CONFLICT，不覆盖） */
export async function updateTeacher(id: string, payload: TeacherUpdatePayload): Promise<Teacher> {
  await sleep();
  assertEdit();
  const row = db.find((r) => r.id === id && r.isDeleted === 0);
  if (!row) throw new ContractError('E_NOT_FOUND', '记录不存在或已删除');
  if (row.version !== payload.version) {
    throw new ContractError('E_VERSION_CONFLICT', '数据已被他人更新，请刷新后重试');
  }
  const v = validate(payload);
  if (alive().some((r) => r.code === v.code && r.id !== id)) {
    throw new ContractError('E_DUPLICATE_CODE', `工号 ${v.code} 已存在`);
  }
  Object.assign(row, v, { version: row.version + 1 });
  return toTeacher(row);
}

/** IF-5 逻辑删除（置 is_deleted=1，不做物理删除） */
export async function deleteTeacher(id: string): Promise<{ id: string; deleted: boolean }> {
  await sleep();
  assertEdit();
  const row = db.find((r) => r.id === id);
  if (!row || row.isDeleted === 1) throw new ContractError('E_NOT_FOUND', '记录不存在或已删除');
  row.isDeleted = 1;
  return { id, deleted: true };
}

/** IF-5a 删除前引用检查；排课模块不可用时返回 -1（前端降级为通用确认框） */
export async function fetchReferences(id: string): Promise<TeacherReferences> {
  await sleep(80);
  const row = db.find((r) => r.id === id && r.isDeleted === 0);
  if (!row) throw new ContractError('E_NOT_FOUND', '记录不存在或已删除');
  const idx = Number(row.id.split('-')[1]) || 0;
  const courseCount = [0, 2, 3, 0, 1][idx % 5];
  return { courseCount, lessonCount: courseCount * 6 };
}

/** IF-6 工号查重（excludeId 用于编辑时排除自身） */
export async function checkCode(code: string, excludeId?: string): Promise<{ exists: boolean }> {
  await sleep(60);
  const c = code.trim();
  if (!c) return { exists: false };
  return { exists: alive().some((r) => r.code === c && r.id !== excludeId) };
}

/** 演练辅助：模拟他人修改了某条记录，用于验证 AC-10 并发冲突 */
export async function simulateConcurrentEdit(id: string): Promise<void> {
  const row = db.find((r) => r.id === id && r.isDeleted === 0);
  if (row) {
    row.name = `${row.name}（他人已改）`;
    row.version += 1;
  }
}
