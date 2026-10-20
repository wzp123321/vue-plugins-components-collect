import { ref, type Ref } from 'vue';
import type { AxiosInstance } from 'axios';
import { TeMessage } from '@tiansu/element-plus';
import { TeAlarmAffixApi } from '../api/TeAlarmAffixApi';
import { type AlarmInfo, AlarmType } from '../api/index.api';

export interface UseAlarmConfirmOptions {
  /** 当前 tab（告警 / 事件），用于批量确认接口的 type 字段 */
  activeTab: Ref<AlarmType>;
  /** 已勾选的行；批量确认成功后会被清空 */
  selectedRows: Ref<AlarmInfo[]>;
  /** 确认成功后刷新表格 + 角标 */
  refresh: () => Promise<void>;
  /** 重置 5s 轮询计时器 */
  startPolling: () => void;
}

export interface UseAlarmConfirmReturn {
  /** 表格行内"确认"按钮：打开备注框（v-model remarkDialogVisible） */
  onRowConfirm: (row: AlarmInfo) => void;
  /** 备注框确认：调接口 → 刷新表格 → 启动轮询（单条/批量共用，区分 pendingIsBatch） */
  onRemarkConfirm: (remark: string) => Promise<void>;
  /** 备注框取消/关闭 */
  onRemarkCancel: () => void;
  /** 搜索栏"批量确认"按钮：打开备注框（替代原 MessageBox 二次确认） */
  onBatchConfirm: () => void;
  /** 单条/批量确认备注框可见性（v-model 绑定到 AlarmRemarkDialog） */
  remarkDialogVisible: Ref<boolean>;
  /** 单条/批量确认保存中（用于 AlarmRemarkDialog 确定按钮 loading） */
  remarkSaving: Ref<boolean>;
}

/**
 * 告警/事件 确认 & 批量确认 hook
 * 职责:单条确认 + 批量确认 都走 AlarmRemarkDialog 填写备注 → 调 batchConfirm → refresh + startPolling
 * 单条/批量通过 pendingIsBatch 区分;备注框/loading 状态共用一套
 */
export const useAlarmConfirm = (
  axiosInstance: AxiosInstance,
  options: UseAlarmConfirmOptions,
): UseAlarmConfirmReturn => {
  const { activeTab, selectedRows, refresh, startPolling } = options;

  const remarkDialogVisible = ref(false);
  const remarkSaving = ref(false);
  const pendingRow = ref<AlarmInfo | null>(null);
  /** 批量确认模式:true=对 selectedRows 批量操作;false=对 pendingRow 单条操作 */
  const pendingIsBatch = ref(false);

  /** 关闭备注框并清空暂存行 / 模式标记 */
  const closeRemarkDialog = () => {
    remarkDialogVisible.value = false;
    pendingRow.value = null;
    pendingIsBatch.value = false;
  };

  /** 表格行内"确认"：暂存单条行 + 打开备注框（单条模式） */
  const onRowConfirm = (row: AlarmInfo) => {
    pendingRow.value = row;
    pendingIsBatch.value = false;
    remarkDialogVisible.value = true;
  };

  /** 备注框取消/关闭：仅关闭，无副作用 */
  const onRemarkCancel = () => {
    closeRemarkDialog();
  };

  /**
   * 备注框确认：根据 pendingIsBatch 走单条/批量分支
   * 调接口 → 成功关框 + 刷新表格 + 重启轮询，失败保留输入
   */
  const onRemarkConfirm = async (remark: string) => {
    if (remarkSaving.value) return;
    remarkSaving.value = true;
    try {
      let idList: number[];
      if (pendingIsBatch.value) {
        idList = selectedRows.value.map((row) => row.id);
        if (idList.length === 0) {
          closeRemarkDialog();
          return;
        }
      } else {
        const row = pendingRow.value;
        if (!row) {
          closeRemarkDialog();
          return;
        }
        idList = [row.id];
      }
      await TeAlarmAffixApi.batchConfirmAlarm(axiosInstance, {
        idList,
        type: activeTab.value,
        comment: remark,
      });
      TeMessage.success(
        pendingIsBatch.value ? `已确认 ${idList.length} 条` : '已确认',
      );
      if (pendingIsBatch.value) {
        selectedRows.value = [];
      }
      closeRemarkDialog();
      // 按当前查询条件重新拉表格 + 角标，并重置 5s 轮询计时器
      await refresh();
      startPolling();
    } catch (err) {
      TeMessage.error(err instanceof Error ? err.message : '确认失败');
    } finally {
      remarkSaving.value = false;
    }
  };

  /** 搜索栏"批量确认"：打开备注框（替代原 MessageBox 二次确认流程） */
  const onBatchConfirm = () => {
    if (remarkDialogVisible.value) return;
    if (!selectedRows.value.length) {
      TeMessage.error('请先勾选');
      return;
    }
    pendingIsBatch.value = true;
    pendingRow.value = null;
    remarkDialogVisible.value = true;
  };

  return {
    onRowConfirm,
    onRemarkConfirm,
    onRemarkCancel,
    onBatchConfirm,
    remarkDialogVisible,
    remarkSaving,
  };
};
