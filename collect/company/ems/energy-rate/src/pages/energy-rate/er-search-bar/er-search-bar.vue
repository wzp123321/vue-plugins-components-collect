<!--
 * @Author: yut
 * @Date: 2023-07-28 14:08:50
 * @LastEditors: yut
 * @LastEditTime: 2023-08-30 13:24:39
 * @Descripttion: 
-->
<template>
  <div class="er-search-bar">
    <div class="esb-container">
      <label class="--mr8">能源类型</label>
      <te-select v-model="energyRateService.energyType">
        <te-option v-for="item in energyTypeList" :key="item.code" :label="item.name" :value="item.code"> </te-option>
      </te-select>
    </div>
    <div class="esb-container">
      <label class="--mr8">模板类型</label>
      <te-select v-model="energyRateService.templateType">
        <te-option v-for="item in templateTypeList" :key="item.code" :label="item.name" :value="item.code"> </te-option>
      </te-select>
    </div>
    <div class="esb-container">
      <label class="--mr8">生效时间</label>
      <te-date-picker
        unlink-panels
        v-model="energyRateService.date"
        type="daterange"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        range-separator="~"
      >
      </te-date-picker>
    </div>

    <div class="esb-btns">
      <te-button type="primary" @click="energyRateService.onSearch">查询</te-button>
      <te-button plain @click="energyRateService.onReset">重置</te-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { EEnergyType, ETemplateType } from '../energy-rate.api';
import { onMounted, ref } from 'vue';
import energyRateService from '../energy-rate.service';

const templateTypeList = ref<{ name: string; code: string }[]>([]);
const energyTypeList = ref<{ name: string; code: string }[]>([]);
onMounted(() => {
  energyRateService.getEnergyTypeList().then(() => {
    energyTypeList.value = [{ code: '', name: '全部' }, ...energyRateService.energyTypeList];
  });
  energyRateService.getTemplateTypeList().then(() => {
    templateTypeList.value = [{ code: '', name: '全部' }, ...energyRateService.templateTypeList];
  });
});
</script>
<style lang="less" scoped>
.er-search-bar {
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  flex: none;
  place-content: center flex-start;
  flex-wrap: wrap;
  box-sizing: border-box;
  gap: 12px;
  border-bottom: 1px solid var(--te-border-color);
  .esb-container label {
    height: 22px;
    line-height: 22px;
    color: var(--te-text-color-primary);
    font-size: 14px;
    text-align: left;
  }
  .--mr8 {
    margin-right: 8px;
  }
}
</style>
