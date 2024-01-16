<template>
  <div class="pfe-tool-bar">
    <te-button type="primary" @click="handleGroupAdd"><icon-plus />新增条件组</te-button>
    <div class="ptb-operator">
      <!-- 各类型符号 -->
      <div class="ptb-operator-item" v-for="item in PFE_TYPE_SYMBOL_LIST" :key="item.type">
        <label>{{ item.typeName }}</label>
        <draggable
          v-model="item.symbolList"
          class="ptb-drag-container"
          item-key="serialNumber"
          :group="{ name: 'people', put: false, pull: 'clone' }"
          :sort="false"
          animation="300"
          @start="handleDragStart"
          @end="handleDragEnd"
          :move="($event: any)=>handleToolMove($event, item.type)"
        >
          <template #item="{ element }: { element: PFE_IIndexVO }">
            <span :class="PFE_DRAGGABLE_CLASS" :style="mapSymbolStyle(element.indexType)">
              {{ element.serialNumber }}
            </span>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { useStore } from 'vuex';
// 组件
import { IconPlus } from '@arco-iconbox/vue-te';
import draggable from 'vuedraggable';
// 服务
import draggableFormulaService from '../../pm-formula-editor.service';
// 常量
import { PFE_DRAGGABLE_CLASS, PFE_TYPE_SYMBOL_LIST } from '../../constant';
// api
import { mapTagStyle } from '../pfe-index-list/pfe-index-list.api';
import { PFE_IIndexVO } from '../../pm-formula-editor.api';
import { Common_IObject } from '@/service/api';
// 枚举
import { PFE_EContainerType, PFE_ESymbolType } from '../../enums';
// 工具方法
import { debounce } from 'lodash';

/**
 * 根据类型处理不同符号样式
 * @param {PFE_ESymbolType} type
 * @returns {{[key:string]:string}}
 */
const mapSymbolStyle = (type: PFE_ESymbolType): { [key: string]: string } => {
  let style = mapTagStyle(type);
  switch (type) {
    case PFE_ESymbolType.数字:
    case PFE_ESymbolType.运算符:
    case PFE_ESymbolType.判断符:
      style = {
        ...style,
        width: 'var(--te-space-32)',
        textAlign: 'center',
        paddingLeft: 0,
        paddingRight: 0,
      };
      break;
  }
  return style;
};

// store
const store = useStore();
/**
 * 拖拽开始
 * @returns {void}
 */
const handleDragStart = (): void => {
  store.dispatch('setDraggingFlag', true);
};
/**
 * 拖拽结束
 * @returns {void}
 */
const handleDragEnd = (): void => {
  store.dispatch('setDraggingFlag', false);
};
/**
 * 新增条件组
 * @returns {void}
 */
const handleGroupAdd = debounce(
  (): void => {
    draggableFormulaService.addGroup();
  },
  666,
  {
    leading: true,
  },
);
/**
 * 拖动符号，如果是判断符则只能拖到条件里面
 * @param {Common_IObject} e
 * @param {string} type
 * @returns {boolean}
 */
const handleToolMove = (e: Common_IObject, type: string): boolean => {
  const to = (e.to as HTMLElement)?.className;
  return !to?.includes(PFE_EContainerType.公式) || type !== PFE_ESymbolType.判断符;
};
</script>
<style lang="less" scoped>
.pfe-tool-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid var(--te-border-color-lighter);
  padding: var(--te-space-8) var(--te-space-16);
  height: var(--te-space-48);
  background-color: #f5f7fa;

  .te-button {
    svg {
      color: var(--te-color-white);
      margin-right: 6px;
    }
  }

  .ptb-operator {
    flex: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--te-space-16);

    .ptb-operator-item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: var(--te-space-8);

      .ptb-drag-container {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: var(--te-space-8);

        label {
          color: var(--te-text-color-primary);
          font-size: var(--te-font-size-b14);
        }

        span {
          display: inline-block;
          cursor: pointer;
          height: var(--te-space-32);
          line-height: var(--te-space-32);
          padding: 0 11px;
          border-radius: var(--te-space-4);
        }
      }
    }
  }
}
</style>
