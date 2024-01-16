<template>
  <div class="pfv-service-data" v-show="props.serviceDataList?.length">
    <te-scrollbar>
      <div class="psd-item" v-for="element in props.serviceDataList">
        <span class="psd-item-index-name">{{ element.indexName }}</span>
        <em class="psd-item-equal" v-if="mapFormulaConfigure(element.indexType)">=</em>
        <!-- 公式 -->
        <pfv-formula-render
          v-if="mapFormulaConfigure(element.indexType)"
          :formulaList="element.formulaComponentList"
        ></pfv-formula-render>
        <div class="psd-item-btn" @click="triggerDataConfigure(element.serialNumber, element.indexName)" v-else>
          <icon-sheet-view v-if="mapDataConfigure(element.indexType)" />
          <span v-if="mapDataConfigure(element.indexType)"> 查看详情 </span>
        </div>
      </div>
    </te-scrollbar>
    <!-- 配置数据弹框 -->
    <pm-income-config ref="incomeConfigRef"></pm-income-config>
  </div>
</template>
<script lang="ts" setup>
import { ref, PropType } from 'vue';
// 组件
import { IconSheetView } from '@arco-iconbox/vue-te';
import PmIncomeConfig from '../../../../../pm-income-config/pm-income-config.vue';
import PfvFormulaRender from '../pfv-formula-render/pfv-formula-render.vue';
// api
import { PFE_ESymbolType } from '@/pages/project-manage/pm-formula-editor/enums';
import { PFE_IIndexVO } from '@/pages/project-manage/pm-formula-editor/pm-formula-editor.api';
import { PM_EDialogType } from '@/pages/project-manage/constant/enum';
// 弹框
const incomeConfigRef = ref();
// props
const props = defineProps({
  serviceDataList: {
    type: Array as PropType<PFE_IIndexVO[]>,
    default: [],
  },
});
/**
 * 是否可配置公式
 * @param indexType
 * @returns {boolean}
 */
const mapFormulaConfigure = (indexType: PFE_ESymbolType): boolean => {
  return indexType === PFE_ESymbolType.运算;
};
/**
 * 是否可配置数值
 * @param indexType
 * @returns {boolean}
 */
const mapDataConfigure = (indexType: PFE_ESymbolType): boolean => {
  return indexType === PFE_ESymbolType.定值;
};

/**
 * 打开数据配置弹框
 * @param {string} serialNumber
 * @param {string} indexName
 * @returns {void}
 */
const triggerDataConfigure = (serialNumber: string, indexName: string): void => {
  if (incomeConfigRef.value) {
    incomeConfigRef.value?.openDialog(PM_EDialogType.定值指标, { serialNumber, indexName }, true);
  }
};
</script>
<style lang="less" scoped>
.pfv-service-data {
  margin-top: var(--te-space-16);
  border: 1px solid var(--te-border-color-light);
  background-color: var(--te-fill-color-light);
  border-top: none;

  .psd-item {
    display: flex;
    flex-direction: row;
    align-items: center;

    box-sizing: border-box;
    padding: var(--te-space-12) var(--te-space-16);
    border-top: 1px solid var(--te-border-color-light);

    .psd-item-equal {
      margin: 0 var(--te-space-12);
    }

    span {
      color: var(--te-text-color-regular);
    }

    .psd-item-btn {
      margin-left: var(--te-space-12);
      display: flex;
      flex-direction: row;
      align-items: center;

      gap: var(--te-space-4);

      span,
      svg {
        cursor: pointer;
        color: var(--te-color-primary);
      }
    }
  }
}
</style>
