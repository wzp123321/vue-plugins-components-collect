<!-- 指标详情面板：口径表达式 / 来源物理表 / 版本 / 责任人 / 可用维度 -->
<template>
  <el-card class="metric-detail-panel" shadow="never" v-loading="loading">
    <template #header>
      <div class="panel-title">
        <span>指标口径</span>
        <el-tag v-if="detail" size="small" :type="metricStatusTagType[detail.status]">
          {{ metricStatusLabel[detail.status] }}
        </el-tag>
      </div>
    </template>

    <el-empty v-if="!detail && !loading" description="请从左侧选择一个指标" />

    <template v-else-if="detail">
      <div class="detail-name">
        <span class="detail-name__text">{{ detail.name }}</span>
        <span class="detail-name__code">{{ detail.code }}</span>
        <el-tag size="small" effect="plain">{{ detail.domain }}</el-tag>
        <el-tag size="small" effect="plain" type="warning">{{ metricKindLabel[detail.kind] }}</el-tag>
      </div>

      <el-descriptions :column="3" border size="small" class="detail-desc">
        <el-descriptions-item label="计量单位">{{ detail.unit }}</el-descriptions-item>
        <el-descriptions-item label="精度">{{ detail.precision }} 位小数</el-descriptions-item>
        <el-descriptions-item label="版本">{{ detail.version }}</el-descriptions-item>
        <el-descriptions-item label="责任人">{{ detail.owner }}</el-descriptions-item>
        <el-descriptions-item label="来源物理表">{{ detail.sourceTable }}</el-descriptions-item>
        <el-descriptions-item label="来源字段">{{ detail.sourceField }}</el-descriptions-item>
        <el-descriptions-item label="最近更新" :span="3">{{ detail.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="业务定义" :span="3">{{ detail.definition }}</el-descriptions-item>
      </el-descriptions>

      <div class="block-label">计算口径表达式</div>
      <pre class="expr-block">{{ detail.expr }}</pre>

      <div class="block-label">口径说明</div>
      <p class="description">{{ detail.description }}</p>

      <div class="block-label">可用维度</div>
      <div class="dimension-tags">
        <el-tag v-for="d in detail.dimensions" :key="d.key" size="small" effect="plain" type="success">
          {{ d.label }}
        </el-tag>
      </div>

      <div class="block-label">标签</div>
      <div class="dimension-tags">
        <el-tag v-for="t in detail.tags" :key="t" size="small" effect="dark" type="info">{{ t }}</el-tag>
      </div>
    </template>
  </el-card>
</template>

<script lang="ts" setup>
import { metricKindLabel, metricStatusLabel, metricStatusTagType, type MetricDetail } from '../metric.api';

defineProps<{
  detail: MetricDetail | null;
  loading: boolean;
}>();
</script>

<style lang="less" scoped>
.metric-detail-panel {
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.detail-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.detail-name__text {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.detail-name__code {
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.detail-desc {
  margin-bottom: 4px;
}

.block-label {
  margin: 16px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.expr-block {
  padding: 12px 14px;
  margin: 0;
  overflow-x: auto;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  color: #2f6f4f;
  background: #f5f9f7;
  border-left: 3px solid var(--el-color-success);
  border-radius: 4px;
}

.description {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
}

.dimension-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
