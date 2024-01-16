<template>
  <div id="ma-home">
    <component :is="ModelComponent" />

    <h3>经营分析</h3>
    <main>
      <div class="ma-home-toolbar-container">
        <component :is="SearchComponent" />
        <component :is="TagComponent" />
      </div>
      <span class="ma-home-date" :ghost="!canShowDate">{{ date }}</span>
      <div class="ma-home-chart-container">
        <component :is="ChartComponent" />
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ChartComponent, ModelComponent, SearchComponent, TagComponent } from './components';
import { MA_HOME_EDateType, MA_HOME_EQueryType, sDatabase } from './services';

const destroy$ = new Subject<void>();
onMounted(() => {
  sDatabase.refDimension$.pipe(takeUntil(destroy$)).subscribe((v) => {
    // 建设期运营期实验局 & 按年、累计 ||  历史累计
    canShowDate.value =
      v &&
      (([MA_HOME_EQueryType.运营期, MA_HOME_EQueryType.建设期, MA_HOME_EQueryType.实验局].includes(v) &&
        [MA_HOME_EDateType.按年, MA_HOME_EDateType.累计, MA_HOME_EDateType.按月].includes(
          sDatabase.dateType as MA_HOME_EDateType
        )) ||
        [MA_HOME_EQueryType.历史累计, MA_HOME_EQueryType['历史累计（不含实验局）']].includes(v));
  });
  sDatabase.refStart$.pipe(takeUntil(destroy$)).subscribe((v) => (start.value = v));
  sDatabase.refEnd$.pipe(takeUntil(destroy$)).subscribe((v) => (end.value = v));
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});

const canShowDate = ref<boolean>();
const start = ref<Date>();
const end = ref<Date>();
const date = computed(() =>
  start.value && end.value ? `${dayjs(start.value).format('YYYY年M月')}～${dayjs(end.value).format('YYYY年M月')}` : ''
);
</script>

<style lang="less" scope>
#ma-home {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  background-color: rgba(240, 244, 249, 1);
  user-select: none;

  > h3 {
    font-size: 16px;
  }

  > main {
    flex: auto;
    min-height: 777px;
    overflow: hidden;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    gap: 12px;
    border-radius: 2px;
  }

  .ma-home- {
    &toolbar-container {
      flex: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    &chart-container {
      flex: auto;
      overflow: hidden;
    }

    &date {
      height: 20px;
      color: rgba(54, 54, 54, 1);
      line-height: 20px;

      &[ghost='true'] {
        visibility: hidden;
      }
    }
  }
}
</style>
