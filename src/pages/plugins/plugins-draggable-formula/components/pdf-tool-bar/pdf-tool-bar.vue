<template>
  <div class="pdf-tool-bar">
    <div class="ptb-add">+ 新增条件组</div>
    <div class="ptb-operator">
      <label>时间</label>
      <draggable
        v-model="timeList"
        class="ptb-drag-container"
        item-key="serialNumber"
        :group="{ name: 'people', put: false, pull: 'clone' }"
        :sort="false"
        animation="300"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <span :class="PDF_DRAGGABLE_CLASS">{{ element.name }}</span>
        </template>
      </draggable>

      <label>数字</label>
      <draggable
        v-model="numberList"
        class="ptb-drag-container"
        item-key="serialNumber"
        :group="{ name: 'people', put: false, pull: 'clone' }"
        :sort="false"
        animation="300"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <span :class="PDF_DRAGGABLE_CLASS">{{ element.name }}</span>
        </template>
      </draggable>

      <label>运算符</label>
      <draggable
        v-model="operatorList"
        class="ptb-drag-container"
        item-key="serialNumber"
        :group="{ name: 'people', put: false, pull: 'clone' }"
        :sort="false"
        animation="300"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <span :class="PDF_DRAGGABLE_CLASS">{{ element.name }}</span>
        </template>
      </draggable>

      <label>判断符</label>
      <draggable
        v-model="deciderList"
        class="ptb-drag-container"
        item-key="serialNumber"
        :group="{ name: 'people', put: false, pull: 'clone' }"
        :sort="false"
        animation="300"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <template #item="{ element }">
          <span :class="PDF_DRAGGABLE_CLASS">{{ element.name }}</span>
        </template>
      </draggable>
    </div>
    <button primary>保存</button>
  </div>
</template>
<script lang="ts" setup>
import draggable from 'vuedraggable';
import dragStore from '../../../../../store/modules/drag';

import { timeList, operatorList, deciderList, numberList } from './pdf-tool-bar.api';
import { PDF_DRAGGABLE_CLASS } from '../../plugins-draggable-formula.api';

const store = dragStore();

/**
 * 拖拽开始
 */
const handleDragStart = (event: Event) => {
  store.setDragFlag(true);
};
/**
 * 拖拽结束
 */
const handleDragEnd = () => {
  store.setDragFlag(false);
};
</script>
<style lang="less" scoped>
.pdf-tool-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(220, 223, 230, 1);
  border-left: none;
  padding: 8px 16px;
  background-color: #f5f7fa;

  .ptb-add {
    padding: 4px 15px;
    color: rgba(0, 0, 0, 0.65);
    border-radius: 4px;
    border: 1px solid rgba(220, 223, 230, 1);
    box-sizing: border-box;
    background: rgba(255, 255, 255, 1);
  }

  .ptb-drag-container,
  .ptb-operator {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ptb-drag-container {
    span {
      cursor: pointer;
      padding: 5px 12px;
      border-radius: 4px;
      border: 1px solid rgba(220, 223, 230, 1);
      background-color: #fff;

      font-size: 14px;
    }
  }
}
</style>
