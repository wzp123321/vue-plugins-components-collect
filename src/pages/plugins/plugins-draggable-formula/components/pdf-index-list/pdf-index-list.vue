<template>
  <div class="pdf-index-list">
    <h5>指标字段</h5>

    <a-radio-group v-model:value="indexType">
      <a-radio-button v-for="item in indexTypeList" :value="item.value">{{ item.label }}</a-radio-button>
    </a-radio-group>

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
        <div :class="['pil-drag-container-item', PDF_DRAGGABLE_CLASS]" :style="mapTagStyle(element.indexType)">
          {{ element.name }}
        </div>
      </template>
    </draggable>
  </div>
</template>
<script lang="ts" setup>
import dragStore from '../../../../../store/modules/drag';
import { RadioButton, RadioGroup } from 'ant-design-vue';

import draggable from 'vuedraggable';
import { mapTagStyle, mockList, indexTypeList } from './pdf-index-list.api';
import { PGS_ESymbolType, GPS_IIndexVO, PDF_DRAGGABLE_CLASS } from '../../plugins-draggable-formula.api';
import { ref } from 'vue';

const store = dragStore();

// 指标列表
const indexList = ref<GPS_IIndexVO[]>(mockList);
// 指标类型
const indexType = ref<PGS_ESymbolType>(PGS_ESymbolType.基础);

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
  border: 1px solid rgba(220, 223, 230, 1);
  border-top: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  h5 {
    color: rgba(48, 49, 51, 1);
    font-family: PingFang SC;
    font-weight: 600;
    font-size: 14px;
    line-height: 22px;
  }

  h5,
  .ant-radio-group {
    margin-bottom: 16px;
  }

  > .pil-drag-container {
    flex: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;

    > .pil-drag-container-item {
      cursor: pointer;
      padding: 5px 12px;
      border-radius: 4px;
      width: fit-content;
    }
  }
}
</style>
