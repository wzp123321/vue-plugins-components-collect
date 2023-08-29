<template>
  <div class="pdf-tag" :style="style">
    <!-- 普通标签 -->
    <span v-if="!props.editable">{{ props.name }}</span>
    <!-- 可编辑 -->
    <input v-if="props.editable" class="pt-input" type="text" :value="value" @input="handleInput" />
    <!-- 图标 -->
    <i class="ems-iconfont icon-fork" title="删除" @click="handleDelete"></i>
  </div>
</template>
<script lang="ts" setup>
import { computed, toRef, watch } from 'vue';
import { PDF_EFieldType } from '../../plugins-draggable-formula.api';
import { mapTagStyle } from '../pdf-index-list/pdf-index-list.api';

interface Props {
  indexType: PDF_EFieldType;
  name: string;
  id: string;
  editable: boolean;
  value: string;
}
const props = withDefaults(defineProps<Props>(), {
  indexType: PDF_EFieldType.数字,
  name: '',
  id: '',
  editable: false,
  value: '',
});
const emits = defineEmits(['deleteItem', 'valueChange']);

// 输入框
const value = toRef<string>(props.value);

const style = computed(() => {
  return mapTagStyle(props.indexType);
});

/**
 * 删除
 */
const handleDelete = () => {
  emits('deleteItem', props.id);
};
/**
 * 输入事件
 * @param e
 */
const handleInput = (e: Event) => {
  emits('valueChange', (e.target as HTMLInputElement).value);
};

watch(
  () => props.value,
  (newVal) => {
    value.value = newVal;
  },
);
</script>
<style lang="less" scoped>
.pdf-tag {
  cursor: pointer;
  padding: 3px 12px;
  border-radius: 4px;
  box-sizing: border-box;

  .pt-input {
    width: 72px;
    height: 22px;
    line-height: 22px;
    border: none;

    &:focus {
      box-shadow: none;
    }
  }

  span {
    line-height: 22px;
    display: inline-block;
  }

  .ems-iconfont {
    cursor: pointer;
    font-size: 14px;
    margin-left: 8px;

    display: none;
  }

  &:hover {
    .ems-iconfont {
      display: inline-block;
      transition: none;
    }
  }
}
</style>
