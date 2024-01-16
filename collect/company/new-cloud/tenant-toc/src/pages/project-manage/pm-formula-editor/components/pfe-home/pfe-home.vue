<template>
  <div class="pfe-home" v-loading="draggableFormulaService.loading">
    <!-- 条件组 -->
    <template
      v-if="
        (draggableFormulaService.groupList.length !== 0 || draggableFormulaService.serviceDataIndexList.length !== 0) &&
        !draggableFormulaService.loading
      "
    >
      <!-- 维护数据 -->
      <ph-service-data></ph-service-data>
      <!-- 条件组 -->
      <ph-condition-group
        v-for="(item, index) in draggableFormulaService.groupList"
        :key="item.groupId"
        :groupInfo="item"
        :groupIndex="index"
        :hostingScopeList="hostingScopeList"
      ></ph-condition-group>
    </template>
    <!-- 缺省图 -->
    <div
      class="ph-empty"
      v-if="
        draggableFormulaService.groupList.length === 0 &&
        draggableFormulaService.serviceDataIndexList.length === 0 &&
        !draggableFormulaService.loading
      "
    >
      <img src="../../../../../assets/images/project-manage/pm-formula-editor/pfe-empty.png" alt="empty" />
    </div>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { provide, computed } from 'vue';
import { useStore } from 'vuex';
// 组件
import PhConditionGroup from './ph-condition-group/ph-condition-group.vue';
import PhServiceData from './ph-service-data/ph-service-data.vue';
// 服务
import draggableFormulaService from '../../pm-formula-editor.service';
// 接口
import { PFE_IIndexVO } from '../../pm-formula-editor.api';
import { PDC_IDragAdded } from '../pfe-drag-container/pfe-drag-container.api';
import { Common_IValueLabel } from '@/service/api';
// 枚举
import { PFE_ESymbolType } from '../../enums';
// 工具方法
import { cloneDeep } from 'lodash';
// 常量
import { PFE_CHECK_TYPES } from '../../constant';

// store
const store = useStore();
/**
 * 拖拽指标
 */
provide('addIndex', (params: PDC_IDragAdded) => {
  if (params && params?.element && PFE_CHECK_TYPES.includes(params.element.indexType)) {
    // 重算map
    draggableFormulaService.addIndexInFormula(params?.element?.serialNumber, params?.element?.indexType);

    // 判断指标是否重复
    const repeatFlag = draggableFormulaService.serviceDataIndexList?.some((item) => {
      return item.indexType === params?.element?.indexType && item.indexName === params?.element?.indexName;
    });
    // 如果指标在维护数据中不存在，则添加到数据中
    if (!repeatFlag) {
      let cloneParams: PFE_IIndexVO = cloneDeep(params?.element);
      if (cloneParams.indexType === PFE_ESymbolType.定值) {
        cloneParams = {
          ...cloneParams,
        };
      } else if (cloneParams.indexType === PFE_ESymbolType.运算) {
        cloneParams = {
          ...cloneParams,
          formulaComponentList: [],
        };
      }
      // 添加到数组中
      draggableFormulaService.addServiceDataIndex(cloneParams);
    }
  }
  // 修改保存状态
  store.dispatch('setUnSaveFlag', true);
  console.log('%c✨✨公式拖拽✨✨', 'font-size: 24px', params);
});

// 托管期列表
const hostingScopeList = computed<Common_IValueLabel<number>[]>(() => {
  return store.getters.hostingPeriodList;
});
</script>
<style lang="less" scoped>
.pfe-home {
  width: 100%;
  height: 100%;
  padding: 0 var(--te-space-16) var(--te-space-8) 26px;
  background-color: var(--te-fill-color-blank);

  overflow-x: hidden;
  overflow-y: auto;

  .ph-empty {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}
</style>
