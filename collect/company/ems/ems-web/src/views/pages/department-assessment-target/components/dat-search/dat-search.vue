<!--
 * @Author: yut
 * @Date: 2023-07-11 11:20:16
 * @LastEditors: yut
 * @LastEditTime: 2023-08-11 11:14:09
 * @Descripttion: 科室考核目标值维护搜索栏
-->
<template>
  <div class="dat-search">
    <te-form :inline="true" @submit.native.prevent>
      <te-form-item label="节点名称">
        <te-input
          v-model="datService.keyword"
          placeholder="请输入节点名称"
          v-inputFilter:search="{ allowSpace: false }"
        />
      </te-form-item>
      <te-form-item label="能源类型">
        <te-select v-model="datService.energyType" placeholder="请选择能源类型">
          <te-option
            v-for="item in datService.energyTypeList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          ></te-option>
        </te-select>
      </te-form-item>
      <te-form-item label="日期">
        <te-date-picker
          v-model="datService.date"
          value-format="YYYY-MM"
          :clearable="false"
          type="month"
          range-separator="至"
          placeholder="开始日期时间"
        />
      </te-form-item>
      <te-form-item>
        <te-button primary @click.stop="datService.onSubmit">查询</te-button>
        <te-button @click.stop="datService.onReset">重置</te-button>
      </te-form-item>
    </te-form>
  </div>
</template>

<script lang="ts" setup>
import { TeButton, TeInput, TeSelect, TeDatePicker, TeForm, TeFormItem, TeOption } from '@tiansu/element-plus';
import { datService } from '../../department-assessment-target.service';

/**
 * 禁用过去5年
 * @param date
 */
const disabledDate = (date: Date) => {
  return date.getFullYear() < new Date().getFullYear() - 5;
};
</script>

<style lang="less" scoped>
:deep(.te-form) {
  white-space: normal !important;
}
button[primary]:enabled:hover {
  color: var(--te-button-hover-text-color);
  border-color: var(--te-button-hover-border-color);
  background-color: var(--te-button-hover-bg-color);
}
</style>
