// 滚动定位：把指定单元格滚入可视区并设为活动单元格（校验面板跳转、查找跳转共用）
import { nextTick } from 'vue';
import type { Ref } from 'vue';
import type { GridCore } from './useGridCore';
import type { Row } from '../types';

export function useGridScroll(core: GridCore, tableRef: Ref<any>) {
  /** 把单元格滚入可视区并设为活动格（校验面板/查找跳转共用；内部先 nextTick 等 vxe 行高就绪） */
  const scrollToCell = (row: Row, field: string) => {
    nextTick(() => {
      tableRef.value?.scrollToRow?.(row);
      tableRef.value?.scrollToColumn?.(field);
      tableRef.value?.setActiveCell?.(row, field);
      core.currentCell.value = { row, field };
    });
  };
  return { scrollToCell };
}

export type GridScroll = ReturnType<typeof useGridScroll>;
