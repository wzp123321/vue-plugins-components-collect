<template>
  <page-container class="energy-consumption-control" id="energy-consumption-control" title="能耗管控">
    <template v-slot:pageSearch>
      <EccSearchBar></EccSearchBar>
    </template>
    <template v-slot:pageContent>
      <div class="ecc-main" v-loading="dataBaseService.loading">
        <section class="ecc-main-date-scope" v-if="dateScopeStr">
          <time>{{ dateScopeStr }}</time>
        </section>
        <!-- 能耗数据 -->
        <EccEnergyData :energyCardData="energyCardData" v-if="!dataBaseService.loading">
          <EccChartLine
            v-if="!mapIsSingleData()"
            :dataList="energyChartDataList"
            :height="366"
            :gridOption="energyGridOption"
            :colors="ECC_ENERGY_COLORS"
          ></EccChartLine>
          <EccChartBar
            v-if="mapIsSingleData()"
            :dataList="energyChartDataList"
            :height="366"
            :gridOption="energyGridOption"
            :colors="ECC_ENERGY_COLORS"
          ></EccChartBar
        ></EccEnergyData>
        <!-- 单价数据 -->
        <EccPriceData :priceCardData="priceCardData" :isSingleData="mapIsSingleData()" v-if="!dataBaseService.loading">
          <template v-slot:line-chart>
            <EccChartLine
              v-if="!mapIsSingleData()"
              :dataList="priceChartDataList"
              :height="249"
              :isPriceFlag="true"
              :gridOption="priceGridOption"
              :colors="ECC_PRICE_COLORS"
            ></EccChartLine>
            <EccChartBar
              v-if="mapIsSingleData()"
              :dataList="priceChartDataList"
              :height="249"
              :gridOption="priceGridOption"
              :colors="ECC_PRICE_COLORS"
            ></EccChartBar>
          </template>
        </EccPriceData>
        <!-- 节能数据-分区域时不展示 -->
        <ecc-energy-conservation
          :energySavingData="energySavingData"
          v-if="!dataBaseService.searchForm.hostingAreaId && !dataBaseService.loading"
        >
          <EccChartLine
            v-if="!mapIsSingleData()"
            :dataList="energySavingDataList"
            :height="249"
            :gridOption="priceGridOption"
            :colors="ECC_ENERGY_CONSERVATION_COLORS"
          ></EccChartLine>
          <EccChartBar
            v-else
            :dataList="energySavingDataList"
            :height="249"
            :gridOption="priceGridOption"
            :colors="ECC_ENERGY_CONSERVATION_COLORS"
          ></EccChartBar>
        </ecc-energy-conservation>
      </div>
    </template>
  </page-container>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import EccSearchBar from './components/ecc-search-bar/ecc-search-bar.vue';
import EccEnergyData from './components/ecc-energy-data/ecc-energy-data.vue';
import EccPriceData from './components/ecc-price-data/ecc-price-data.vue';
import EccChartBar from './components/ecc-chart-bar/ecc-chart-bar.vue';
import EccChartLine from './components/ecc-chart-line/ecc-chart-line.vue';
import EccEnergyConservation from './components/ecc-energy-conservation/ecc-energy-conservation.vue';

import dataBaseService from './energy-consumption-control.service';
import {
  ECC_ENERGY_COLORS,
  ECC_PRICE_COLORS,
  ECC_ENERGY_CONSERVATION_COLORS,
  ECC_IChartVO,
  ECC_IEnergyDataVO,
  ECC_IPriceDataVO,
  priceGridOption,
  energyGridOption,
  Ecc_ISavingCardDataVO,
} from './energy-consumption-control.api';

const destroy$ = new Subject<void>();
const energyCardData = ref<ECC_IEnergyDataVO>({
  unit: '',
  actualDiffRatio: '',
  actualDiffValue: null,
  actualValue: null,
  yearOnYearDiffRatio: '',
  yearOnYearDiffValue: null,
  yearOnYearValue: null,
  budgetDiffRatio: '',
  budgetDiffValue: null,
  budgetValue: null,
});
const energyChartDataList = ref<ECC_IChartVO[]>([]);
const priceCardData = ref<ECC_IPriceDataVO>({ unit: '', comprehensivePrice: null, contractPrice: null });
const energySavingData = ref<Ecc_ISavingCardDataVO>({ manageSavingRatio: '', technicalSavingRatio: '' });
const priceChartDataList = ref<ECC_IChartVO[]>([]);
const energySavingDataList = ref<ECC_IChartVO[]>([]);
const dateScopeStr = ref<string>('');
/**
 * 是否只有一条数据
 * @returns {boolean}
 */
const mapIsSingleData = (): boolean => {
  return (
    Array.isArray(energyChartDataList.value) &&
    energyChartDataList.value?.length !== 0 &&
    energyChartDataList.value?.[0] &&
    energyChartDataList.value?.[0]?.dataList?.length === 1
  );
};
onMounted(() => {
  dataBaseService.dateScopeResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    dateScopeStr.value = v;
  });
  dataBaseService.energyControlResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    const { energyChartList, energyDataVO, priceChartList, priceDataVO, savingDataVO, savingChartList } = v;
    energyCardData.value = energyDataVO;
    energyChartDataList.value = energyChartList;
    priceCardData.value = priceDataVO;
    priceChartDataList.value = priceChartList;
    energySavingData.value = savingDataVO;
    energySavingDataList.value = savingChartList;
  });
});
onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>
<style lang="less" scoped>
#energy-consumption-control {
  :deep(.tenant-pagecontainer__detail) {
    min-width: 1448px;
  }

  .ecc-main {
    display: flex;
    flex-direction: column;

    height: 100%;

    > .ecc-main-date-scope {
      padding: 11px 0;

      > time {
        height: 20px;
        line-height: 20px;
        color: var(--color-text-title);
        font-family: PingFang SC;
        font-weight: 500;
        font-size: 14px;
      }
    }
  }
}
</style>
