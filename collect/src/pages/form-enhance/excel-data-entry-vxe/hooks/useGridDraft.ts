// 草稿保护：自动把「行数据 + 列结构」快照到 localStorage，刷新/关闭前拦截提示。
// 设计要点：
// - 只在有未提交改动（dirtyCount>0）时写，避免空表也占存储
// - 间隔轮询而非 deep watch：watch 全表在万行级会形成持续 diff 开销，轮询 + dirty 判断更便宜
// - 超过 MAX_ROWS 不存（JSON 序列化会明显卡顿），并给一次提示
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { GridCore } from './useGridCore';
import type { ColDef, Row } from '../types';

const KEY = 'vxe_entry_draft';
const MAX_ROWS = 20000;
const INTERVAL = 5000;

interface Draft {
  ts: number;
  rows: Row[];
  defs: ColDef[];
}

/**
 * 草稿保护：自动把「行数据 + 列结构」快照到 localStorage，刷新/关闭前拦截提示。
 *
 * 在整体架构中的角色：本层只与 core 交互（读 allRows / columnDefs / dirtyCount，写回时恢复并 revalidateAll），
 * 由 useGridOps 在提交成功后调用 clearDraft 清草稿。设计上用间隔轮询（而非 deep watch）做自动保存，
 * 避免万行级全表 diff 的持续开销；超过 MAX_ROWS 主动停用自动草稿以防序列化卡顿。
 *
 * @param core 核心状态实例
 */
export function useGridDraft(core: GridCore) {
  const hasDraft = ref(false);
  const savedAt = ref(0);
  const autoSave = ref(true);
  let timer: number | null = null;
  let tooLargeWarned = false;

  /**
   * 立即保存草稿：仅在 autoSave 开启且有未提交改动（dirtyCount>0）时写入 localStorage；
   * 超过 MAX_ROWS 时停用并提示一次（JSON 序列化会明显卡顿）。配额超限静默降级，不打断录入。
   */
  const saveNow = () => {
    if (!autoSave.value) return;
    if (!core.dirtyCount.value) return;
    const rows = core.allRows.value;
    if (rows.length > MAX_ROWS) {
      if (!tooLargeWarned) {
        tooLargeWarned = true;
        ElMessage.warning(`数据量超过 ${MAX_ROWS.toLocaleString()} 行，自动草稿已停用（避免写入卡顿）`);
      }
      return;
    }
    const draft: Draft = {
      ts: Date.now(),
      rows: rows.map((r) => ({ ...r })),
      defs: JSON.parse(JSON.stringify(core.columnDefs.value)) as ColDef[],
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(draft));
      savedAt.value = draft.ts;
      hasDraft.value = true;
    } catch {
      // 配额超限：静默降级，不打断录入
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(KEY);
    savedAt.value = 0;
    hasDraft.value = false;
  };

  const readDraft = (): Draft | null => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const d = JSON.parse(raw) as Draft;
      return Array.isArray(d?.rows) ? d : null;
    } catch {
      return null;
    }
  };

  /** 启动时若存在草稿则询问恢复；恢复后立即重校（错误标记必须与恢复后的数据一致） */
  const checkDraft = () => {
    const d = readDraft();
    if (!d || !d.rows.length) return;
    const when = new Date(d.ts);
    const hhmm = `${String(when.getMonth() + 1).padStart(2, '0')}-${String(when.getDate()).padStart(2, '0')} ${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`;
    ElMessageBox.confirm(`检测到 ${hhmm} 的未提交草稿（${d.rows.length.toLocaleString()} 行），是否恢复？`, '恢复草稿', {
      confirmButtonText: '恢复',
      cancelButtonText: '丢弃',
      type: 'info',
    })
      .then(() => {
        core.allRows.value = d.rows;
        if (d.defs?.length) core.columnDefs.value = d.defs;
        core.revalidateAll();
        core.bumpData();
        hasDraft.value = true;
        savedAt.value = d.ts;
        ElMessage.success('草稿已恢复');
      })
      .catch((e: any) => {
        if (e === 'cancel') clearDraft();
      });
  };

  // ⚠️ 坑：刷新/关闭拦截——有未提交改动时提示；但浏览器只允许显示通用文案，无法自定义消息内容
  // （returnValue='' 即可触发原生确认框）。
  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!core.dirtyCount.value) return;
    e.preventDefault();
    e.returnValue = '';
  };

  onMounted(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeunload', onBeforeUnload);
    timer = window.setInterval(saveNow, INTERVAL);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', onBeforeUnload);
    if (timer) window.clearInterval(timer);
    timer = null;
  });

  return { hasDraft, savedAt, autoSave, saveNow, clearDraft, readDraft, checkDraft };
}

/**
 * useGridDraft 的返回类型别名：导出 { hasDraft, savedAt, autoSave, saveNow, clearDraft,
 * readDraft, checkDraft }，供工具栏/启动恢复与提交后清草稿调用。
 */
export type GridDraft = ReturnType<typeof useGridDraft>;
