<template>
  <div class="dsp-rank" v-loading="loading">
    <div class="dr-title">科室考核排行榜</div>
    <div class="dr-container flex-row-start-start" v-show="assessRankResult?.surplusRankList?.length && !loading">
      <div class="dr-container-total">
        <te-image
          :style="{ width: '256px', height: mapCoverImageHeight() }"
          :src="require('../../../../../assets/img/department-assessment/da-energy-count.svg')"
          :fit="'cover'"
        />
        <div class="dr-container-total-label">
          <p class="label">
            节能总量（{{ assessRankResult.unit }}）
            <te-tooltip effect="dark" placement="top">
              <template #content>
                <div style="white-space: normal; word-break: break-all">
                  节能总量(kwh) = (科室考核目标用能 - 科室实际用能)其中，考核目标用能 = 考核目标值 *
                  考核指标涉及的基础指标值[如: 单位业务量能耗目标值(kWh/人次)* 业务量(人次)]
                </div>
              </template>
              <icon-explain />
            </te-tooltip>
          </p>
          <p class="value" :title="thousandSeparation(assessRankResult.savingTotalValue as number)">
            {{ thousandSeparation(assessRankResult.savingTotalValue as number) }}
          </p>
        </div>
      </div>
      <DrTable
        :dataSource="assessRankResult.surplusRankList"
        :sortColumnName="`科室考核盈余(${assessRankResult.surplusRankUnit})`"
        :sortColumnKey="DR_ESortColumn.排名盈余"
        @sort="handleColumnSort"
      ></DrTable>
      <DrTable
        :dataSource="assessRankResult.surplusRatioList"
        sortColumnName="科室考核盈余率"
        :sortColumnKey="DR_ESortColumn.盈余率"
        unit="%"
        @sort="handleColumnSort"
      ></DrTable>
    </div>
    <no-data
      v-show="assessRankResult?.surplusRankList?.length === 0 && !loading"
      :imgUrl="require('../../../../../assets/img/common/common-empty.svg')"
      :marginTop="20"
      :height="160"
    ></no-data>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { mapGetters, useStore } from 'vuex';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import resultPublicityService from '../da-result-publicity.service';
import departmentAssessmentService from '../../department-assessment.service';
import { DRP_ConvertAssessResultVO, DRP_ESortType } from '../da-result-publicity.api';
import { DR_ESortColumn } from './dsp-rank.api';

import DrTable from './dr-table/dr-table.vue';
import { TeImage } from '@tiansu/element-plus';
import { IconExplain } from '@arco-iconbox/vue-te';

import { thousandSeparation } from '../../../../../utils/index';
import { COMMON_TABLE_HEADER_HEIGHT, COMMON_TABLE_CELL_HEIGHT } from '@/services/common/common-api';

// 可观察对象
const destroy$ = new Subject<void>();
// 页面loading
const loading = ref<boolean>(true);
// 排名值排序方式
const rankOrder = ref<string>(DRP_ESortType.降序);
// 排名盈余率排序方式
const radioOrder = ref<string>(DRP_ESortType.降序);
// 排行榜数据
const assessRankResult = ref<DRP_ConvertAssessResultVO>({
  savingTotalValue: 0,
  unit: 'kwh',
  surplusRankUnit: 'kwh',
  surplusRankList: [],
  surplusRatioList: [],
});
// store
const store = useStore();
// 查询表单
const searchForm = computed(mapGetters(['searchForm']).searchForm.bind({ $store: store }));
/**
 * 处理图片高度
 */
const mapCoverImageHeight = () => {
  //两个表格数据较多的
  const max = Math.max(assessRankResult.value.surplusRankList?.length, assessRankResult.value.surplusRatioList?.length);
  // 不超过10个
  const min = Math.min(10, max);
  return `${min * COMMON_TABLE_CELL_HEIGHT + COMMON_TABLE_HEADER_HEIGHT}px`;
};
/**
 * 列排序
 */
const handleColumnSort = (property: string, order: string) => {
  console.log(property, order);
  switch (property) {
    case DR_ESortColumn.排名盈余:
      rankOrder.value = order;
      break;
    case DR_ESortColumn.盈余率:
      radioOrder.value = order;
      break;
  }
  resultPublicityService.queryRankList(searchForm.value, rankOrder.value, radioOrder.value);
};
/**
 * 初始化，获取科室考核数据
 */
onMounted(() => {
  // 订阅配置信息
  departmentAssessmentService.configResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    const unConfigureFlag =
      !v?.configFlag || v?.energyCodeList?.length === 0 || v?.indexIdList?.length === 0 || v?.treeIdList?.length === 0;
    if (unConfigureFlag) {
      assessRankResult.value.savingTotalValue = null;
      assessRankResult.value.unit = '';
      assessRankResult.value.surplusRankUnit = '';
      assessRankResult.value.surplusRankList = [];
      assessRankResult.value.surplusRatioList = [];
    }
  });
  // 订阅查询结果
  resultPublicityService.assessRankResult.pipe(takeUntil(destroy$)).subscribe((v) => {
    assessRankResult.value.savingTotalValue = v?.savingTotalValue ?? null;
    assessRankResult.value.unit = v?.unit ?? '';
    assessRankResult.value.surplusRankUnit = v?.surplusRankUnit ?? '';
    assessRankResult.value.surplusRankList = v?.surplusRankList ?? [];
    assessRankResult.value.surplusRatioList = v?.surplusRatioList ?? [];
  });
  // 订阅loading
  resultPublicityService.rankLoading.pipe(takeUntil(destroy$)).subscribe((v) => {
    loading.value = v;
  });
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
.dsp-rank {
  width: 100%;
  min-height: 150px;

  .dr-title {
    color: var(--te-text-color-primary);
    font-family: PingFang SC;
    font-weight: 600;
    font-size: var(--te-font-size-h16);
    line-height: 24px;
    margin-top: 24px;
    margin-bottom: 16px;
  }

  .dr-container {
    gap: 10px;
    overflow: hidden;

    .dr-container-total {
      position: relative;
      min-width: 256px;
      max-width: 256px;

      .dr-container-total-label {
        top: 17.6%;
        position: absolute;
        width: 100%;

        p {
          width: 100%;
          text-align: center;
          white-space: nowrap;
        }

        p.label {
          color: var(--te-text-color-secondary);
          font-size: var(--te-font-size-b14);
          line-height: 22px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        p.value {
          color: var(--te-text-color-primary);
          font-weight: 700;
          font-size: 28px;
          line-height: 36px;

          margin-top: 6px;

          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    :deep(.dr-table) {
      flex: 1 1 0%;
    }
  }
}
</style>
