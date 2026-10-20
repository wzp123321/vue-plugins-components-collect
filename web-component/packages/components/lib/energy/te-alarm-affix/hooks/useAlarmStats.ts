/**
 * 告警/事件合并 badge hook(闭包 state,无单例)
 *
 * 用途:悬浮图标右上角红点 = 24h 窗口内告警+事件未确认合并总数
 * 数据源:setTotal 由 fetchAlarmEventCount(覆盖)直接写入
 */
import { ref, type Ref } from 'vue';

export interface UseAlarmStatsReturn {
  /** 24h 时间窗内告警+事件未确认合并总数(用于悬浮图标 badge) */
  totalCount: Ref<number>;
  /** 直接覆盖写入总数(由 fetchAlarmEventCount 调) */
  setTotal: (next: number) => void;
}

export const useAlarmStats = (): UseAlarmStatsReturn => {
  const totalCount = ref(0);

  const setTotal = (next: number) => {
    totalCount.value = Math.max(0, next);
  };

  return { totalCount, setTotal };
};
