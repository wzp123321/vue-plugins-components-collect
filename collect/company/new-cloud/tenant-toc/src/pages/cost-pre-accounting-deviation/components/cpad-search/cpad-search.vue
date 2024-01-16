<!--
 * @Author: yut
 * @Date: 2023-09-13 16:23:03
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 09:31:32
 * @Descripttion: 
-->
<template>
  <div class="cpad-search">
    <h5>项目预核算偏差</h5>
    <te-form inline>
      <te-form-item>
        <te-select v-model="cpadsService.durationType" placeholder="请选择" @change="onTypeChange">
          <te-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </te-select>
      </te-form-item>
      <te-form-item v-if="cpadsService.durationType !== CPAD_EDateType.累计">
        <TeDateRangePicker
          :clearable="false"
          @change="dateChange"
          :format="cpadsService.durationType === CPAD_EDateType.按年 ? 'YYYY' : 'YYYY-MM'"
          v-model:value="cpadsService.date"
          :mode="dateSelectMode"
          :disabled-date="mapDisabledDate"
          :disabledStartYear="mapDisableStartYear"
          :disabledEndYear="mapDisableEndYear"
        ></TeDateRangePicker>
      </te-form-item>
      <te-form-item>
        <te-button @click="search"><icon-refresh-right /></te-button>
      </te-form-item>
    </te-form>
  </div>
</template>
<script lang="ts" setup>
import TeDateRangePicker from '../../../../components/te-date-range-picker/te-date-range-picker.vue';
import cpadsService from './cpad-search.service';
import { ref, onMounted, computed } from 'vue';
import { IconRefreshRight } from '@arco-iconbox/vue-te';
import { CPAD_EDateType } from './cpad-search.api';
import { sDatabase } from '@/pages/management-analysis/ma-home/services';
import { formatDate } from '@/utils';
import { endOfYear, startOfYear, startOfMonth, endOfMonth } from 'date-fns';

/**
 * 时间维度
 */
const typeOptions = computed(() =>
  Object.entries(CPAD_EDateType)
    .filter(([k, v]) => typeof v === 'number')
    .map(([k, v]) => ({ label: k, value: v })),
);

/**
 * 时间维度类型
 */
const dateSelectMode = computed(() => {
  switch (cpadsService.durationType) {
    case CPAD_EDateType.按年:
      return 'yearrange';
    case CPAD_EDateType.按月:
      return 'monthrange';
    default:
      return;
  }
});

/**
 * 选择的时间范围
 */
const dateScope = ref<{
  time?: number;
  startTime?: number;
  endTime?: number;
}>({
  time: 0,
  startTime: 0,
  endTime: 0,
});

const dateChange = () => {
  setTimeout(() => {
    search();
  }, 100);
};

function onTypeChange(): void {
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate());
  const d =
    !dateScope.value?.endTime || new Date().getTime() < dateScope.value?.endTime
      ? lastMonth
      : new Date(dateScope.value?.endTime);
  cpadsService.date = [d, d];
  search();
}

/**
 * 如果没有开始结束时间 则时间为null
 */
async function onDateScopeQuery(): Promise<void> {
  dateScope.value = await cpadsService.queryDateScope();
  if (!dateScope.value.startTime && !dateScope.value.endTime) {
    cpadsService.date = [];
    return;
  }
  if (dateScope.value?.endTime) {
    const y = new Date(dateScope.value?.endTime).getFullYear();
    if (dateScope.value.time && new Date(dateScope.value.time)?.getFullYear() > y) {
      cpadsService.date = [new Date(dateScope.value?.endTime as number), new Date(dateScope.value?.endTime)];
    } else {
      const currentDate = dateScope.value?.time ? new Date(dateScope.value?.time) : new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
      cpadsService.date = [lastMonth, lastMonth];
    }
  } else if (!dateScope.value?.endTime && !dateScope.value?.startTime) {
    cpadsService.date = [];
  }
}

/**
 * 禁用日期
 */
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

/**
 * 禁用年份
 * @param current
 */
function mapDisableStartYear(current: Date) {
  if (dateScope.value.startTime && dateScope.value.endTime && dateScope.value.time) {
    // 超过当前时间 或者 早于托管开始时间 晚于托管结束时间
    return (
      current < new Date(dateScope.value.startTime) ||
      (cpadsService.date?.[1] ? current > cpadsService.date?.[1] : current > new Date(dateScope.value.endTime))
    );
  }
  return true;
}

/**
 * 禁用结束年份
 * @param current
 */
function mapDisableEndYear(current: Date) {
  if (dateScope.value.startTime && dateScope.value.endTime && dateScope.value.time) {
    // 超过当前时间 或者 早于托管开始时间 晚于托管结束时间
    return (
      current >
        new Date(dateScope.value.endTime > dateScope.value.time ? dateScope.value.time : dateScope.value.endTime) ||
      (cpadsService.date?.[0] ? current < cpadsService.date?.[0] : current < new Date(dateScope.value.startTime))
    );
  }
  return true;
}

/**
 * 搜索
 */
const search = () => {
  if (cpadsService.durationType === CPAD_EDateType.按月 || cpadsService.durationType === CPAD_EDateType.按年) {
    const format = 'yyyy-MM-dd';
    // 如果startTime的年与当前选中年相同，则用startTime
    const sDate = cpadsService.date?.[0]
      ? formatDate(
          cpadsService.durationType === CPAD_EDateType.按年
            ? cpadsService.date?.[0].getFullYear() === new Date(dateScope.value?.startTime as number).getFullYear()
              ? new Date(dateScope.value?.startTime as number)
              : startOfYear(cpadsService.date?.[0])
            : startOfMonth(cpadsService.date?.[0]),
          format,
        )
      : '';
    // 如果endTime的年与当前选中年相同，则用endTime
    const eDate = cpadsService.date?.[1]
      ? formatDate(
          cpadsService.durationType === CPAD_EDateType.按年
            ? cpadsService.date?.[1].getFullYear() !== new Date(dateScope.value?.endTime as number).getFullYear()
              ? endOfYear(cpadsService.date?.[1])
              : new Date(dateScope.value?.endTime as number)
            : endOfMonth(cpadsService.date?.[1]),
          format,
        )
      : '';
    cpadsService.search(sDate, eDate);
  } else {
    cpadsService.search();
  }
};

onMounted(async () => {
  await onDateScopeQuery();
  search();
});
</script>
<style lang="less" scoped>
.cpad-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  h5 {
    font-size: var(--te-font-size-h20);
    font-weight: 600;
    color: var(--te-text-color-primary);
  }
  .te-select {
    width: 160px;
  }
  .te-button {
    width: 32px;
  }
  // :deep(.te-range-editor) {
  //   width: 280px !important;
  // }

  .te-form-item {
    margin-bottom: 0;
    margin-right: var(--te-space-12);
  }
}
</style>
