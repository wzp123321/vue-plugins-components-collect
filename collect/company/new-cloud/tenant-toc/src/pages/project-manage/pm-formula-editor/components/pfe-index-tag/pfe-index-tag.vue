<template>
  <div class="pfe-index-tag" :style="mapTagStyle(props.indexType)">
    <!-- 普通标签 -->
    <span v-if="!mapIndexEditable()">{{ props.indexName }}</span>
    <!-- 可编辑-支持负数 -->
    <te-input
      v-else
      v-inputFilter:number="{
        decimal: mapInputDecimal(),
        negative: true,
      }"
      class="pit-input"
      type="text"
      :modelValue="numberSymbolValue"
      @input="handleInput"
    >
      <template #suffix>
        <span v-if="mapTagUnit()">{{ props.serialNumber }}</span>
      </template>
    </te-input>
    <!-- 图标 -->
    <icon-close-filled class="pit-delete" @click="handleDelete" />
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { ref, watch } from 'vue';
// 组件
import { IconCloseFilled } from '@arco-iconbox/vue-te';
// api
import { mapTagStyle } from '../pfe-index-list/pfe-index-list.api';
// 枚举
import { PFE_ESymbolType } from '../../enums';
// 工具方法
import { cloneDeep } from 'lodash';
// props
interface Props {
  indexType: PFE_ESymbolType;
  indexName: string;
  serialNumber: string;
  tagIndex: number;
}
const props = withDefaults(defineProps<Props>(), {
  indexType: PFE_ESymbolType.数字,
  indexName: '',
  serialNumber: '',
  tagIndex: 0,
});

// 输入框
const numberSymbolValue = ref<string>(cloneDeep(props.indexName));
/**
 * 小数位限制
 * @returns {number}
 */
const mapInputDecimal = (): number => {
  return props.serialNumber === '%' ? 2 : 4;
};
/**
 * 是否展示单位
 * @returns {boolean}
 */
const mapTagUnit = ():boolean => {
  return props.indexType === PFE_ESymbolType.数字 && props.serialNumber === '%';
};
/**
 * 是否可编辑
 * @returns {boolean}
 */
const mapIndexEditable = ():boolean => {
  return props.indexType === PFE_ESymbolType.数字;
};

// emit
const emits = defineEmits(['deleteItem', 'valueChange']);
/**
 * 删除
 * @returns {void}
 */
const handleDelete = () :void=> {
  emits('deleteItem', props.tagIndex, props.serialNumber, props.indexType);
};
/**
 * 输入事件
 * @param {string} value
 * @returns {void}
 */
const handleInput = (value: string):void => {
  emits('valueChange', value);
};
/**
 * 监听传入的指标名称
 */
watch(
  () => props.indexName,
  (newVal) => {
    numberSymbolValue.value = newVal;
  },
);
</script>
<style lang="less" scoped>
.pfe-index-tag {
  position: relative;
  cursor: pointer;
  min-height: 32px;
  max-height: 32px;
  padding: 4px 11px;
  border-radius: var(--te-space-4);
  box-sizing: border-box;

  :deep(.pit-input.te-input) {
    width: 72px;
    height: 22px;
    line-height: 22px;

    .te-input__wrapper {
      box-shadow: none;
      padding-left: 0;
      padding-right: 0;
    }

    &:focus {
      box-shadow: none;
    }
  }

  span {
    line-height: 22px;
    display: inline-block;
  }

  .pit-delete {
    width: 14px;
    height: 14px;

    cursor: pointer;
    position: absolute;
    top: -6px;
    right: -4px;

    display: none;
    color: var(--te-color-danger) !important;
  }

  &:hover {
    svg.pit-delete {
      display: inline-block;
      transition: none;
    }
  }
}
</style>
