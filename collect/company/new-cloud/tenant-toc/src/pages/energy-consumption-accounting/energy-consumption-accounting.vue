<!--
 * @Author: yut
 * @Date: 2023-08-25 14:23:40
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 10:52:17
 * @Descripttion: 
-->
<template>
  <div class="energy-consumption-accounting">
    <div class="eca-container">
      <div class="eca-title">
        <h5>能耗核算</h5>
        <div>
          <te-button
            :type="!ecaService.exportDisable ? 'primary' : ''"
            @click="ecaService.export()"
            :disabled="ecaService.exportDisable"
            >导出</te-button
          >
          <te-select v-model="ecaService.date" @change="handlePeriodChange" placeholder="请选择托管周期">
            <te-option
              v-for="item in ecaService.dateList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></te-option>
          </te-select>
          <te-button class="eca-refresh" @click="ecaService.getEnergyConsumptionAccountingData()"
            ><icon-refresh-right
          /></te-button>
        </div>
      </div>
      <div class="eca-collapse" v-loading="ecaService.loading">
        <te-collapse v-model="ecaService.activeCollapse" v-if="ecaService.dataSource.length">
          <te-collapse-item
            v-for="(item, index) in ecaService.dataSource"
            :title="numTochnum(item.moduleIndex) + '、' + item.typeName"
            :key="'dataSource_' + index"
            :name="item.typeName"
          >
            <component :is="getMapComponent(item.type)" :componentData="item"></component>
          </te-collapse-item>
        </te-collapse>
        <no-data v-if="!ecaService.loading && !ecaService.dataSource.length"></no-data>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
//组件
import { EcaEnergyConsumptionTable, EcaApprovedEnergyEvent } from './components/index';
//图标
import { IconRefreshRight } from '@arco-iconbox/vue-te';
//服务
import ecaService from './energy-consumption-accounting.service';
import { EAccountingType } from './energy-consumption-accounting.api';

/**
 * 托管周期变更
 * @param value
 */
const handlePeriodChange = (value: number | null) => {
  ecaService.dateList?.forEach((item) => {
    if (item.code === value) {
      ecaService.queryParams.startTime = ecaService.mapTime(item.start.year, item.start.monthOfYear);
      ecaService.queryParams.endTime = ecaService.mapTime(item.end.year, item.end.monthOfYear);
      ecaService.queryParams.months = item.months;
    }
  });
  ecaService.getEnergyConsumptionAccountingData();
};

/**
 * 阿拉伯数字转成中文数字
 * @param num 阿拉伯数字
 */
const numTochnum = (index: string) => {
  const num = Number(index) - 1;
  let strNum = ['一', '二', '三', '四', '五', '六', '七'];
  return strNum[num];
};

/**
 *  组件加载
 * @param type 组件类型
 */
const getMapComponent = (type: string) => {
  let component = null;
  switch (type) {
    case EAccountingType.能耗基准:
    case EAccountingType['改造前能耗(预算-可研)']:
    case EAccountingType['改造后能耗(实缴)']:
    case EAccountingType.单价调差:
      component = EcaEnergyConsumptionTable;
      break;
    case EAccountingType.项目总收益:
    case EAccountingType.已核定能源事件:
    case EAccountingType['项目总收益(调整后)']:
      component = EcaApprovedEnergyEvent;
      break;
    default:
      break;
  }
  return component;
};
</script>
<style lang="less" scoped>
.energy-consumption-accounting {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f0f4f9;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  .eca-container {
    padding: var(--te-space-20);
    background-color: var(--te-bg-color);
    flex: auto;
    display: flex;
    flex-direction: column;
  }
  .eca-title {
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
      .eca-refresh {
        width: 32px;
        height: 32px;
        margin-left: 0;
      }
    }
  }
  .eca-collapse {
    flex: auto;
  }
  :deep(.is-right) {
    text-align: right !important;
  }
  :deep(.is-left) {
    text-align: left !important;
  }
  //深色
  :deep(.eca-deep-color) {
    background-color: var(--te-fill-color-lighter) !important;
  }
  //警告
  :deep(.eca-waring-cell) {
    background-color: var(--te-color-danger-light-9) !important;
    color: var(--te-color-danger) !important;
  }
  :deep(.eca-expand-head > .cell) {
    display: flex;
    align-items: center;
  }

  //编辑
  :deep(tr td > .cell .eca-edit) {
    display: none;
  }
  :deep(tr td > .cell) {
    position: relative;
    &:hover .eca-edit {
      cursor: pointer;
      margin-left: var(--te-space-8);
      display: inline-block;
      position: absolute;
      right: 0;
    }
  }

  :deep(.te-collapse-item__header) {
    font-size: var(--te-font-size-b14);
    font-weight: 600;
    color: var(--te-text-color-primary);
  }
  :deep(table > tbody > tr:nth-child(even)) > td {
    background-color: var(--te-fill-color-blank);
  }
  :deep(.te-table__body tr.hover-row > td.te-table__cell) {
    background-color: var(--te-table-row-hover-bg-color);
  }
  :deep(.eca-remark) {
    display: flex;
    align-items: center;
    span:nth-child(1) {
      flex: auto;
      width: 0;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    span:nth-child(2) {
      flex: none;
      width: 16px;
      height: 16px;
    }
  }
  :deep(.eca-cell-border) {
    // border-right: 1px solid var(--te-border-color-lighter);
  }
  :deep(.eca-header .is-right) {
    text-align: center !important;
  }
  :deep(.te-table__header th) {
    border-bottom: 1px solid var(--te-border-color-lighter);
    border-right: 1px solid var(--te-border-color-lighter);
  }
}
</style>
