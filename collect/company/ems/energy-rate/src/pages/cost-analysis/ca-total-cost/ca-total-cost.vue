<template>
  <div class="ca-total-cost">
    <div class="ctc-total">
      <p class="ctc-title">分析对象总成本</p>
      <p class="ctc-value">
        <span>{{ costAnalysisService?.costProgressData?.tenThousandCost ?? '--' }}</span>
        <span v-if="checkEmpty(costAnalysisService?.costProgressData?.totalCost)">
          {{ costAnalysisService?.costProgressData?.unit }}
        </span>
      </p>
    </div>
    <!-- 进度条 -->
    <ca-cost-progress
      :total="(costAnalysisService?.costProgressData?.totalCost as number)"
      :dataSource="costAnalysisService?.costProgressData?.stripData"
    ></ca-cost-progress>
  </div>
</template>
<script lang="ts" setup>
import costAnalysisService from '../cost-analysis.service';

import CaCostProgress from '../ca-cost-progress/ca-cost-progress.vue';

/**
 * 校验数据是否为空
 * @param value
 */
const checkEmpty = (value: number | null) => {
  return value !== null;
};
</script>
<style lang="less" scoped>
.ca-total-cost {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 10px;
  margin-top: 13px;

  min-height: 136px;

  .ctc-total {
    width: 20%;
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    p.ctc-title {
      color: #000000a6;
      font-size: 16px;
      font-weight: 700;
    }

    p.ctc-value {
      margin-top: 12px;

      span {
        color: #008bff;
        font-size: 30px;
        font-weight: 500;
        display: inline-block;
      }
    }
  }
}
</style>
