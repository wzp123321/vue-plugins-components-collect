<template>
  <div class="project-budget" ref="projectBudgetRef" id="project-budget">
    <div class="project-budget-container">
      <div class="project-budget-title">
        <h5>项目预算</h5>
        <div>
          <div>
            <te-select
              v-model="ProjectBudgetService.date"
              placeholder="请选择托管周期"
              @change="ProjectBudgetService.getProjectBudgetData"
              :teleported="false"
            >
              <te-option
                v-for="item in ProjectBudgetService.dateList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></te-option>
            </te-select>
          </div>
          <te-button @click="ProjectBudgetService.getProjectBudgetData"><icon-refresh-right /></te-button>
        </div>
      </div>
      <div class="project-budget-collapse" v-loading="pbService.loading">
        <div v-if="!pbService.loading && !pbService.is_Error">
          <EnergyConsumptionData />
          <ProBasicData />
          <ProTaxIncome />
        </div>
        <no-data v-if="pbService.is_Error"></no-data>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import ProjectBudgetService from './project-budget.service';
import { IconRefreshRight } from '@arco-iconbox/vue-te';
import pbService from './project-budget.service';

import { EnergyConsumptionData, ProBasicData, ProTaxIncome } from './components/index';
import { onMounted, onUnmounted, ref } from 'vue';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

const projectBudgetRef = ref(); //项目预算容器ref
const destroy$ = new Subject<void>();
onMounted(() => {
  pbService.scrollHeight$.pipe(takeUntil(destroy$), delay(200)).subscribe((v) => {
    if (projectBudgetRef.value) {
      projectBudgetRef.value.scrollTop = v; //滚动到对应的高度
    }
  });
});

onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>
<style lang="less" scoped>
.project-budget {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f0f4f9;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  .project-budget-container {
    padding: var(--te-space-20);
    background-color: var(--te-bg-color);
    flex: auto;
    display: flex;
    flex-direction: column;
  }
  .project-budget-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: var(--te-space-16);
    flex: none;
    > h5 {
      font-size: var(--te-font-size-h20);
      color: var(--te-text-color-primary);
      font-weight: 600;
    }

    > div {
      display: flex;
      gap: var(--te-space-12);
      flex-wrap: wrap;
      .te-button {
        width: 32px;
        height: 32px;
      }
    }
  }
  .project-budget-collapse {
    flex: auto;
  }
  :deep(.te-collapse-item__header) {
    font-size: var(--te-font-size-b14);
    font-weight: 600;
    color: var(--te-text-color-primary);
  }
  :deep(.is-right) {
    text-align: right !important;
  }
  :deep(.is-left) {
    text-align: left !important;
  }

  :deep(.pb-deep-color) {
    background-color: var(--te-fill-color-lighter) !important;
  }
  :deep(.pb-waring-cell) {
    background-color: var(--te-color-danger-light-9) !important;
    color: var(--te-color-danger) !important;
  }

  :deep(.te-table__header th) {
    border-bottom: 1px solid var(--te-border-color-lighter);
    border-right: 1px solid var(--te-border-color-lighter);
  }

  :deep(.te-button.te-button--primary.is-disabled) {
    cursor: not-allowed !important;
    span {
      color: var(--te-text-color-placeholder) !important;
    }
  }
  :deep(table > tbody > tr:nth-child(even)) > td {
    background-color: var(--te-fill-color-blank);
  }
  :deep(.te-table__body tr.hover-row > td.te-table__cell) {
    background-color: var(--te-table-row-hover-bg-color);
  }
  :deep(.pb-energy-consumption-data .te-collapse-item:last-child) {
    .te-collapse-item__content {
      padding-bottom: 0;
    }
  }
}
</style>

<style lang="less">
.pb-tooltip {
  > span:nth-child(1) {
    word-break: break-all;
    white-space: normal;
  }
}
</style>
