<!--
 * @Author: yut
 * @Date: 2023-08-24 09:57:54
 * @LastEditors: yut
 * @LastEditTime: 2023-08-25 16:50:46
 * @Descripttion: 
-->
<template>
  <div class="er-operate-bar">
    <div class="eob-container">
      <div class="eob-container-icon"></div>
      <div class="eob-container-title">费率模板列表</div>
    </div>
    <te-button type="primary" @click="addTemplate">新增模板</te-button>
  </div>
</template>
<script lang="ts" setup>
import energyRateService from '../energy-rate.service';
import { EEditType, EEnergyType, ETemplateType } from '../energy-rate.api';

/**
 * 新增
 */
const addTemplate = () => {
  energyRateService.visible = true;
  energyRateService.editType = EEditType.新增;
  energyRateService.editData = {
    energyCode: EEnergyType.电,
    templateType: ETemplateType.平价模板,
    effectiveTime: null,
    expirationTime: null,
    parity: null,
    sharp: null,
    peak: null,
    flat: null,
    valley: null,
  };
};
</script>
<style lang="less" scoped>
.er-operate-bar {
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .eob-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    &-icon {
      flex: none;
      width: 4px;
      height: 16px;
      background-color: var(--te-color-primary);
    }
    &-title {
      flex: auto;
      margin-left: 8px;
      height: 22px;
      line-height: 22px;
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      font-weight: 600;
      text-align: left;
    }
  }
}
</style>
