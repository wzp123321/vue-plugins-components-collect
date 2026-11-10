/**
 * BI 数据录入 —— 声明式校验引擎
 *
 * 覆盖 vxe 录入台的全部规则维度：必填 / 数值范围 / 整数 / 文本长度 / 正则 / 整列唯一 /
 * 跨列关系（gte·lte·eq·requiredIf）/ 服务端 mock 兜底。
 *
 * 两个路径分开，这是性能关键：
 *   1) 热路径 checkCell(row, field)：编辑一格只校验这一格 + 反向依赖它的跨列规则，不扫全表；
 *   2) 冷路径 scanAll(rows)：结构变更 / 打开抽屉 / 提交前全量重算。
 * 唯一性规则是例外：值变了会影响「另一个与它重复的行」，所以对唯一列做一次整列重校（O(n)）。
 *
 * 错误同时维护两份索引：errors 数组（面板展示，需行号排序）与 errMap（列 style 回调 O(1) 查，
 * 只认 rowId + field —— 不能用行下标，过滤/排序/分页后会错位）。
 */
import { ref, shallowRef, type Ref } from 'vue';
import { isBlank, isRealDate, numOf, type BiCol, type BiRow, type CrossKind } from './schema';

export interface ErrItem {
  key: string;
  rowId: string;
  rowNo: number;
  field: string;
  label: string;
  msg: string;
}

const errKey = (rowId: string, field: string) => `${rowId}\u0001${field}`;

export const useBiValidation = (cols: Ref<BiCol[]>) => {
  /** 服务端校验开关：演示「前端规则 + 服务端规则」合并，真实项目换成接口返回 */
  const serverMode = ref(false);

  const errors = shallowRef<ErrItem[]>([]);
  const errorCount = ref(0);
  /** rowId::field → 错误文案（列 style 回调直接查，O(1)） */
  const errMap = new Map<string, string>();
  /** rowId::field → errors 下标（增量替换/删除用） */
  const errIndex = new Map<string, number>();
  /** 唯一列的 value → 出现次数 */
  const uniqueMaps = new Map<string, Map<string, number>>();

  const labelOf = (field: string) => cols.value.find((c) => c.field === field)?.label ?? field;

  // ============================ 唯一值索引 ============================
  const rebuildUnique = (rows: readonly BiRow[]) => {
    uniqueMaps.clear();
    cols.value
      .filter((c) => c.rules?.unique)
      .forEach((c) => {
        const m = new Map<string, number>();
        rows.forEach((r) => {
          const v = String(r[c.field] ?? '');
          if (!isBlank(v)) {
            m.set(v, (m.get(v) ?? 0) + 1);
          }
        });
        uniqueMaps.set(c.field, m);
      });
  };

  const noteUniqueEdit = (rows: readonly BiRow[], field: string, before: unknown, after: unknown) => {
    const m = uniqueMaps.get(field);
    if (!m) {
      return;
    }
    const b = String(before ?? '');
    const a = String(after ?? '');
    if (!isBlank(b)) {
      const n = (m.get(b) ?? 0) - 1;
      if (n <= 0) {
        m.delete(b);
      } else {
        m.set(b, n);
      }
    }
    if (!isBlank(a)) {
      m.set(a, (m.get(a) ?? 0) + 1);
    }
    // 计数可能失真（撤销/导入等整体替换），下一次全量扫描会重建
    if (rows.length === 0) {
      uniqueMaps.delete(field);
    }
  };

  // ============================ 规则判定 ============================
  const checkServer = (field: string, value: unknown): string | null => {
    if (!serverMode.value) {
      return null;
    }
    if (field === 'product' && String(value ?? '').trim().startsWith('测试')) {
      return '服务端：疑似测试数据，请修正产品名称';
    }
    if (field === 'rate' && numOf(value) !== null && (numOf(value) as number) > 100) {
      return '服务端：完成率超 100 需复核';
    }
    return null;
  };

/** 三种比较语义：gte / lte / eq */
const compareHit = <T extends number | string>(kind: CrossKind, a: T, b: T, msg: string): string | null => {
  if (kind === 'gte' && a < b) {
    return msg;
  }
  if (kind === 'lte' && a > b) {
    return msg;
  }
  if (kind === 'eq' && a !== b) {
    return msg;
  }
  return null;
};

const checkCross = (row: BiRow, col: BiCol): string | null => {
    if (!col.cross?.length) {
      return null;
    }
    let hit: string | null = null;
    // 逐条判定，命中第一条即返回（不用 continue，减少分支噪音）
    col.cross.some((rule) => {
      const other = cols.value.find((c) => c.field === rule.other);
      // 参照列被删掉时规则自动失效，不留幽灵错误
      if (!other) {
        return false;
      }
      const mine = row[col.field];
      const theirs = row[rule.other];
      const msg = rule.msg || '跨列校验未通过';
      if (rule.kind === 'requiredIf') {
        const trigger = !isBlank(theirs);
        hit = trigger && isBlank(mine) ? msg : null;
        return Boolean(hit);
      }
      if (isBlank(mine) || isBlank(theirs)) {
        return false;
      }
      if (other.type === 'number' || col.type === 'number') {
        const a = numOf(mine);
        const b = numOf(theirs);
        if (a === null || b === null) {
          return false;
        }
        hit = compareHit(rule.kind, a, b, msg);
        return Boolean(hit);
      }
      // 日期/文本按字符串比较：ISO 日期字典序即时间序
      hit = compareHit(rule.kind, String(mine), String(theirs), msg);
      return Boolean(hit);
    });
    return hit;
  };

  /** 单格校验（含跨列与服务端），返回错误文案或 null */
  const checkCell = (row: BiRow, field: string): string | null => {
    const col = cols.value.find((c) => c.field === field);
    if (!col) {
      return null;
    }
    const value = row[field];
    if (isBlank(value)) {
      return col.required ? '必填' : null;
    }
    if (col.type === 'select' && col.options?.length) {
      return col.options.includes(String(value)) ? null : `必须是 ${col.options.join(' / ')} 之一`;
    }
    if (col.type === 'date') {
      return isRealDate(String(value)) ? null : '日期格式应为 YYYY-MM-DD';
    }
    if (col.type === 'number') {
      const n = numOf(value);
      if (n === null) {
        return '必须是数字';
      }
      const r = col.rules;
      if (r?.integer && !Number.isInteger(n)) {
        return '必须是整数';
      }
      if (r?.min !== undefined && n < r.min) {
        return `不能小于 ${r.min}`;
      }
      if (r?.max !== undefined && n > r.max) {
        return `不能大于 ${r.max}`;
      }
    }
    const rules = col.rules;
    if (rules) {
      const s = String(value);
      if (rules.minLen !== undefined && s.length < rules.minLen) {
        return `长度不能少于 ${rules.minLen} 个字符`;
      }
      if (rules.maxLen !== undefined && s.length > rules.maxLen) {
        return `长度不能超过 ${rules.maxLen} 个字符`;
      }
      if (rules.pattern) {
        let re: RegExp | null = null;
        try {
          re = new RegExp(rules.pattern);
        } catch {
          re = null;
        }
        if (re && !re.test(s)) {
          return rules.patternMsg || '格式不符合要求';
        }
      }
      if (rules.unique) {
        const n = uniqueMaps.get(field)?.get(s) ?? 0;
        if (n > 1) {
          return '该值不可重复';
        }
      }
    }
    return checkCross(row, col) ?? checkServer(field, value);
  };

  // ============================ 错误索引维护 ============================
  const rebuildErrIndex = () => {
    errIndex.clear();
    errors.value.forEach((e, i) => errIndex.set(e.key, i));
  };

  const putError = (item: ErrItem) => {
    const at = errIndex.get(item.key) ?? -1;
    errMap.set(item.key, item.msg);
    if (at >= 0) {
      errors.value[at] = item;
    } else {
      errors.value.push(item);
      errIndex.set(item.key, errors.value.length - 1);
    }
  };

  const dropError = (key: string) => {
    errMap.delete(key);
    const at = errIndex.get(key) ?? -1;
    if (at >= 0) {
      errors.value.splice(at, 1);
      rebuildErrIndex();
    }
  };

  /** 热路径：编辑一格后只更新这一格（及跨列反查由调用方触发的相邻列） */
  const setCellError = (row: BiRow, field: string) => {
    const key = errKey(row.rowId, field);
    const msg = checkCell(row, field);
    if (msg) {
      putError({ key, rowId: row.rowId, rowNo: Number(row.rowNo) || 0, field, label: labelOf(field), msg });
    } else {
      dropError(key);
    }
    errorCount.value = errors.value.length;
  };

  /** 冷路径：全量重算（结构变更 / 打开抽屉 / 提交前） */
  const scanAll = (rows: readonly BiRow[]) => {
    rebuildUnique(rows);
    const list: ErrItem[] = [];
    errMap.clear();
    rows.forEach((row, i) => {
      const rowNo = Number(row.rowNo) || i + 1;
      cols.value.forEach((c) => {
        const msg = checkCell(row, c.field);
        if (msg) {
          const key = errKey(row.rowId, c.field);
          errMap.set(key, msg);
          list.push({ key, rowId: row.rowId, rowNo, field: c.field, label: c.label, msg });
        }
      });
    });
    errors.value = list;
    rebuildErrIndex();
    errorCount.value = list.length;
  };

  /** 某一列整体重校（唯一列改动后调用：另一个重复行的错误也会变） */
  const revalidateColumn = (rows: readonly BiRow[], field: string) => {
    rows.forEach((row) => {
      setCellError(row, field);
    });
  };

  /** 反向依赖：改了 other 列，所有以它为参照的跨列规则要重校 */
  const dependentFields = (field: string): string[] =>
    cols.value.filter((c) => c.cross?.some((r) => r.other === field)).map((c) => c.field);

  return {
    serverMode,
    errors,
    errorCount,
    errMap,
    labelOf,
    checkCell,
    setCellError,
    scanAll,
    revalidateColumn,
    dependentFields,
    rebuildUnique,
    noteUniqueEdit,
  };
};

export type BiValidationApi = ReturnType<typeof useBiValidation>;
