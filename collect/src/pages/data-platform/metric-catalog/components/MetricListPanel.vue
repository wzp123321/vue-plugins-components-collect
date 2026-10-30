<!-- 指标列表面板：搜索 + 主题域筛选 + 指标卡片列表 -->
<template>
  <el-card class="metric-list-panel" shadow="never">
    <template #header>
      <div class="panel-title">
        <span>指标目录</span>
        <el-tag size="small" type="info" round>{{ list.length }} 项</el-tag>
      </div>
    </template>

    <el-input v-model="kw" placeholder="搜索名称 / 编码 / 责任人" clearable class="search-input">
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-select v-model="dm" placeholder="全部主题域" clearable class="domain-select">
      <el-option v-for="item in domains" :key="item" :label="item" :value="item" />
    </el-select>

    <el-scrollbar v-loading="loading" class="list-scroll" height="520px">
      <el-empty v-if="!list.length" description="没有匹配的指标" />
      <div
        v-for="item in list"
        :key="item.id"
        class="metric-card"
        :class="{ active: item.id === activeId }"
        @click="emit('select', item.id)"
      >
        <div class="metric-card__head">
          <span class="metric-card__name">{{ item.name }}</span>
          <el-tag size="small" :type="metricStatusTagType[item.status]">{{ metricStatusLabel[item.status] }}</el-tag>
        </div>
        <div class="metric-card__code">{{ item.code }}</div>
        <div class="metric-card__meta">
          <el-tag size="small" effect="plain">{{ item.domain }}</el-tag>
          <el-tag size="small" effect="plain" type="warning">{{ metricKindLabel[item.kind] }}</el-tag>
          <span class="metric-card__owner">{{ item.owner }}</span>
        </div>
      </div>
    </el-scrollbar>
  </el-card>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { metricKindLabel, metricStatusLabel, metricStatusTagType, type MetricItem } from '../metric.api';

const props = defineProps<{
  list: MetricItem[];
  loading: boolean;
  activeId: string;
  keyword: string;
  domain: string;
  domains: string[];
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'update:keyword', value: string): void;
  (e: 'update:domain', value: string): void;
}>();

const kw = computed({
  get: () => props.keyword,
  set: (v: string) => emit('update:keyword', v),
});

const dm = computed({
  get: () => props.domain,
  set: (v: string) => emit('update:domain', v),
});
</script>

<style lang="less" scoped>
.metric-list-panel {
  :deep(.el-card__body) {
    padding: 12px;
  }
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.search-input {
  margin-bottom: 10px;
}

.domain-select {
  width: 100%;
  margin-bottom: 12px;
}

.list-scroll {
  padding-right: 4px;
}

.metric-card {
  padding: 10px 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  border-radius: var(--ai-radius-sm);
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }

  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.metric-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.metric-card__code {
  margin-top: 2px;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.metric-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.metric-card__owner {
  margin-left: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
