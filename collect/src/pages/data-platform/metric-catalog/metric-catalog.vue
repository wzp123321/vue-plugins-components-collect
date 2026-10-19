<!--
  数据指标口径管理（数据中台最小闭环演示）
  ============================================================================
  本文件职责：组装页面布局，并把 useMetricCatalog 暴露的状态/动作接线到三个子面板：
    - MetricListPanel  左侧指标目录（搜索 / 主题域筛选 / 选中）
    - MetricDetailPanel 右上指标口径详情
    - MetricCalcPanel  右下指标试算（勾选维度 → 查询 → 结果表格）
  业务逻辑全部下沉到 hooks/useMetricCatalog，数据访问走 metric.api.ts（本地 mock）。
  ============================================================================
-->
<template>
  <div class="metric-catalog-page">
    <div class="page-head">
      <div>
        <h5>数据指标口径管理</h5>
        <p class="page-desc">
          演示数据中台的最小闭环：指标目录 → 口径详情（表达式 / 来源物理表 / 版本 / 责任人 / 可用维度）→ 按维度试算。
          当前数据为本地 mock，接口层已预留切换真实后端的替换点。
        </p>
      </div>
      <div class="page-tags">
        <el-tag type="success" effect="plain">指标唯一口径</el-tag>
        <el-tag type="warning" effect="plain">维度试算</el-tag>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="8">
        <MetricListPanel
          :list="filteredMetrics"
          :loading="listLoading"
          :active-id="activeId"
          :domains="domainOptions"
          v-model:keyword="keyword"
          v-model:domain="domain"
          @select="selectMetric"
        />
      </el-col>

      <el-col :span="16">
        <MetricDetailPanel :detail="activeDetail" :loading="detailLoading" class="detail-block" />
        <MetricCalcPanel
          :detail="activeDetail"
          :result="result"
          :loading="queryLoading"
          v-model:selected="selectedDimensions"
          v-model:date-range="dateRange"
          @query="runQuery"
          @reset="resetQuery"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import MetricListPanel from './components/MetricListPanel.vue';
import MetricDetailPanel from './components/MetricDetailPanel.vue';
import MetricCalcPanel from './components/MetricCalcPanel.vue';
import { useMetricCatalog } from './hooks/useMetricCatalog';

defineOptions({ name: 'MetricCatalog' });

const {
  listLoading,
  keyword,
  domain,
  domainOptions,
  filteredMetrics,
  loadMetrics,
  selectMetric,
  activeId,
  activeDetail,
  detailLoading,
  selectedDimensions,
  dateRange,
  queryLoading,
  result,
  resetQuery,
  runQuery,
} = useMetricCatalog();

onMounted(() => {
  loadMetrics();
});
</script>

<style lang="less" scoped>
.metric-catalog-page {
  padding: 20px;
  overflow-y: auto;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-desc {
  max-width: 720px;
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.page-tags {
  display: flex;
  gap: 8px;
}

.detail-block {
  margin-bottom: 16px;
}
</style>
