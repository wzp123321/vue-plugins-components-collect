<!--
  搜索栏(单向 props + emit)
  所有筛选项 change 统一走 handleSearch,emit('filter-change', partial)
-->
<template>
  <div class="alarm-search-bar">
    <te-tablebar
      :hiddenMoreSearch="true"
      :hiddenSearchInput="true"
      model-value=""
      @onRefresh="handleSearch"
    >
      <template #header>
        <te-button type="primary" :disabled="!hasSelection" @click="onBatch">
          批量确认
        </el-button>
      </template>
      <template #input>
        <div class="asb-filters">
          <te-select
            :model-value="filters.alarmLevelList"
            multiple
            collapse-tags
            clearable
            placeholder="请选择告警等级"
            class="asb-filters-w200"
            @change="handleLevelChange"
          >
            <te-option
              v-for="opt in levelOptions"
              :key="opt.code"
              :label="opt.name"
              :value="opt.code"
            />
          </el-select>
          <te-select
            :model-value="filters.systemIdList"
            multiple
            collapse-tags
            clearable
            placeholder="请选择专业模块"
            class="asb-filters-w200"
            @change="handleProfessionalChange"
          >
            <te-option
              v-for="m in professionalOptions"
              :key="m.id"
              :label="m.name"
              :value="m.id"
            />
          </el-select>
          <te-select
            placeholder="请选择处理状态"
            clearable
            :model-value="filters.operationStatus"
            class="asb-filters-w160"
            @change="handleOperationStatusChange"
          >
            <te-option
              v-for="opt in optionsDealProcess"
              :key="opt.code"
              :label="opt.name"
              :value="opt.code"
            />
          </el-select>
          <te-select
            v-if="type === AlarmType.ALARM"
            placeholder="请选择告警状态"
            clearable
            :model-value="filters.status"
            class="asb-filters-w160"
            @change="handleAlarmStatusChange"
          >
            <te-option
              v-for="opt in optionsAlarmStatus"
              :key="opt.code"
              :label="opt.name"
              :value="opt.code"
            />
          </el-select>
          <te-search
            :model-value="filters.keyword"
            placeholder="告警描述/告警对象"
            clearable
            :maxlength="100"
            :during-time="233"
            class="asb-filters-w200"
            @update:model-value="handleKeywordChange"
          />
        </div>
      </template>
    </te-tablebar>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount } from 'vue';
import { debounce } from 'lodash';
import { ElSelect, ElOption, ElButton } from 'element-plus';
import { TeTablebar } from '../../../te-tablebar';
import { TeSearch } from '../../../te-search';
import {
  AlarmLevelItemDto,
  AlarmType,
  SystemItemVO,
  type AlarmFilters,
  type AlarmLevel as AlarmLevelType,
  type OperationStatus,
} from '../api/index.api';
import { optionsDealProcess, optionsAlarmStatus } from '../constant';
import { filterText } from '../utils';

defineOptions({ name: 'TeAlarmSearchBar' });

defineProps<{
  filters: AlarmFilters;
  levelOptions: ReadonlyArray<AlarmLevelItemDto>;
  professionalOptions: ReadonlyArray<SystemItemVO>;
  type: AlarmType;
  hasSelection?: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (event: 'filter-change', partial: Partial<AlarmFilters>): void;
  (event: 'batch-confirm'): void;
}>();

/** 统一处理所有筛选项变更(允许无参) */
const handleSearch = (partial?: Partial<AlarmFilters>) => {
  emit('filter-change', partial ?? {});
};

const handleLevelChange = (alarmLevelList: AlarmLevelType[]) => {
  handleSearch({ alarmLevelList });
};

const handleProfessionalChange = (systemIdList: string[]) => {
  handleSearch({ systemIdList });
};

const handleOperationStatusChange = (
  selectedStatus: OperationStatus | '-1',
) => {
  handleSearch({ operationStatus: selectedStatus });
};

const handleAlarmStatusChange = (status: string) => {
  handleSearch({ status });
};

/** 关键字 debounce 300ms 后 emit,避免连续输入多次请求;trim 避免空格触发空查询 */
const emitKeywordDebounced = debounce((keyword: string) => {
  emit('filter-change', { keyword: keyword.trim() });
}, 300);

const handleKeywordChange = (keyword: string) => {
  emitKeywordDebounced(filterText(keyword));
};

/** 卸载时取消未触发的 debounce */
onBeforeUnmount(() => {
  emitKeywordDebounced.cancel();
});

const onBatch = () => emit('batch-confirm');
</script>

<style lang="less" scoped>
.alarm-search-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--te-space-12);
  margin-bottom: var(--te-space-12);
  :deep(.te-tablebar) {
    width: 100%;
    .asb-filters {
      display: flex;
      gap: var(--te-space-12);
      flex-wrap: wrap;
      .asb-filters-w160 {
        width: 160px;
      }
      .asb-filters-w200 {
        width: 200px;
      }
    }
  }
}
</style>
