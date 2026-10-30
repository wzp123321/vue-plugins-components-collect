<template>
  <div class="cm-controls">
    <el-select
      v-model="metricValue"
      class="cm-controls-select"
      size="small"
      popper-class="cd-control-popper"
      @change="handleMetricChange"
    >
      <el-option v-for="item in metricOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>

    <el-select
      v-model="timeValue"
      class="cm-controls-select"
      size="small"
      popper-class="cd-control-popper"
      @change="handleTimeChange"
    >
      <el-option v-for="item in timeOptions" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>

    <el-autocomplete
      v-model="keyword"
      class="cm-controls-search"
      size="small"
      :fetch-suggestions="fetchSuggestions"
      :placeholder="level === 'national' ? '搜索省份' : '搜索城市'"
      popper-class="cd-control-popper"
      value-key="label"
      @select="handleSelect"
    >
      <template #default="{ item }">
        <span class="cm-controls-suggestion-label">{{ item.label }}</span>
        <span class="cm-controls-suggestion-sub">{{ item.sub }}</span>
      </template>
    </el-autocomplete>

    <div class="cm-controls-actions">
      <button
        type="button"
        class="cm-controls-btn"
        :class="{ 'is-active': alarmOpen }"
        title="告警中心"
        @click="emit('toggle-alarm')"
      >
        告警
        <span v-if="alarmCount" class="cm-controls-badge">{{ alarmCount }}</span>
      </button>
      <button type="button" class="cm-controls-btn" title="缩小" @click="emit('zoom-out')">－</button>
      <button type="button" class="cm-controls-btn" title="放大" @click="emit('zoom-in')">＋</button>
      <button type="button" class="cm-controls-btn" title="复位视图" @click="emit('reset-view')">复位</button>
      <button type="button" class="cm-controls-btn" title="全屏" @click="emit('toggle-fullscreen')">
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { DashboardLevel, MetricKey, SearchPlace, TimeRangeKey } from '../chart-dashboard.service'

defineOptions({ name: 'CmControls' })

type SuggestionItem = SearchPlace & { value: string }

const props = defineProps<{
  metric: MetricKey
  metricOptions: { value: MetricKey; label: string }[]
  timeRange: TimeRangeKey
  timeOptions: { value: TimeRangeKey; label: string }[]
  level: DashboardLevel
  alarmCount: number
  alarmOpen: boolean
  isFullscreen: boolean
  search: (keyword: string) => SearchPlace[]
}>()

const emit = defineEmits<{
  (e: 'metric-change', value: MetricKey): void
  (e: 'time-change', value: TimeRangeKey): void
  (e: 'search-select', item: SearchPlace): void
  (e: 'toggle-alarm'): void
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'reset-view'): void
  (e: 'toggle-fullscreen'): void
}>()

const metricValue = ref<MetricKey>(props.metric)
const timeValue = ref<TimeRangeKey>(props.timeRange)
const keyword = ref('')

watch(
  () => props.metric,
  (value) => {
    metricValue.value = value
  },
)

watch(
  () => props.timeRange,
  (value) => {
    timeValue.value = value
  },
)

watch(
  () => props.level,
  () => {
    keyword.value = ''
  },
)

const handleMetricChange = (value: MetricKey) => {
  emit('metric-change', value)
}

const handleTimeChange = (value: TimeRangeKey) => {
  emit('time-change', value)
}

const fetchSuggestions = (query: string, callback: (items: SuggestionItem[]) => void) => {
  const items = props.search(query).map((place) => ({ ...place, value: place.label }))
  callback(items)
}

// el-autocomplete 的 select 回调签名是 (item: Record<string, any>) => any，
// 候选是 fetchSuggestions 自己塞进去的 SearchPlace，这里按已知结构还原
const handleSelect = (item: Record<string, unknown>) => {
  emit('search-select', item as unknown as SuggestionItem)
  keyword.value = ''
}
</script>

<style lang="less" scoped>
.cm-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(6, 39, 65, 0.6);
  border: 1px solid rgba(54, 129, 255, 0.22);
  border-radius: var(--ai-radius-md);
  backdrop-filter: blur(4px);

  .cm-controls-select {
    width: 108px;

    :deep(.el-input__wrapper) {
      background: rgba(6, 39, 65, 0.65);
      box-shadow: 0 0 0 1px rgba(54, 129, 255, 0.25) inset;
    }

    :deep(.el-input__inner) {
      color: #d6e8ff;
    }
  }

  .cm-controls-search {
    width: 168px;

    :deep(.el-input__wrapper) {
      background: rgba(6, 39, 65, 0.65);
      box-shadow: 0 0 0 1px rgba(54, 129, 255, 0.25) inset;
    }

    :deep(.el-input__inner) {
      color: #d6e8ff;
    }
  }

  .cm-controls-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cm-controls-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 8px;
    border: 1px solid rgba(54, 129, 255, 0.22);
    border-radius: var(--ai-radius-xs);
    background: rgba(6, 39, 65, 0.65);
    color: #9ec9ff;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;

    &:hover,
    &.is-active {
      color: #00eaff;
      border-color: rgba(0, 234, 255, 0.55);
      background: rgba(54, 129, 255, 0.25);
    }
  }

  .cm-controls-badge {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: #ff3f00;
    color: #ffffff;
    font-size: 10px;
    line-height: 16px;
    text-align: center;
  }
}

.cm-controls-suggestion-label {
  color: #d6e8ff;
}

.cm-controls-suggestion-sub {
  margin-left: 10px;
  color: #7ea6d8;
  font-size: 12px;
}
</style>

<style lang="less">
.cd-control-popper {
  background: rgba(6, 39, 65, 0.95) !important;
  border: 1px solid rgba(54, 129, 255, 0.3) !important;

  .el-select-dropdown__item,
  li {
    color: #d6e8ff;
  }

  .el-select-dropdown__item.is-hovering,
  .el-select-dropdown__item:hover,
  li:hover {
    background: rgba(54, 129, 255, 0.25);
  }

  .el-select-dropdown__item.is-selected {
    color: #00eaff;
  }

  .el-autocomplete-suggestion__wrap {
    padding: 4px 0;
  }

  .popper__arrow {
    background: rgba(6, 39, 65, 0.95);
  }
}
</style>
