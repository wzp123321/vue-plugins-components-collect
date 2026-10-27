/**
 * 指标口径管理 —— 页面状态与业务逻辑
 * ============================================================================
 * 本文件职责：集中管理页面的列表 / 详情 / 试算三块状态与动作，供主组件与各子组件装配。
 *   - 列表：加载全部指标、关键字与主题域筛选；
 *   - 详情：点击列表项后按 id 拉取指标详情；
 *   - 试算：勾选维度 + 选区间 → queryMetric → 结果表格。
 * 数据来源统一走 metric.api.ts（当前为本地 mock）。
 * ============================================================================
 */
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  fetchMetricDetail,
  fetchMetrics,
  queryMetric,
  type MetricDetail,
  type MetricItem,
  type MetricQueryResult,
} from '../metric.api';

export const useMetricCatalog = () => {
  // ---------- 列表 ----------
  const metrics = ref<MetricItem[]>([]);
  const listLoading = ref(false);
  const keyword = ref('');
  const domain = ref('');

  /** 主题域选项由已加载数据去重得到 */
  const domainOptions = computed(() => Array.from(new Set(metrics.value.map((m) => m.domain))));

  const filteredMetrics = computed(() => {
    const k = keyword.value.trim().toLowerCase();
    return metrics.value.filter((m) => {
      const hitKeyword =
        !k || m.name.toLowerCase().includes(k) || m.code.toLowerCase().includes(k) || m.owner.toLowerCase().includes(k);
      const hitDomain = !domain.value || m.domain === domain.value;
      return hitKeyword && hitDomain;
    });
  });

  // ---------- 详情 ----------
  const activeId = ref('');
  const activeDetail = ref<MetricDetail | null>(null);
  const detailLoading = ref(false);

  // ---------- 试算 ----------
  const selectedDimensions = ref<string[]>([]);
  const dateRange = ref<[string, string] | null>(null);
  const queryLoading = ref(false);
  const result = ref<MetricQueryResult | null>(null);

  /** 重置试算条件与结果 */
  const resetQuery = () => {
    selectedDimensions.value = [];
    dateRange.value = null;
    result.value = null;
  };

  /** 选中指标：拉取详情并重置试算状态 */
  const selectMetric = async (id: string) => {
    if (id === activeId.value) {
      return;
    }
    activeId.value = id;
    detailLoading.value = true;
    resetQuery();
    try {
      activeDetail.value = await fetchMetricDetail(id);
    } finally {
      detailLoading.value = false;
    }
  };

  /** 加载指标列表 */
  const loadMetrics = async () => {
    listLoading.value = true;
    try {
      metrics.value = await fetchMetrics();
      const first = filteredMetrics.value[0];
      if (first) {
        await selectMetric(first.id);
      }
    } finally {
      listLoading.value = false;
    }
  };

  /** 执行试算 */
  const runQuery = async () => {
    if (!activeDetail.value) {
      return;
    }
    queryLoading.value = true;
    try {
      result.value = await queryMetric({
        metricId: activeDetail.value.id,
        dimensions: selectedDimensions.value,
        dateRange: dateRange.value,
      });
      ElMessage.success(`试算完成，命中 ${result.value.rows.length} 行`);
    } finally {
      queryLoading.value = false;
    }
  };

  return {
    // 列表
    metrics,
    listLoading,
    keyword,
    domain,
    domainOptions,
    filteredMetrics,
    loadMetrics,
    selectMetric,
    // 详情
    activeId,
    activeDetail,
    detailLoading,
    // 试算
    selectedDimensions,
    dateRange,
    queryLoading,
    result,
    resetQuery,
    runQuery,
  };
}
