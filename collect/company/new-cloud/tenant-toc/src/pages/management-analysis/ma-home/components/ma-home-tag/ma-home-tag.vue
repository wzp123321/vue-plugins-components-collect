<template>
  <div id="ma-home-tag">
    <span class="ma-home-tag-normal">{{ hostingType }}</span>
    <span class="ma-home-tag-normal" :rank="mapRiskRank(riskType)">{{ riskType }}</span>
    <span class="ma-home-tag-normal">{{ benchmarkType }}</span>
    <!-- <el-tooltip
      popper-class="ma-home-tag-tooltip"
      placement="bottom-end"
      transition="ease"
      :hide-after="0"
      :content="profitDetail"
      :disabled="!profitDetail"
    >
      <span class="ma-home-tag-normal">{{ profitType }}</span>
    </el-tooltip> -->
  </div>
</template>

<script lang="ts" setup>
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { onMounted, onUnmounted, ref } from 'vue';
import { MA_HOME_ERiskRank, sInfo } from '../../services';

const destroy$ = new Subject<void>();
onMounted(() => {
  sInfo.refHostingType$.pipe(takeUntil(destroy$)).subscribe((v) => (hostingType.value = v));
  sInfo.refRiskType$.pipe(takeUntil(destroy$)).subscribe((v) => (riskType.value = v));
  sInfo.refBenchmarkType$.pipe(takeUntil(destroy$)).subscribe((v) => (benchmarkType.value = v));
  sInfo.refProfitType$.pipe(takeUntil(destroy$)).subscribe((v) => (profitType.value = v));
  sInfo.refProfitDetailList$.pipe(takeUntil(destroy$)).subscribe((v) => (profitDetail.value = v.join('\n')));
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});

const hostingType = ref<string>();
const riskType = ref<MA_HOME_ERiskRank>();
const benchmarkType = ref<string>();
const profitType = ref<string>();
const profitDetail = ref<string>();
function mapRiskRank(risk: MA_HOME_ERiskRank): string | void {
  switch (risk) {
    case MA_HOME_ERiskRank.health:
      return 'health';
    case MA_HOME_ERiskRank.warn:
      return 'warn';
    case MA_HOME_ERiskRank.danger:
      return 'danger';
    default:
      break;
  }
}
</script>

<style lang="less" scope>
#ma-home-tag {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;

  > .ma-home-tag-normal {
    height: 36px;
    padding: 8px 16px;
    color: white;
    background-color: rgba(0, 156, 255, 1);
    border-radius: 4px;
    line-height: 20px;

    &[rank='health'] {
      background-color: rgba(0, 178, 97, 1);
    }
    &[rank='warn'] {
      background-color: rgb(255, 203, 32, 1);
    }
    &[rank='danger'] {
      background-color: rgba(255, 95, 98, 1);
    }
  }
}

.el-popper.ma-home-tag-tooltip {
  padding: 8px 14px;
  color: white;
  background-color: rgba(0, 156, 255, 1);
  font-size: 14px;
  white-space: pre-wrap;

  > .el-popper__arrow::before {
    background-color: rgba(0, 156, 255, 1);
  }
}
</style>
