/** * Dialog 对话框组件 * @description 弹出对话框，常用于消息提示、消息确认等场景 */
<template>
  <tsm-popup
    mode="center"
    :zoom="zoom"
    :show="show"
    :class="[customClass]"
    :customStyle="{
      borderRadius: '6px',
      overflow: 'hidden',
    }"
    :closeOnClickOverlay="closeOnClickOverlay"
    :safeAreaInsetBottom="false"
    :duration="duration"
    @click="clickHandler"
  >
    <view class="tsm-dialog" :class="bemClass" :style="{ width: addUnit(String(width)) }">
      <view class="tsm-dialog__title" v-if="title">{{ title }}</view>
      <view class="tsm-dialog__content" :style="{ paddingTop: title ? '12px' : '25px' }">
        <slot>
          <text class="tsm-dialog__content__text" :style="{ textAlign: contentTextAlign }">
            {{ content }}
          </text>
        </slot>
      </view>
      <tsm-line v-if="showConfirmButton || showCancelButton"></tsm-line>
      <view
        class="tsm-dialog__button-group"
        :class="{ 'tsm-dialog__button-group--reverse': buttonReverse }"
        v-if="showConfirmButton || showCancelButton"
      >
        <view
          class="tsm-dialog__button tsm-dialog__button--cancel"
          :class="{ 'tsm-dialog__button--only': !showConfirmButton }"
          hover-class="tsm-dialog__button--hover"
          hover-stay-time="150"
          v-if="showCancelButton"
          @tap="cancelHandler"
        >
          <text class="tsm-dialog__button__text" :style="{ color: cancelColor }">{{ cancelText }}</text>
        </view>
        <tsm-line direction="column" v-if="showConfirmButton && showCancelButton"></tsm-line>
        <view
          class="tsm-dialog__button tsm-dialog__button--confirm"
          :class="{ 'tsm-dialog__button--only': !showCancelButton }"
          hover-class="tsm-dialog__button--hover"
          hover-stay-time="150"
          v-if="showConfirmButton"
          @tap="confirmHandler"
        >
          <tsm-loading-icon v-if="loading" />
          <text v-else class="tsm-dialog__button__text" :style="{ color: confirmColor }">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </tsm-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { DialogProps } from './props';
import { defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';

/**
 * Dialog 组件 Props
 * @property {boolean} show - 是否显示对话框
 * @property {string} title - 标题内容
 * @property {string} content - 对话框内容
 * @property {string} confirmText - 确认按钮文字
 * @property {string} cancelText - 取消按钮文字
 * @property {boolean} showConfirmButton - 是否显示确认按钮
 * @property {boolean} showCancelButton - 是否显示取消按钮
 * @property {string} confirmColor - 确认按钮颜色
 * @property {string} cancelColor - 取消按钮颜色
 * @property {boolean} buttonReverse - 是否对调按钮位置
 * @property {boolean} zoom - 是否开启缩放模式
 * @property {boolean} asyncClose - 是否异步关闭
 * @property {boolean} closeOnClickOverlay - 是否允许点击遮罩关闭
 * @property {string|number} width - 对话框宽度
 * @property {number} duration - 弹窗动画时间
 * @property {string} contentTextAlign - 内容文字对齐方式
 * @property {string} customClass - 自定义类名
 * @property {object} customStyle - 自定义样式
 */
const props = withDefaults(defineProps<DialogProps>(), defaultProps);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
  'update:show': [value: boolean];
}>();

const loading = ref(false);

watch(
  () => props.show,
  newVal => {
    if (newVal && loading.value) {
      loading.value = false;
    }
  }
);

const bemClass = computed(() => {
  return bem('dialog', [], [], props.customClass);
});

const confirmHandler = () => {
  if (props.asyncClose) {
    loading.value = true;
  } else {
    emit('update:show', false);
  }
  emit('confirm');
};

const cancelHandler = () => {
  emit('update:show', false);
  emit('cancel');
};

const clickHandler = () => {
  if (props.closeOnClickOverlay) {
    emit('update:show', false);
    emit('close');
  }
};
</script>

<style scoped lang="scss">
.tsm-dialog {
  width: 650rpx;
  border-radius: 6px;
  overflow: hidden;
  background-color: #ffffff;
}

.tsm-dialog__title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #606266;
  text-align: center;
  padding-top: 25px;
}

.tsm-dialog__content {
  padding: 12px 25px 25px 25px;
  display: flex;
  justify-content: center;
}

.tsm-dialog__content__text {
  font-size: 15px;
  color: #606266;
  flex: 1;
}

.tsm-dialog__button-group {
  display: flex;

  &--reverse {
    flex-direction: row-reverse;
  }
}

.tsm-dialog__button {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
}

.tsm-dialog__button--confirm {
  border-bottom-right-radius: 6px;
}

.tsm-dialog__button--cancel {
  border-bottom-left-radius: 6px;
}

.tsm-dialog__button--only {
  border-radius: 0 0 6px 6px;
}

.tsm-dialog__button--hover {
  background-color: #f5f6f7;
}

.tsm-dialog__button__text {
  color: #606266;
  font-size: 16px;
  text-align: center;
}
</style>
