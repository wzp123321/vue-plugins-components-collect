// 列结构模板：localStorage 持久化（保存 / 加载 / 删除），加载时可选择保留或清空数据
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { rowIdOf, dirtyOf, type GridCore } from './useGridCore';
import { type ColDef, type Tpl, emptyValueFor } from '../types';

const TPL_KEY = 'vxe_entry_templates';

/** vxe 行数据模型键名（row-config.keyField 绑定 / 全模块消费，外部约定不可重命名） */
const ROW_ID_KEY = '__id';
const ROW_DIRTY_KEY = '__dirty';

/**
 * 列结构模板：localStorage 持久化（保存 / 加载 / 删除），加载时可选择保留或清空数据。
 *
 * 在整体架构中的角色：本层只改 core.columnDefs 与行数据，是"列结构"的导入/导出点——
 * 套用模板会整体替换列结构（先 snap 入撤销栈），并按 keepData 决定保留现有数据还是清空。
 * 与 useGridOps（加/删列）、useGridCore（revalidateAll）协作，套模板后必须全量重校。
 *
 * @param core 核心状态实例
 */
export const useGridTemplates = (core: GridCore) => {
  const templates = ref<Tpl[]>([]);
  const tplDialogVisible = ref(false);
  const tplName = ref('');
  const snap = () => core.pushSnapshot(core.snapshotNow());

  /** 从 localStorage 读取模板列表（onMounted 时调用一次；JSON 损坏时降级为空列表） */
  const loadTemplates = () => {
    try {
      templates.value = JSON.parse(localStorage.getItem(TPL_KEY) || '[]');
    } catch {
      templates.value = [];
    }
  };
  /**
   * 应用模板：整体替换列结构（先 snap 入撤销栈）。keepData=true 时按新字段裁剪/补齐行数据；
   * keepData=false 时新建空数据行（数字列填 null、其余空串）。最后清空错误标记并全量重校。
   * @param t 模板对象（含 defs 列结构）
   * @param keepData 是否保留现有数据
   */
  const applyTpl = (t: Tpl, keepData: boolean) => {
    snap();
    const newDefs = JSON.parse(JSON.stringify(t.defs)) as ColDef[];
    const fields = new Set(newDefs.map((d) => d.field));
    if (keepData) {
      core.allRows.value.forEach((r) => {
        Object.keys(r).forEach((k) => {
          if (k !== '__id' && k !== '__dirty' && !fields.has(k)) delete r[k];
        });
        newDefs.forEach((d) => {
          if (!(d.field in r)) r[d.field] = emptyValueFor(d);
        });
      });
    } else {
      core.allRows.value = core.allRows.value.map((r) => {
        const nr: any = { [ROW_ID_KEY]: rowIdOf(r), [ROW_DIRTY_KEY]: dirtyOf(r) };
        newDefs.forEach((d) => {
          nr[d.field] = d.type === 'number' ? null : '';
        });
        return nr;
      });
    }
    core.columnDefs.value = newDefs;
    Object.keys(core.cellErrors).forEach((k) => delete core.cellErrors[k]);
    core.revalidateAll();
    core.bumpData();
    ElMessage.success(`已加载模板「${t.name}」`);
  };
  /**
   * 加载模板：先弹确认框让用户选择"保留数据"或"清空数据"，再委托 applyTpl 替换列结构。
   * @param name 模板名称
   */
  const loadTpl = (name: string) => {
    const t = templates.value.find((x) => x.name === name);
    if (!t) return;
    ElMessageBox.confirm(`加载模板「${name}」将替换当前列结构，是否保留现有数据？`, '加载模板', {
      confirmButtonText: '保留数据',
      cancelButtonText: '清空数据',
      type: 'warning',
    })
      .then(() => applyTpl(t, true))
      .catch((e: any) => {
        if (e === 'cancel') applyTpl(t, false);
      });
  };
  /**
   * 模板命令分发：save（打开保存对话框）/ load:<name>（加载模板）/ del:<name>（删除模板并写回 localStorage）。
   * @param cmd 命令字符串（前缀区分动作，后接名称）
   */
  const onTplCommand = (cmd: string) => {
    if (cmd === 'save') {
      tplName.value = '';
      tplDialogVisible.value = true;
      return;
    }
    if (cmd.startsWith('load:')) {
      loadTpl(cmd.slice(5));
      return;
    }
    if (cmd.startsWith('del:')) {
      const n = cmd.slice(4);
      templates.value = templates.value.filter((t) => t.name !== n);
      localStorage.setItem(TPL_KEY, JSON.stringify(templates.value));
      ElMessage.success('已删除模板');
    }
  };
  /**
   * 确认保存模板：把当前 columnDefs 深拷贝为模板（JSON），按名称去重后写入 localStorage；
   * 仅存列结构（不含数据），加载时再决定数据走向。
   */
  const confirmSaveTpl = () => {
    const name = tplName.value.trim();
    if (!name) {
      ElMessage.warning('请输入模板名称');
      return;
    }
    const defs = JSON.parse(JSON.stringify(core.columnDefs.value)) as ColDef[];
    templates.value = templates.value.filter((t) => t.name !== name);
    templates.value.push({ name, defs, ts: Date.now() });
    localStorage.setItem(TPL_KEY, JSON.stringify(templates.value));
    tplDialogVisible.value = false;
    ElMessage.success(`已保存模板「${name}」`);
  };

  return {
    templates,
    tplDialogVisible,
    tplName,
    loadTemplates,
    onTplCommand,
    confirmSaveTpl,
  };
}

/**
 * useGridTemplates 的返回类型别名：导出 { templates, tplDialogVisible, tplName,
 * loadTemplates, onTplCommand, confirmSaveTpl }，供模板下拉/对话框绑定。
 */
export type GridTemplates = ReturnType<typeof useGridTemplates>;
