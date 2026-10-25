// 滚动定位：把指定单元格滚入可视区并设为活动单元格（校验面板跳转、查找跳转共用）
import { nextTick } from 'vue';
import type { Ref } from 'vue';
import type { GridCore } from './useGridCore';
import type { Row } from '../types';

/**
 * 滚动定位：把指定单元格滚入可视区并设为活动单元格（校验面板跳转、查找跳转共用）。
 *
 * 在整体架构中的角色：本层是"滚动 + 设活动格"的薄封装，被 useGridOps（校验面板跳转）、
 * useGridFindReplace（查找跳转）复用。内部先 nextTick 等 vxe 行高就绪再 scrollToRow/scrollToColumn，
 * 规避数据变更当轮行高偏移未重算导致 scrollToRow 静默失败的时序坑（配合 useGridOps.locateRow 的短周期重试）。
 *
 * @param core 核心状态实例（写 currentCell）
 * @param tableRef vxe 实例（scrollToRow / scrollToColumn / setActiveCell）
 */
export const useGridScroll = (core: GridCore, tableRef: Ref<any>) => {
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

/**
 * useGridScroll 的返回类型别名：导出 { scrollToCell }，供校验面板跳转与查找跳转调用。
 */
export type GridScroll = ReturnType<typeof useGridScroll>;
