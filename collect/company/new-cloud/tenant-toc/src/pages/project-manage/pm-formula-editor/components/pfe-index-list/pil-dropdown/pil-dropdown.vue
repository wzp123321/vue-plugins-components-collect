<template>
  <ul class="pfe-dropdown" ref="popoverRef" v-show="visible" :style="position">
    <li @click="triggerEdit">
      <icon-edit-pen />
      <span>重命名</span>
    </li>
    <li @click="triggerDelete">
      <icon-delete />
      <span>删除</span>
    </li>
  </ul>
</template>
<script lang="ts" setup>
// 公共库
import { ref, reactive } from 'vue';
// 组件
import { TeMessageBox } from '@tiansu/element-plus';
import { IconEditPen, IconDelete } from '@arco-iconbox/vue-te';
// 工具方法
import { onClickOutside } from '@vueuse/core';
// api
import { PIL_IPopoverPosition } from '../pfe-index-list.api';
// emits
const emits = defineEmits(['confirmEdit', 'confirmDelete']);

// 开关
const visible = ref<boolean>(false);
// popover
const popoverRef = ref();
// 注册点击元素外事件
onClickOutside(popoverRef, () => {
  visible.value = false;
});

// 位置
const position = reactive<PIL_IPopoverPosition>({
  top: '',
  left: '',
});
/**
 * 打开弹出层
 * @param {PointerEvent} e
 * @returns {void}
 */
const show = (e: PointerEvent): void => {
  const { top, left } = mapPosition(e);
  position.top = top;
  position.left = left;

  visible.value = true;
};
/**
 * 返回弹出层位置
 * @param {PointerEvent} e
 * @returns {PIL_IPopoverPosition}
 */
const mapPosition = (e: PointerEvent): PIL_IPopoverPosition => {
  const width = 72;
  const left = `${e.clientX - e.offsetX - width / 2}px`;
  const top = `${e.clientY - e.offsetY + 25}px`;

  return {
    top,
    left,
  };
};
/**
 * 触发编辑
 * @returns {void}
 */
const triggerEdit = (): void => {
  visible.value = false;
  emits('confirmEdit', true);
};
/**
 * 触发删除
 * @returns {void}
 */
const triggerDelete = (): void => {
  TeMessageBox.confirm('确认删除该条指标吗？', '删除', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emits('confirmDelete');
      visible.value = false;
    })
    .catch(() => {
      console.warn('取消保存确认');
    });
  // const res = 删除接口
};

// 对外暴露
defineExpose({
  show,
});
</script>
<style lang="less" scoped>
.pfe-dropdown {
  position: absolute;
  padding: var(--te-space-4) 0;
  background-color: var(--te-fill-color-blank);
  border-radius: var(--te-space-4);
  box-shadow: var(--te-box-shadow);
  margin-bottom: 0;

  &::before {
    content: '';
    width: var(--te-space-12);
    height: var(--te-space-12);
    background-color: var(--te-fill-color-blank);
    position: absolute;
    top: -1px;
    left: 50%;
    transform: rotate(45deg) translateX(-50%);
  }

  li {
    display: flex;
    align-items: center;
    padding: 5px var(--te-space-12);
    font-size: var(--te-font-size-b14);
    gap: var(--te-space-4);
    cursor: pointer;

    span,
    svg {
      color: var(--te-text-color-primary);
    }
  }
}
</style>
