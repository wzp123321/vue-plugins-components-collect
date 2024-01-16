<template>
  <!-- 拖拽公式容器 -->
  <draggable
    v-model="compExpressionList"
    :class="[
      'pdf-drag-container',
      mouseEnterFlag ? 'is-dragging' : '',
      identify,
      props.containerType,
      props.affiliation,
    ]"
    :style="{ minWidth: `${props.minWidth}px` }"
    item-key="serialNumber"
    :group="{ name: 'people' }"
    :sort="true"
    animation="300"
    @add="addFormula"
    @dragover.native="handleDragEnter"
    @dragleave.native="handleDrop"
    @drop.native="handleDrop"
    :move="mapMoveable"
    @change="handleChange"
  >
    <!-- 指标 -->
    <template #item="{ element, index }: { element: PFE_IIndexVO, index: number }">
      <pid-index-tag
        :indexName="element.indexName"
        :index-type="element.indexType"
        :tagIndex="index"
        :id="element.id"
        :serialNumber="element.serialNumber"
        @valueChange="handleTagValueChange($event, element)"
        @deleteItem="handleItemDelete"
      ></pid-index-tag>
    </template>
    <template #footer>
      <!-- 缺省提示 -->
      <p v-show="(!draggingFlag || !mouseEnterFlag) && compExpressionList?.length === 0" class="pdc-placeholder">
        请拖拽标签到此处
      </p>
    </template>
  </draggable>
</template>
<script lang="ts" setup>
// 公共库
import { ref, PropType, inject } from 'vue';
import { cloneDeep } from 'lodash';
import { mapGetters } from 'vuex';
// 组件
import draggable from 'vuedraggable';
import PidIndexTag from '../pfe-index-tag/pfe-index-tag.vue';
// api
import { PFE_IIndexVO } from '../../pm-formula-editor.api';
import { PDC_IDragAdded, PDC_IDragChangeParams } from './pfe-drag-container.api';
import { Common_IObject } from '@/service/api';
// 服务
import draggableFormulaService from '../../pm-formula-editor.service';
// 枚举
import { PFE_ESymbolType } from '../../enums';
// emit
const emits = defineEmits(['update:modelValue', 'index-change', 'index-delete']);

// props
const props = defineProps({
  // 宽度
  minWidth: {
    type: Number,
    default: 200,
  },
  // 双向绑定数据
  modelValue: {
    type: Array as PropType<PFE_IIndexVO[]>,
    default: [],
  },
  // type
  containerType: {
    type: String,
    default: 'formula',
  },
  // 标识当前公式归属于某一个指标，用于指标拖拽到维护数据中，判断是否可以拖入
  affiliation: {
    type: String,
    default: '',
  },
});
// 每个拖拽容器的唯一标识
const identify = `custom-container-${(Math.random() * 10000000000).toFixed(0)}-${(Math.random() * 10000000000).toFixed(
  0,
)}-${(Math.random() * 10000000000).toFixed(0)}`;

/**
 * 拖拽状态
 */
const { draggingFlag } = mapGetters(['draggingFlag']);

// 公式列表
const compExpressionList = ref<PFE_IIndexVO[]>(props.modelValue ?? []);
/**
 * 新增
 * @returns {void}
 */
const addFormula = (params: any): void => {
  compExpressionList.value = compExpressionList.value.map((item, index): PFE_IIndexVO => {
    const res = cloneDeep(item);
    res.id = res.id ? res.id : `front${index}`;
    return res;
  });
  console.log('%c✨✨新增✨✨', 'font-size: 24px', params);
  emits('update:modelValue', compExpressionList.value);

  emits('index-change');
};

// inject-公式中添加指标后的回调
const addIndex = inject('addIndex') as (params: PDC_IDragAdded) => void;
/**
 * 公式发生变更-判断是否需要添加到维护数据里面
 * @param {PDC_IDragChangeParams} params
 * @returns {void}
 */
const handleChange = (params: PDC_IDragChangeParams): void => {
  if (params?.added && addIndex) {
    addIndex(params?.added);
  }
  console.log('%c✨✨公式发生变更✨✨', 'font-size: 24px', params, addIndex);
  emits('update:modelValue', compExpressionList.value);
};

// 鼠标移入
const mouseEnterFlag = ref<boolean>(false);
/**
 * 拖拽移入
 * @param {Event} e
 * @returns {void}
 */
const handleDragEnter = (e: Event): void => {
  e.stopPropagation();
  e.preventDefault();
  mouseEnterFlag.value = true;
};
/**
 * 拖拽释放
 * @param {Event} e
 * @returns {void}
 */
const handleDrop = (e: Event): void => {
  e.stopPropagation();
  e.preventDefault();
  mouseEnterFlag.value = false;
};
/**
 * 元素移动,只有内部才能拖动
 * @param {Common_IObject} e
 * @returns {boolean}
 */
const mapMoveable = (e: Common_IObject): boolean => {
  const to = (e.to as HTMLElement)?.className;
  const from = (e.from as HTMLElement)?.className;
  return to === from;
};
/**
 * 修改tag数据
 * @param {string} value
 * @param {PFE_IIndexVO} element
 * @returns {void}
 */
const handleTagValueChange = (value: string, element: PFE_IIndexVO): void => {
  element.indexName = value;
};
/**
 * 删除公式中的指标
 * @param {number} tagIndex
 * @param {string} serialNumber
 * @param {PFE_ESymbolType} indexType
 * @returns {void}
 */
const handleItemDelete = (tagIndex: number, serialNumber: string, indexType: PFE_ESymbolType): void => {
  // 公式数组中移除
  compExpressionList.value = compExpressionList.value?.filter((item, index) => index !== tagIndex);
  // 更新数据
  emits('update:modelValue', compExpressionList.value);
  // 删除指标后,需要处理维护数据
  draggableFormulaService.removeIndexInFormula(serialNumber, indexType);
  // 触发父组件事件
  emits('index-delete', serialNumber, indexType);
};
</script>
<style lang="less" scoped>
.pdf-drag-container {
  position: relative;
  width: fit-content;
  display: flex;
  flex-wrap: nowrap;
  cursor: pointer;

  max-height: var(--te-space-48);
  min-height: var(--te-space-48);
  gap: var(--te-space-8);

  padding: 7px var(--te-space-12);
  border: 1px dashed var(--te-border-color-light);

  &.is-dragging {
    border-color: var(--te-color-primary);
  }

  // :deep(.sortable-chosen) {
  //   visibility: hidden;
  // }

  p.pdc-placeholder {
    width: 100%;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--te-text-color-placeholder);
  }
}
</style>
