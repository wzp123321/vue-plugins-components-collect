// 复制蚂蚁线（Excel marching ants）：Ctrl+C 后源区域显示虚线动画边框，标记剪贴板内容来源
// Excel 语义：直到再次复制 / 粘贴 / Esc 才消失；且与选区高亮相互独立——
// 点击别处只移动选区高亮，蚂蚁线仍留在原区域（Excel 亦如此），
// 故这里快照一份 copiedRect，不随 selRect 联动
import { reactive, ref, watch } from 'vue';
import type { Ref } from 'vue';
import type { GridCore } from './useGridCore';
import type { CellSelection } from './useCellSelection';

/**
 * 复制蚂蚁线（Excel marching ants）：Ctrl+C / 菜单复制成功后，源区域显示虚线动画边框，标记剪贴板内容来源。
 *
 * 在整体架构中的角色：作为 useGridMouse 装配的子状态机，与选区高亮相互独立——
 * 点击别处只移动选区高亮，蚂蚁线仍留在原区域（Excel 亦如此），故这里快照一份 copiedRect，不随 selRect 联动。
 * 直到再次复制 / 粘贴 / Esc 才消失（由 useGridMouse 的 onEscape / onPaste 触发 clearCopied）。
 *
 * @param core 核心状态实例（读取 processedRows 定位单元格元素）
 * @param tableRef vxe 实例（getCellElement / getColumnByField 取单元格矩形）
 * @param sel 自研选区状态机（markCopied 时取 selRect 作为复制源）
 * @param gridBox 网格容器（蚂蚁线 overlay 的相对坐标基准）
 */
export function useCopyMarquee(
  core: GridCore,
  tableRef: Ref<any>,
  sel: CellSelection,
  gridBox: Ref<HTMLElement | undefined>,
) {
  const copiedRect = ref<{ rowIds: Set<string>; fields: string[] } | null>(null);
  // ⚠️ 坑：蚂蚁线用 SVG overlay（stroke-dashoffset 循环动画）实现——box-shadow 不支持 dashed，
  // 无法用 box-shadow 做虚线边框动画；故这里只算出区域矩形（top/left/w/h），由模板里的 SVG 描边动画呈现。
  const copyMarquee = reactive({ show: false, style: { top: '0px', left: '0px' }, w: 0, h: 0 });
  /**
   * 重算蚂蚁线矩形：根据 copiedRect 取首/末单元格元素的 boundingRect，换算为相对 gridBox 的 top/left/w/h。
   * 复制源行被过滤/删除或滚出虚拟渲染区（拿不到单元格）时隐藏即可（选区高亮仍随单元格滚动）。
   */
  const refreshCopyMarquee = () => {
    const rect = copiedRect.value;
    if (!rect || !rect.fields.length) {
      copyMarquee.show = false;
      return;
    }
    const rows = core.processedRows.value.filter((r) => rect.rowIds.has(r.__id));
    const first = rows[0];
    const last = rows[rows.length - 1];
    const firstCol = first ? tableRef.value?.getColumnByField?.(rect.fields[0]) : null;
    const lastCol = last ? tableRef.value?.getColumnByField?.(rect.fields[rect.fields.length - 1]) : null;
    const c1 = first && firstCol ? tableRef.value?.getCellElement?.(first, firstCol) : null;
    const c2 = last && lastCol ? tableRef.value?.getCellElement?.(last, lastCol) : null;
    const box = gridBox.value;
    // 复制源行被过滤/删除或滚出虚拟渲染区时拿不到单元格，隐藏即可（选区高亮仍随单元格滚动）
    if (!c1 || !c2 || !box) {
      copyMarquee.show = false;
      return;
    }
    const r1 = c1.getBoundingClientRect();
    const r2 = c2.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    copyMarquee.style.top = `${r1.top - br.top}px`;
    copyMarquee.style.left = `${r1.left - br.left}px`;
    copyMarquee.w = r2.right - r1.left;
    copyMarquee.h = r2.bottom - r1.top;
    copyMarquee.show = true;
  };
  /** 快照当前复制源：优先框选区域，无选区时降级当前单格（与 io.buildCopyTsv 的取源一致） */
  const markCopied = () => {
    const rect = sel.selRect.value;
    if (rect) {
      const fields = sel.rectFields(rect);
      // 快照用行 id（而非索引）：复制后行可能被过滤/删除，索引会失效，行 id 更稳
      copiedRect.value = { rowIds: new Set(sel.rectRows(rect).map((r) => r.__id)), fields };
    } else if (core.currentCell.value) {
      copiedRect.value = { rowIds: new Set([core.currentCell.value.row.__id]), fields: [core.currentCell.value.field] };
    } else {
      copiedRect.value = null;
    }
    refreshCopyMarquee();
  };
  /** 取消复制态（粘贴落位或 Esc 后调用，蚂蚁线消失） */
  const clearCopied = () => {
    copiedRect.value = null;
    copyMarquee.show = false;
  };
  // 行数变化（增删行/导入/清空）后重定位：复制源行可能已消失或移位
  watch(
    () => core.processedRows.value.length,
    () => refreshCopyMarquee(),
  );

  return { copiedRect, copyMarquee, refreshCopyMarquee, markCopied, clearCopied };
}

/**
 * useCopyMarquee 的返回类型别名：导出 { copiedRect, copyMarquee, refreshCopyMarquee,
 * markCopied, clearCopied }，供 useGridMouse 透出到模板渲染蚂蚁线 overlay。
 */
export type GridCopyMarquee = ReturnType<typeof useCopyMarquee>;
