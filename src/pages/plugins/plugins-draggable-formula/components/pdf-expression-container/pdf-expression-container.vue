<template>
  <draggable
    v-model="expressionList"
    :class="['pdf-expression-container', mouseEnterFlag && dragFlag ? 'is-dragging' : '', identify]"
    :style="{ minWidth: `${props.minWidth}px` }"
    item-key="serialNumber"
    :group="{ name: 'people' }"
    :sort="true"
    animation="300"
    @add="addFormula"
    @dragenter.native="handleDragEnter"
    @drop.native="handleDrop"
    :move="handleMove"
  >
    <template #item="{ element }">
      <PdfTag
        :name="element.name"
        :index-type="element.indexType"
        :id="element.id"
        @deleteItem="handleItemDelete"
      ></PdfTag>
    </template>
    <template #footer>
      <p v-show="(!dragFlag || (!mouseEnterFlag && dragFlag)) && expressionList?.length === 0" class="pec-placeholder">
        请拖拽标签到此处
      </p>
    </template>
  </draggable>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import draggable from 'vuedraggable';
import dragStore from '../../../../../store/modules/drag';
import { PDF_IFieldVO } from '../../plugins-draggable-formula.api';

import PdfTag from '../pdf-tag/pdf-tag.vue';

const props = defineProps({
  minWidth: {
    type: Number,
    default: 180,
  },
});

const identify = `${(Math.random() * 10000000000).toFixed(0)}-${(Math.random() * 10000000000).toFixed(0)}-${(
  Math.random() * 10000000000
).toFixed(0)}`;

// store
const store = storeToRefs(dragStore());
// 公式列表
const expressionList = ref<PDF_IFieldVO[]>([]);
// 鼠标移入
const mouseEnterFlag = ref<boolean>(false);

const dragFlag = computed(() => {
  return store.dragFlag.value;
});
/**
 * 新增
 */
const addFormula = () => {
  expressionList.value = expressionList.value.map(
    (item, index): PDF_IFieldVO => {
      let res = cloneDeep(item);
      res.id = `front${index}`;
      return res;
    },
  );
};
/**
 * 拖拽移入
 */
const handleDragEnter = () => {
  mouseEnterFlag.value = true;
};
/**
 * 拖拽释放
 */
const handleDrop = () => {
  mouseEnterFlag.value = false;
};
/**
 * 元素移动
 * 只有内部才能拖动
 */
const handleMove = (e: any) => {
  const to = e.to?.className;
  const from = e.from?.className;
  console.log(e, '----------------', to, '------------', from);
  return to === from;
};
/**
 * 删除
 * @param id
 */
const handleItemDelete = (id: string) => {
  expressionList.value = expressionList.value?.filter((item) => item.id !== id);
};
</script>
<style lang="less" scoped>
.pdf-expression-container {
  position: relative;
  width: fit-content;
  display: flex;
  flex-wrap: wrap;
  cursor: pointer;

  min-height: 48px;
  gap: 8px;

  padding: 8px 12px;
  border: 1px dashed rgba(228, 231, 237, 1);

  &.is-dragging {
    border-color: rgba(24, 144, 255, 1);
  }

  p.pec-placeholder {
    width: 100%;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(168, 171, 178);
  }
}
</style>
