<template>
  <div class="dsp-search-bar">
    <te-form :inline="true" :model="pageForm">
      <!-- 能源类型 -->
      <te-form-item label="能源类型">
        <te-radio-group v-model="pageForm.energyCode" :disabled="!configureFlag">
          <te-radio-button v-for="item in energyList" :key="item.code" :label="item.code" :value="item.code">
            {{ item.name }}
          </te-radio-button>
        </te-radio-group>
      </te-form-item>
      <!-- 日期 -->
      <te-form-item label="日期">
        <te-date-picker
          :disabled="!configureFlag"
          v-model="pageForm.date"
          type="month"
          placeholder="请选择日期"
          :disabled-date="mapDateDisabled"
        ></te-date-picker>
      </te-form-item>
      <!-- 考核指标 -->
      <te-form-item label="考核指标">
        <te-select v-model="pageForm.indexId" :disabled="!configureFlag">
          <te-option v-for="item in indexList" :key="item.id" :value="item.id" :label="item.name"></te-option>
        </te-select>
      </te-form-item>
      <!-- 按钮 -->
      <te-form-item>
        <te-button type="primary" @click="search" :disabled="!configureFlag">查询</te-button>
        <te-button @click="reset" :disabled="!configureFlag">重置</te-button>
      </te-form-item>
    </te-form>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { ref, onMounted, onUnmounted } from 'vue';
import { subMonths } from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { useStore } from 'vuex';
// 组件
import {
  TeForm,
  TeFormItem,
  TeButton,
  TeRadioGroup,
  TeRadioButton,
  TeDatePicker,
  TeSelect,
  TeOption,
} from '@tiansu/element-plus';
// 服务 api
import { DSB_IPageForm } from './dsp-search-bar.api';
import departmentAssessmentService from '../../department-assessment.service';
import resultPublicityService from '../da-result-publicity.service';
import { Common_ICodeName } from '@/services/common/common-api';
import { DPC_IIndexVO } from '../../da-params-configure/da-params-configure.api';
// 工具方法
import message from '@/utils/message';
// 可观察对象
const destroy$ = new Subject<void>();
// 表单
const pageForm = ref<DSB_IPageForm>({
  energyCode: '',
  date: subMonths(new Date(), 1),
  indexId: undefined,
});
// 能源类型列表
const energyList = ref<Common_ICodeName[]>([]);
// 指标列表
const indexList = ref<DPC_IIndexVO[]>([]);
// store
const store = useStore();
// 是否勾选配置项
const configureFlag = ref<boolean>(false);
/**
 * 日期禁用
 * @param {Date} current
 * @returns {boolean}
 */
const mapDateDisabled = (current: Date): boolean => {
  return current.getTime() > new Date().getTime();
};
/**
 * 查询
 */
const search = () => {
  if (!pageForm.value.energyCode) {
    message.error('能源类型不能为空');
    return;
  }
  if (!pageForm.value.date) {
    message.error('日期不能为空');
    return;
  }
  if (!pageForm.value.indexId) {
    message.error('考核指标不能为空');
    return;
  }
  // 如果配置不全，则不调用接口
  if (!configureFlag.value) {
    resultPublicityService.resetLoading();
    return;
  }
  store.dispatch('setSearchForm', pageForm.value);
  resultPublicityService.query(pageForm.value);
};
/**
 * 重置
 */
const reset = () => {
  pageForm.value.energyCode = energyList.value?.[0]?.code;
  pageForm.value.date = subMonths(new Date(), 1);
  pageForm.value.indexId = indexList.value?.[0]?.id;
  search();
};
/**
 * 初始化，订阅页面配置信息
 */
onMounted(() => {
  departmentAssessmentService.configResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    // 2023-12-21----不用判断是否配置过，可能其他用户已经配置了数据，所以只要是否判断配置了能源类型或者指标类型
    configureFlag.value =
      v?.energyCodeList?.length !== 0 && v?.indexIdList?.length !== 0 && v?.treeIdList?.length !== 0;

    // 先取勾选的能源类型，如果没有勾选则展示全量
    energyList.value = v?.energyCodeList?.length ? v?.energyCodeList : v?.allEnergyCodeList;
    pageForm.value.energyCode = configureFlag.value && energyList.value?.[0]?.code ? energyList.value?.[0]?.code : '';
    pageForm.value.indexId = v?.indexIdList?.[0]?.id ?? '';
    indexList.value = v?.indexIdList ?? [];

    if (!configureFlag.value) {
      resultPublicityService.resetLoading();
    } else {
      store.dispatch('setSearchForm', pageForm.value);
      resultPublicityService.query(pageForm.value);
    }
  });
});
/**
 * 组件销毁
 */
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
.dsp-search-bar {
  padding: 24px 0 0 0;
  border-bottom: 1px solid var(--te-border-color);

  :deep(.te-form.te-form--inline) {
    white-space: normal;
  }
}
</style>
