// 列结构模板：localStorage 持久化（保存 / 加载 / 删除），加载时可选择保留或清空数据
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { GridCore } from './useGridCore';
import { type ColDef, type Tpl, emptyValueFor } from '../types';

const TPL_KEY = 'vxe_entry_templates';

export function useGridTemplates(core: GridCore) {
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
  const applyTpl = (t: Tpl, keepData: boolean) => {
    snap();
    const newDefs = JSON.parse(JSON.stringify(t.defs)) as ColDef[];
    const fields = new Set(newDefs.map((d) => d.field));
    if (keepData) {
      for (const r of core.allRows.value) {
        for (const k of Object.keys(r)) if (k !== '__id' && k !== '__dirty' && !fields.has(k)) delete r[k];
        for (const d of newDefs) if (!(d.field in r)) r[d.field] = emptyValueFor(d);
      }
    } else {
      core.allRows.value = core.allRows.value.map((r) => {
        const nr: any = { __id: r.__id, __dirty: r.__dirty };
        for (const d of newDefs) nr[d.field] = d.type === 'number' ? null : '';
        return nr;
      });
    }
    core.columnDefs.value = newDefs;
    for (const k of Object.keys(core.cellErrors)) delete core.cellErrors[k];
    core.revalidateAll();
    ElMessage.success(`已加载模板「${t.name}」`);
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

export type GridTemplates = ReturnType<typeof useGridTemplates>;
