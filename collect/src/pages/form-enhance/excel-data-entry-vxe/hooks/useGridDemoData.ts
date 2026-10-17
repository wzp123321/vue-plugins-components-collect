// 预制 / 压测数据：示例数据与万级行生成，生成前统一重置查询状态
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GridCore } from './useGridCore';
import { uid, DEPARTMENTS, STATUSES, emptyValueFor } from '../types';

export function useGridDemoData(core: GridCore) {
  const lastGen = ref('');
  const snap = () => core.pushSnapshot(core.snapshotNow());

  const resetQueryState = () => {
    core.searchText.value = '';
    Object.keys(core.columnFilters).forEach((k) => delete core.columnFilters[k]);
    core.sortList.value = [];
    for (const k of Object.keys(core.cellErrors)) delete core.cellErrors[k];
  };
  /** 预制 n 行真实感示例数据（页面初始 200 行亦走此生成器） */
  const presetData = (n = 500) => {
    snap();
    core.allRows.value = core.genSampleRows(n);
    resetQueryState();
    lastGen.value = `预制 ${n.toLocaleString()} 行示例数据`;
    ElMessage.success(lastGen.value);
  };
  const genData = (n: number) => {
    snap();
    const t0 = performance.now();
    const FIRST = ['张', '李', '王', '赵', '钱', '孙', '周', '吴', '郑', '冯'];
    const LAST = ['伟', '芳', '娜', '敏', '静', '强', '磊', '军', '洋', '勇'];
    const arr: any[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const row: any = { __id: uid(), __dirty: false };
      for (const d of core.columnDefs.value) {
        switch (d.field) {
          case 'name':
            row.name = FIRST[i % 10] + LAST[(i * 7) % 10];
            break;
          case 'age':
            row.age = 18 + (i % 48);
            break;
          case 'department':
            row.department = DEPARTMENTS[i % DEPARTMENTS.length];
            break;
          case 'joinDate':
            row.joinDate = `20${20 + (i % 6)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`;
            break;
          case 'email':
            row.email = `user${i}@example.com`;
            break;
          case 'status':
            row.status = STATUSES[i % STATUSES.length];
            break;
          case 'remark':
            row.remark = '';
            break;
          default:
            row[d.field] = emptyValueFor(d);
        }
      }
      arr[i] = row;
    }
    core.allRows.value = arr;
    resetQueryState();
    const dt = (performance.now() - t0).toFixed(0);
    lastGen.value = `生成 ${n.toLocaleString()} 行 · ${dt}ms`;
    ElMessage.success(lastGen.value);
  };

  return { lastGen, presetData, genData };
}

export type GridDemoData = ReturnType<typeof useGridDemoData>;
