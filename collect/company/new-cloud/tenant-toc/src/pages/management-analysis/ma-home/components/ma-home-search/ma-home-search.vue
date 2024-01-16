<template>
  <div id="ma-home-search">
    <label>时间维度</label>
    <el-select v-model="queryType" @change="onQueryTypeChange">
      <el-option v-for="option in queryTypes" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
    <el-select
      v-model="type"
      @change="onTypeChange"
      v-if="queryType !== MA_HOME_EQueryType.历史累计 && queryType !== MA_HOME_EQueryType['历史累计（不含实验局）']"
    >
      <el-option v-for="option in typeOptions" :key="option.value" :label="option.label" :value="option.value" />
    </el-select>
    <DateRangePicker
      v-if="dateSelectMode"
      :clearable="false"
      :format="type === MA_HOME_EDateType.按年 ? 'YYYY' : 'YYYY-MM'"
      v-model:value="date"
      :mode="dateSelectMode"
      :disabled-date="mapDisabledDate"
      :disabledStartYear="mapDisableStartYear"
      :disabledEndYear="mapDisableEndYear"
    ></DateRangePicker>
    <button ref="elSearch" primary>查询</button>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { formatDate } from '@/utils';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { MA_HOME_DATE_SCOPE, MA_HOME_EDateType, MA_HOME_EQueryType, sDatabase, sInfo } from '../../services';
import message from '@/utils/message';

import DateRangePicker from '../../../../../components/date-range-picker/date-range-picker.vue';
import { endOfYear, startOfYear } from 'date-fns';

const destroy$ = new Subject<void>();
onMounted(async () => {
  fromEvent(elSearch.value!, 'click')
    .pipe(takeUntil(destroy$), throttleTime(666))
    .subscribe(() => search());
  sInfo.refStart$.pipe(takeUntil(destroy$)).subscribe((v) => (startDate.value = v));
  sInfo.refEnd$.pipe(takeUntil(destroy$)).subscribe((v) => (endDate.value = v));
  await onDateScopeQuery();
  search();
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});

const type = ref<MA_HOME_EDateType>(MA_HOME_EDateType.按年);
const queryType = ref<MA_HOME_EQueryType>(MA_HOME_EQueryType.运营期);
const dateScope = ref<MA_HOME_DATE_SCOPE>({
  time: 0,
  startTime: 0,
  endTime: 0,
});
const typeOptions = computed(() =>
  Object.entries(MA_HOME_EDateType)
    .filter(([k, v]) => typeof v === 'number')
    .map(([k, v]) => ({ label: k, value: v })),
);
const queryTypes = computed(() =>
  Object.entries(MA_HOME_EQueryType)
    .filter(([k, v]) => typeof v === 'number')
    .map(([k, v]) => ({ label: k, value: v })),
);
async function onQueryTypeChange() {
  type.value = MA_HOME_EDateType.按年;
  date.value = [new Date(), new Date()];

  await onDateScopeQuery();
}
/**
 * 如果没有开始结束时间 则时间为null
 */
async function onDateScopeQuery(): Promise<void> {
  dateScope.value = await sDatabase.queryDateScope(queryType.value);
  if (!dateScope.value.startTime && !dateScope.value.endTime) {
    date.value = [];
    return;
  }
  if (dateScope.value?.endTime) {
    const y = new Date(dateScope.value?.endTime).getFullYear();
    if (dateScope.value.time && new Date(dateScope.value.time)?.getFullYear() > y) {
      date.value = [new Date(dateScope.value?.endTime as number), new Date(dateScope.value?.endTime)];
    } else {
      date.value = [
        dateScope.value?.time ? new Date(dateScope.value?.time) : new Date(),
        dateScope.value?.time ? new Date(dateScope.value?.time) : new Date(),
      ];
    }
  } else if (!dateScope.value?.endTime && !dateScope.value?.startTime) {
    date.value = [];
  }
}
function onTypeChange(): void {
  const d =
    !dateScope.value?.endTime || new Date().getTime() < dateScope.value?.endTime
      ? new Date()
      : new Date(dateScope.value?.endTime);
  date.value = [d, d];
}

const date = ref<Date[]>([]);
const startDate = ref<Date>();
const endDate = ref<Date>();
const dateSelectMode = computed(() => {
  if (
    queryType.value === MA_HOME_EQueryType.历史累计 ||
    queryType.value === MA_HOME_EQueryType['历史累计（不含实验局）']
  ) {
    return;
  }
  switch (type.value) {
    case MA_HOME_EDateType.按年:
      return 'yearrange';
    case MA_HOME_EDateType.按月:
      return 'monthrange';
    default:
      return;
  }
});
function mapDisabledDate(current: Date): boolean {
  if (dateScope.value.startTime && dateScope.value.endTime && dateScope.value.time) {
    // 超过当前时间 或者 早于托管开始时间 晚于托管结束时间
    return (
      current > new Date(dateScope.value.time) ||
      current < new Date(dateScope.value.startTime) ||
      current > new Date(dateScope.value.endTime)
    );
  }
  return true;
}
function mapDisableStartYear(current: Date) {
  if (dateScope.value.startTime && dateScope.value.endTime && dateScope.value.time) {
    // 超过当前时间 或者 早于托管开始时间 晚于托管结束时间
    return (
      current < new Date(dateScope.value.startTime) ||
      (date.value?.[1] ? current > date.value?.[1] : current > new Date(dateScope.value.endTime))
    );
  }
  return true;
}
function mapDisableEndYear(current: Date) {
  if (dateScope.value.startTime && dateScope.value.endTime && dateScope.value.time) {
    // 超过当前时间 或者 早于托管开始时间 晚于托管结束时间
    return (
      current >
        new Date(dateScope.value.endTime > dateScope.value.time ? dateScope.value.time : dateScope.value.endTime) ||
      (date.value?.[0] ? current < date.value?.[0] : current < new Date(dateScope.value.startTime))
    );
  }
  return true;
}

const elSearch = ref<HTMLButtonElement>();
function search(): void {
  // 建设期 运营期 实验局 需要时间
  if (![MA_HOME_EQueryType.历史累计, MA_HOME_EQueryType['历史累计（不含实验局）']].includes(queryType.value) && 
  (!date.value || date.value?.length === 0)) {
    if (!dateScope.value.startTime && !dateScope.value.endTime) {
      const messageStr = [String(MA_HOME_EQueryType.建设期), String(MA_HOME_EQueryType.实验局)]?.includes(
        String(queryType.value),
      )
        ? '暂未有该阶段的成本产生'
        : '请选择日期';
      message.error(messageStr);
    }
    return;
  }
  switch (queryType.value) {
    case MA_HOME_EQueryType.建设期:
    case MA_HOME_EQueryType.运营期:
    case MA_HOME_EQueryType.实验局:
      if (type.value === MA_HOME_EDateType.按月 || type.value === MA_HOME_EDateType.按年) {
        const format = 'yyyy-MM';

        // 如果startTime的年与当前选中年相同，则用startTime
        const sDate = date.value?.[0]
          ? formatDate(
              type.value === MA_HOME_EDateType.按年
                ? date.value?.[0].getFullYear() === new Date(dateScope.value?.startTime as number).getFullYear()
                  ? new Date(dateScope.value?.startTime as number)
                  : startOfYear(date.value?.[0])
                : date.value?.[0],
              format,
            )
          : '';
        // 如果endTime的年与当前选中年相同，则用endTime
        const eDate = date.value?.[1]
          ? formatDate(
              type.value === MA_HOME_EDateType.按年
                ? date.value?.[1].getFullYear() !== new Date(dateScope.value?.endTime as number).getFullYear()
                  ? endOfYear(date.value?.[1])
                  : new Date(dateScope.value?.endTime as number)
                : date.value?.[1],
              format,
            )
          : '';
        sDatabase.query(queryType.value, type.value, sDate, eDate);
      } else {
        sDatabase.query(queryType.value, type.value);
      }
      break;
    case MA_HOME_EQueryType.历史累计:
    case MA_HOME_EQueryType['历史累计（不含实验局）']:
      sDatabase.query(queryType.value, type.value);
      return;
    default:
      sDatabase.query(queryType.value, type.value);
      return;
  }
}
</script>

<style lang="less" scope>
#ma-home-search {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  > label {
    color: fade(black, 85%);
    line-height: 20px;
    font-weight: 500;
  }

  > el-select,
  > el-date-picker {
    width: 190px;
  }
}
</style>
