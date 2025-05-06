<template>
  <draggable
    v-model="compExpressionList"
    :class="['pdf-drag-container', mouseEnterFlag && dragFlag ? 'is-dragging' : '', identify]"
    :style="{ minWidth: `${props.minWidth}px` }"
    item-key="serialNumber"
    :group="{ name: 'people' }"
    :sort="true"
    animation="300"
    @add="addFormula"
    @dragenter="handleDragEnter"
    @dragleave="handleDrop"
    @drop="handleDrop"
    :move="mapMove"
    @change="handleChange"
  >
    <template #item="{ element }">
      <PdfTag
        :name="element.name"
        :index-type="element.indexType"
        :id="element.id"
        :editable="element.editable"
        :value="element.value"
        @valueChange="handleTagValueChange($event, element)"
        @deleteItem="handleItemDelete"
      ></PdfTag>
    </template>
    <template #footer>
      <p
        v-show="(!dragFlag || (!mouseEnterFlag && dragFlag)) && compExpressionList?.length === 0"
        class="pec-placeholder"
      >
        请拖拽标签到此处
      </p>
    </template>
  </draggable>
</template>
<script lang="ts" setup>
import { computed, ref, PropType } from 'vue';
import { cloneDeep } from 'lodash';
import { storeToRefs } from 'pinia';
import draggable from 'vuedraggable';
import dragStore from '../../../../../store/modules/drag';
import { GPS_IIndexVO } from '../../plugins-draggable-formula.api';

import PdfTag from '../pdf-tag/pdf-tag.vue';

const emits = defineEmits(['update:modelValue']);
const props = defineProps({
  minWidth: {
    type: Number,
    default: 180,
  },
  modelValue: {
    type: Array as PropType<GPS_IIndexVO[]>,
    default: [],
  },
});

const identify = `${(Math.random() * 10000000000).toFixed(0)}-${(Math.random() * 10000000000).toFixed(0)}-${(
  Math.random() * 10000000000
).toFixed(0)}`;

// store
const store = storeToRefs(dragStore());
// 公式列表
const compExpressionList = ref<GPS_IIndexVO[]>(props.modelValue ?? []);
// 鼠标移入
const mouseEnterFlag = ref<boolean>(false);

const dragFlag = computed(() => {
  return store.dragFlag.value;
});
/**
 * 新增
 */
const addFormula = (_a: any, _b: any) => {
  compExpressionList.value = compExpressionList.value.map((item, index): GPS_IIndexVO => {
    let res = cloneDeep(item);
    res.id = `front${index}`;
    return res;
  });

  emits('update:modelValue', compExpressionList.value);
};
const handleChange = (a: any, b: any) => {
  console.log('-handleChange----------------', a, b);
};
/**
 * 拖拽移入
 */
const handleDragEnter = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  mouseEnterFlag.value = true;
};
/**
 * 拖拽释放
 */
const handleDrop = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
  mouseEnterFlag.value = false;
};
/**
 * 元素移动
 * 只有内部才能拖动
 */
const mapMove = (e: any) => {
  const to = e.to?.className;
  const from = e.from?.className;
  // console.log(e, '----------------', to, '------------', from);
  return to === from;
};
/**
 * 修改tag数据
 * @param value
 * @param element
 */
const handleTagValueChange = (value: string, element: GPS_IIndexVO) => {
  element.value = value;
};
/**
 * 删除
 * @param id
 */
const handleItemDelete = (id: string) => {
  compExpressionList.value = compExpressionList.value?.filter((item) => item.id !== id);
};
</script>
<style lang="less" scoped>
.pdf-drag-container {
  position: relative;
  width: fit-content;
  display: flex;
  flex-wrap: no-wrap;
  cursor: pointer;

  min-height: 48px;
  gap: 8px;

  padding: 8px 12px;
  border: 1px dashed rgba(228, 231, 237, 1);

  &.is-dragging {
    border-color: rgba(24, 144, 255, 1);
  }

  // :deep(.sortable-chosen) {
  //   visibility: hidden;
  // }

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
