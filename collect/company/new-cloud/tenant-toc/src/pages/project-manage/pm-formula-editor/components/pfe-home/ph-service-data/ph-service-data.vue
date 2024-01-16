<template>
  <div
    :class="['ph-service-data', PFE_SERVICE_DATA_CLASS_NAME]"
    v-show="draggableFormulaService.serviceDataIndexList?.length"
  >
    <!-- 头部 -->
    <section class="psd-header">
      <span class="psd-header-title">维护数据</span>
      <span class="psd-header-desc" v-if="mapOperationFlag()">
        (勾选后将在项目预算表及核算表中展示；可手动拖拽调整展示顺序)
      </span>
    </section>
    <!-- 需要配置公式的指标-可拖拽 -->
    <te-scrollbar ref="scrollbarRef" class="psd-body">
      <!-- 非天溯模式不可以拖拽，所以置为disabled，拖动插件有一个属性distance, 默认值是0, 把点击事件识别成了拖动事件了, 如果把它的值设置成>0的数, 自己的组件就可以响应点击事件了-->
      <draggable
        v-model="draggableFormulaService.serviceDataIndexList"
        class="psd-body-drag"
        :forceFallback="true"
        item-key="id"
        :group="{ name: 'service' }"
        :handle="'.psd-body-drag-item-hot-spot'"
        :sort="mapOperationFlag()"
        :disabled="!mapOperationFlag()"
        :distance="20"
        animation="300"
      >
        <template #item="{ element }: { element: PFE_IIndexVO }">
          <div class="psd-body-drag-item">
            <!-- 2023-11-16 可拖拽区域改为前面部分-->
            <div class="psd-body-drag-item-hot-spot">
              <icon-rank-left class="test" />
            </div>
            <div class="psd-body-drag-item-content">
              <!-- 单选框 -->
              <te-checkbox v-if="mapOperationFlag()" v-model="element.selectFlag" label="" />
              <!-- 指标名称 -->
              <span>{{ element.indexName }} = </span>
              <!-- 公式配置 -->
              <pfe-expression-container
                v-model="element.formulaComponentList"
                :key="randomNumber16()"
                v-if="mapFormulaConfigure(element.indexType)"
                :containerType="PFE_EContainerType.公式"
                :affiliation="mapServiceAffiliationClass(element.serialNumber)"
                @index-change="handleIndexChange"
                @index-delete="handleIndexChange"
              ></pfe-expression-container>
              <!-- 定值指标配置按钮 -->
              <div
                v-if="mapDataConfigure(element.indexType)"
                class="psd-body-drag-item-content-btn"
                @click="triggerDataConfigure(element.serialNumber, element.indexName)"
              >
                <icon-edit />
                <span> 编辑 </span>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </te-scrollbar>
    <!-- 配置数据弹框 -->
    <pm-income-config ref="incomeConfigRef"></pm-income-config>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { ref, inject, nextTick } from 'vue';
import { useStore } from 'vuex';
// 数据服务
import draggableFormulaService from '../../../pm-formula-editor.service';
// 组件
import draggable from 'vuedraggable';
import { IconRankLeft, IconEdit } from '@arco-iconbox/vue-te';
import pfeExpressionContainer from '../../pfe-drag-container/pfe-drag-container.vue';
import PmIncomeConfig from '../../../../pm-income-config/pm-income-config.vue';
// 接口
import { PFE_IIndexVO } from '../../../pm-formula-editor.api';
// 枚举
import { PM_EDialogType, PM_EGrainSharingObject } from '@/pages/project-manage/constant/enum';
import { PFE_ESymbolType, PFE_EContainerType } from '../../../enums';
// 工具
import { randomNumber16 } from '@/utils';
import { mapServiceAffiliationClass } from '../../../utils/index';
// 常量
import { PFE_SERVICE_DATA_CLASS_NAME } from '../../../constant';

// 滚动条
const scrollbarRef = ref();
// 保存请求
const handleSubmit = inject('handleSubmit') as () => Promise<boolean>;
/**
 * 是否可配置公式
 * @param {PFE_ESymbolType} indexType 指标类型
 * @returns {boolean}
 */
const mapFormulaConfigure = (indexType: PFE_ESymbolType): boolean => {
  return indexType === PFE_ESymbolType.运算;
};
/**
 * 是否可配置数值
 * @param {PFE_ESymbolType} indexType 指标类型
 * @returns {boolean}
 */
const mapDataConfigure = (indexType: PFE_ESymbolType): boolean => {
  return indexType === PFE_ESymbolType.定值;
};

// store
const store = useStore();
/**
 * 维护数据是否可以拖拽、可勾选
 * @returns {boolean}
 */
const mapOperationFlag = (): boolean => {
  return store.getters.grainSharingMode === PM_EGrainSharingObject.天溯;
};
/**
 * 公式change回调
 * @returns {void}
 */
const handleIndexChange = (): void => {
  if (scrollbarRef.value) {
    nextTick(() => {
      scrollbarRef.value?.update();
    });
  }
};

// 弹框组件
const incomeConfigRef = ref();
/**
 * 触发编辑数据
 * @param {string} serialNumber 指标唯一标识
 * @param {string} indexName 指标名称
 * @returns {void}
 */
const triggerDataConfigure = (serialNumber: string, indexName: string): void => {
  if (incomeConfigRef.value) {
    console.log('%c✨✨定值指标打开配置数据弹框✨✨', 'font-size: 24px', serialNumber);
    // const unSaveFlag = store.getters.unSaveFlag;
    // 判断是否有公式未完成保存
    // if (unSaveFlag) {
    //   TeMessageBox.confirm('请先保存再继续编辑指标数据', '保存内容', {
    //     confirmButtonText: '保存并继续',
    //     cancelButtonText: '取消',
    //     type: 'warning',
    //   })
    //     .then(async () => {
    //       const res = await handleSubmit();
    //       console.log('%c✨✨先保存公式响应结果✨✨', 'font-size: 24px', res);
    //       if (res) {
    //         incomeConfigRef.value?.openDialog(PM_EDialogType.定值指标, { serialNumber, indexName }, false);
    //       }
    //       store.dispatch('setUnSaveFlag', false);
    //     })
    //     .catch(() => {
    //       console.warn('取消保存内容');
    //     });
    // } else {
    incomeConfigRef.value?.openDialog(PM_EDialogType.定值指标, { serialNumber, indexName }, false);
    // }
  }
};
</script>
<style lang="less" scoped>
.ph-service-data {
  margin-top: var(--te-space-16);
  border: 1px solid var(--te-border-color-light);
  background-color: var(--te-fill-color-light);

  .psd-header {
    padding: 14px var(--te-space-16);

    .psd-header-title {
      color: var(--te-text-color-regular);
    }

    .psd-header-desc {
      color: var(--te-text-color-placeholder);
      margin-left: var(--te-space-8);
    }
  }

  .psd-body {
    .psd-body-drag {
      width: 100%;
    }

    .psd-body-drag .psd-body-drag-item {
      min-width: 100%;
      width: fit-content;
      display: flex;
      flex-direction: row;
      align-items: center;
      box-sizing: border-box;
      // padding: var(--te-space-12) var(--te-space-16);
      border-top: 1px solid var(--te-border-color-light);

      .psd-body-drag-item-hot-spot {
        padding: 15px var(--te-space-12) 15px var(--te-space-16);
        display: flex;
        align-items: center;
        cursor: all-scroll;

        svg {
          width: var(--te-space-16);
          height: var(--te-space-16);
        }
      }

      .psd-body-drag-item-content {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--te-space-12);
        padding: 11px var(--te-space-16) 11px 0;

        .te-checkbox {
          height: 22px;
        }

        span {
          color: var(--te-text-color-regular);
        }

        .psd-body-drag-item-content-btn {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          cursor: pointer;

          svg,
          span {
            color: var(--te-color-primary);
          }
        }
      }
    }
  }
}
</style>
