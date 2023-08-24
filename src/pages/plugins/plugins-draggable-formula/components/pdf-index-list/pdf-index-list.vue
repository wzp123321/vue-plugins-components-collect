<template>
  <div class="pdf-index-list">
    <draggable
      v-model="indexList"
      class="pil-drag-container"
      item-key="serialNumber"
      :group="{ name: 'people', put: false, pull: 'clone' }"
      :sort="false"
      animation="300"
      @start="handleDragStart"
      @end="handleDragEnd"
    >
      <template #item="{ element }">
        <div class="pil-drag-container-item" :style="mapIndexStyle(element.indexType)">
          {{ element.name }}
        </div>
      </template>
    </draggable>
  </div>
</template>
<script lang="ts" setup>
import dragStore from '../../../../../store/modules/drag';

import draggable from 'vuedraggable';
import { PIL_EFieldStyleMap, mockList } from './pdf-index-list.api';
import { PDF_EFieldType, PDF_IFieldVO } from '../../plugins-draggable-formula.api';
import { ref } from 'vue';

const store = dragStore();

// 指标列表
const indexList = ref<PDF_IFieldVO[]>(mockList);
/**
 * 指标样式
 */
const mapIndexStyle = (type: PDF_EFieldType) => {
  return PIL_EFieldStyleMap.get(type);
};

/**
 * 拖拽开始
 */
const handleDragStart = (event: Event) => {
  console.log(event);

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
.pdf-index-list {
  height: 100%;
  background-color: #f5f7fa;
  padding: 16px;

  > .pil-drag-container {
    display: flex;
    flex-direction: column;
    gap: 8px;

    > .pil-drag-container-item {
      cursor: pointer;
      padding: 5px 12px;
      border-radius: 4px;
      width: fit-content;
    }
  }
}
</style>
