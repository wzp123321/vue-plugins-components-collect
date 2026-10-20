/**
 * 告警/事件表格数据 + 50s 轮询
 *
 * tab 角标 = useTeAlBundle.fetchAlarmEventCount 拉回的 24h 独立 count
 * (不再由分页 total 驱动,与搜索栏筛选条件解耦)
 */
import { ref, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import { TeAlarmAffixApi } from '../api/TeAlarmAffixApi';
import { AlarmType, type AlarmFilters, type AlarmInfo } from '../api/index.api';
import { TABLE_DATA_POLL_INTERVAL, BADGE_WINDOW_MS } from '../constant';
import { getTimeWindow } from '../utils/time';
import type { TeAlServices } from './useTeAlBundle';
import { PAGE_SIZES } from '../../../constant';

export interface UseAlarmTableDataReturn {
  tableData: Ref<AlarmInfo[]>;
  total: Ref<number>;
  loading: Ref<boolean>;
  pageNum: Ref<number>;
  pageSize: Ref<number>;
  refresh: () => Promise<void>;
  onPageChange: (pageInfo: { pageNum: number; pageSize: number }) => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useAlarmTableData = (
  services: TeAlServices,
  filters: Ref<AlarmFilters>,
  activeTab: Ref<AlarmType>,
): UseAlarmTableDataReturn => {
  const { axiosInstance, fetchAlarmEventCount } = services;
  // 表格数据
  const tableData = ref<AlarmInfo[]>([]);
  // 表格分页参数
  const total = ref(0);
  // 表格加载状态
  const loading = ref(false);
  // 表格当前页
  const pageNum = ref(1);
  // 表格每页条数
  const pageSize = ref(PAGE_SIZES[0]);

  /** 按 activeTab 选告警/事件分页接口,把当前 filters + 分页作为 body */
  const fetchTable = async (silent = false) => {
    try {
      if (!silent) {
        loading.value = true;
      }
      const {
        spaceCodeList,
        alarmLevelList,
        systemIdList,
        operationStatus,
        status,
        keyword,
        startTime,
        endTime,
      } = filters.value;
      const isAlarm = activeTab.value === AlarmType.ALARM;
      const res = isAlarm
        ? await TeAlarmAffixApi.queryRealTimeAlarmPage(axiosInstance, {
            spaceCodeList,
            alarmLevelList,
            systemIdList,
            status,
            keyword,
            operationStatus,
            startTime,
            endTime,
            pageNum: pageNum.value,
            pageSize: pageSize.value,
          })
        : await TeAlarmAffixApi.queryRealTimeEventPage(axiosInstance, {
            spaceCodeList,
            alarmLevelList,
            systemIdList,
            operationStatus,
            keyword,
            startTime,
            endTime,
            pageNum: pageNum.value,
            pageSize: pageSize.value,
          });
      tableData.value = res?.data?.list ?? [];
      const nextTotal = res?.data?.total ?? 0;
      total.value = nextTotal;
      // tab 角标不再由分页 total 驱动(由 fetchAlarmEventCount 单独写入)
    } catch (err) {
      console.warn(
        '[useAlarmTableData] fetchTable failed:',
        err instanceof Error ? err.message : err,
      );
    } finally {
      loading.value = false;
    }
  };

  /**
   * 一次完整刷新:分页 + tab 角标
   * - 先 fetchTable 拿表格数据(可能失败,不阻塞角标)
   * - 再 fetchAlarmEventCount 刷 alarmTotal / eventTotal(失败保留上次值)
   * - 不论先后成功与否,都跑完,不抛
   * @param silent 静默刷新(轮询时使用,不展示 loading)
   */
  const refresh = async (silent = false) => {
    await fetchTable(silent);
    await fetchAlarmEventCount();
  };

  let pollTimer: number | null = null;

  /**
   * 分页切换时,刷新表格数据
   * @param pageInfo
   */
  const onPageChange = (pageInfo: { pageNum: number; pageSize: number }) => {
    pageNum.value = pageInfo.pageNum;
    pageSize.value = pageInfo.pageSize;
    refresh();
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = window.setInterval(pollCallback, TABLE_DATA_POLL_INTERVAL);
    }
  };

  /**
   * 停止轮询表格数据更新
   */
  const stopPolling = () => {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  /**
   * 每次轮询前更新为实时的"当前时间-24h"时间窗
   */
  const refreshTimeWindow = () => {
    const { startTime, endTime } = getTimeWindow(BADGE_WINDOW_MS);
    filters.value.startTime = startTime;
    filters.value.endTime = endTime;
  };

  /** 单次轮询回调：刷新时间窗 + 拉取数据 */
  const pollCallback = () => {
    refreshTimeWindow();
    refresh(true);
  };

  /**
   * 开始轮询表格数据更新(同时每轮触发 count 刷新)
   */
  const startPolling = () => {
    stopPolling();
    pollTimer = window.setInterval(pollCallback, TABLE_DATA_POLL_INTERVAL);
  };

  onUnmounted(stopPolling);

  return {
    tableData,
    total,
    loading,
    pageNum,
    pageSize,
    refresh,
    onPageChange,
    startPolling,
    stopPolling,
  };
};
