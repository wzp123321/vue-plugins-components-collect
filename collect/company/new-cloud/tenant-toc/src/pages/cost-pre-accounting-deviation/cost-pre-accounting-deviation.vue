<template>
  <div id="cost-pre-accounting-deviation" v-loading="cpadService.loading">
    <div :class="['cpad-container', !isShowRight ? 'container' : '']" v-show="!cpadService.loading">
      <section class="cpad-main left">
        <cpad-search></cpad-search>
        <cpad-table ref="cpadTableRef" :cpadService="cpadService" :isShowRight="isShowRight"></cpad-table>
      </section>
      <section class="right" v-if="isShowRight">
        <cpad-detail :cpadService="cpadService" @search="search"></cpad-detail>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
// API
import { onMounted, onUnmounted, ref } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// 组件
import CpadSearch from './components/cpad-search/cpad-search.vue';
import CpadTable from './components/cpad-table/cpad-table.vue';
import cpadDetail from './components/cpad-detail/cpad-detail.vue';
// 服务
import CpAdSearchBarService from './components/cpad-search/cpad-search.service';
import CpAdService from './cost-pre-accounting-deviation.service';
import { CPAD_EDateType } from './components/cpad-search/cpad-search.api';
import { nextTick } from 'vue';

const cpadService = new CpAdService();
const destroy$ = new Subject<void>();

const durationType = ref(CPAD_EDateType.按月);
const isShowRight = ref(true);

const cpadTableRef = ref();
const search = () => {
  CpAdSearchBarService.searchParamsRef$.pipe(takeUntil(destroy$)).subscribe(async (v) => {
    durationType.value = v.type!;
    isShowRight.value = mapSingleMonth(v.type!, v.startTime!, v.endTime!);
    await cpadService.query(v);
    if (cpadTableRef.value) {
      cpadTableRef.value.directCostEditFlag = false;
      cpadTableRef.value.operateCostEditFlag = false;
      cpadTableRef.value.projectIncomeEditFlag = false;
    }
  });
};

const mapSingleMonth = (type: CPAD_EDateType, sDate: string, eDate: string) => {
  return (
    type === CPAD_EDateType.按月 &&
    new Date(sDate).getMonth() === new Date(eDate).getMonth() &&
    new Date(sDate).getFullYear() === new Date(eDate).getFullYear()
  );
};

onMounted(() => {
  CpAdSearchBarService.searchParamsRef$.pipe(takeUntil(destroy$)).subscribe(async (v) => {
    durationType.value = v.type!;
    isShowRight.value = mapSingleMonth(v.type!, v.startTime!, v.endTime!);
    await cpadService.query(v);
    // 查询后，保证编辑框隐藏状态
    if (cpadTableRef.value) {
      cpadTableRef.value.directCostEditFlag = false;
      cpadTableRef.value.operateCostEditFlag = false;
      cpadTableRef.value.projectIncomeEditFlag = false;
    }
    nextTick(() => {
      // cpadService.mapElTableCellStyle();
    });
  });
});

onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>

<style lang="less" scoped>
#cost-pre-accounting-deviation {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: stretch;
  background-color: #f0f4f9;
  overflow: auto;

  h5 {
    font-size: 16px;
  }
  .cpad-container {
    width: 100%;
    height: 100%;
    gap: 16px;
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: minmax(1000px, 1fr) minmax(320px, 464px);
    place-content: stretch;
    place-items: stretch;
    .cpad-main {
      min-width: 1000px;
      height: fit-content;
      padding: 0 16px 16px;
      margin-bottom: 16px;
      background: var(--nts-white-color-font);
      box-shadow: 0px 1px 7px 0px rgba(38, 38, 38, 0.1);
      border-radius: 4px;
      // overflow: auto;
    }

    // .left {
    //   min-width: 1000px;
    // }

    // .right {
    //   min-width: 320px;
    // }
  }
  .container {
    display: flex;
    .left {
      flex: auto;
    }
  }
}
</style>
