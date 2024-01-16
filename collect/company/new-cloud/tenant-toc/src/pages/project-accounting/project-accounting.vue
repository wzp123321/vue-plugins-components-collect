<!--
 * @Author: yut
 * @Date: 2023-08-25 14:23:40
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 15:59:53
 * @Descripttion: 
-->
<template>
  <div class="project-accounting" ref="projectAccountRef" id="project-accounting">
    <div class="project-accounting-container">
      <div class="project-accounting-title">
        <h5>项目核算</h5>
        <div>
          <te-button
            :type="!paService.exportDisable ? 'primary' : ''"
            @click="paService.export"
            :disabled="paService.exportDisable"
            >导出</te-button
          >
          <div>
            <te-select
              v-model="paService.date"
              placeholder="请选择托管周期"
              @change="paService.getProjectAccountingData"
              :teleported="false"
            >
              <te-option
                v-for="item in paService.dateList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></te-option>
            </te-select>
          </div>
          <te-button class="project-accounting-refresh" @click="paService.getProjectAccountingData"
            ><icon-refresh-right
          /></te-button>
        </div>
      </div>
      <div class="project-accounting-collapse" v-loading="paService.loading">
        <te-collapse v-model="paService.activeCollapse" v-if="!paService.loading && !paService.is_Error">
          <div v-for="(item, index) in paService.dataSource.energyConsumptionIncomeCostData">
            <te-collapse-item
              :class="index === paService.dataSource.energyConsumptionIncomeCostData?.length - 1 ? 'pa-last' : ''"
              v-if="item.moduleVOList.length"
              :title="item.typeName"
              :name="item.typeName"
            >
              <pa-table :data="item" :index="index"></pa-table>
            </te-collapse-item>
          </div>
          <pa-table
            class="total-table"
            :data="paService.dataSource.baseData"
            v-if="paService.dataSource.baseData.moduleVOList.length"
          ></pa-table>
          <div v-for="(item, index) in paService.dataSource.taxDifferenceIncomeData">
            <te-collapse-item v-if="item.moduleVOList.length" :title="item.typeName" :name="item.typeName">
              <pa-table :data="item" :index="index"></pa-table>
            </te-collapse-item>
          </div>
        </te-collapse>
        <no-data v-if="paService.is_Error"></no-data>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import paService from './project-accounting.service';
import { IconRefreshRight } from '@arco-iconbox/vue-te';
import PaTable from './pa-table/pa-table.vue';

import { onMounted, onUnmounted, ref } from 'vue';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';

const projectAccountRef = ref(); //项目核算容器ref
const destroy$ = new Subject<void>();
onMounted(() => {
  paService.scrollHeight$.pipe(takeUntil(destroy$), delay(200)).subscribe((v) => {
    if (projectAccountRef.value) {
      projectAccountRef.value.scrollTop = v; //滚动到对应的高度
    }
  });
});

onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>
<style lang="less" scoped>
.project-accounting {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f0f4f9;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  .project-accounting-container {
    padding: var(--te-space-20);
    background-color: var(--te-bg-color);
    flex: auto;
    display: flex;
    flex-direction: column;
  }
  .project-accounting-title {
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
      .project-accounting-refresh {
        width: 32px;
        height: 32px;
      }
    }
  }
  .project-accounting-collapse {
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

  :deep(.pa-deep-color) {
    background-color: var(--te-fill-color-lighter) !important;
  }
  :deep(.pa-waring-cell) {
    background-color: var(--te-color-danger-light-9) !important;
    color: var(--te-color-danger) !important;
  }

  :deep(.te-table__header th) {
    border-bottom: 1px solid var(--te-border-color-lighter) !important;
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
  :deep(.total-table) {
    padding-top: 24px;
  }
  :deep(.pa-last .te-collapse-item__content) {
    padding-bottom: 0;
  }
  :deep(.te-collapse-item:last-child) {
    margin-bottom: 0;
  }
}
</style>
