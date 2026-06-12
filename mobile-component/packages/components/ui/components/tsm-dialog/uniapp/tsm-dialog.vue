/** * Dialog 对话框组件 * @description 弹出对话框，常用于消息提示、消息确认等场景 */
<template>
  <view v-if="innerVisible" class="tsm-dialog-wrapper" @touchmove.stop.prevent>
    <tsm-overlay :show="innerVisible" @click="overlayClick" />
    <tsm-transition mode="zoom" :show="innerVisible" :duration="durationValue">
      <view class="tsm-dialog" :class="bemClass" :style="dialogStyle" @click.stop>
        <!-- 插槽：header-content - 自定义头部内容（type="customize" 时使用） -->
        <slot v-if="typeValue === 'customize'" name="header-content"></slot>
        <template v-else>
          <img class="tsm-dialog-header-bg" :src="headerBgImage" alt="" />
          <view class="tsm-dialog-header">
            <view class="tsm-dialog-header-icon">
              <img :src="leftIcon" alt="icon" />
            </view>
            <view class="tsm-dialog-header-title">{{ titleValue }}</view>
          </view>
          <view class="tsm-dialog-content">
            <!-- 插槽：content - 自定义内容区域内容 -->
            <slot v-if="$slots.content" name="content"> </slot>
            <template v-else>
              <text class="tsm-dialog-content-text">{{ contentValue }}</text>
            </template>
          </view>
        </template>
        <view class="tsm-dialog-footer">
          <view class="tsm-dialog-footer-wrapper" v-if="!$slots.footer">
            <tsm-button type="outline" theme="default" v-if="showCancelButtonValue" @tap="handleCancel">
              {{ cancelTextValue }}
            </tsm-button>
            <tsm-button
              v-if="showConfirmButtonValue"
              :theme="typeValue === 'danger' ? 'danger' : 'primary'"
              @tap="handleConfirm"
              >{{ confirmTextValue }}</tsm-button
            >
          </view>
          <!-- 插槽：footer - 自定义底部按钮区域内容 -->
          <slot v-else name="footer"></slot>
        </view>
      </view>
    </tsm-transition>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { type DialogProps, defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

import picMessageSuccess from '../../../assets/image/message/pic-message-success.svg';
import picMessageWarning from '../../../assets/image/message/pic-message-warning.svg';
import picMessageDanger from '../../../assets/image/message/pic-message-danger.svg';
import picMessageInfo from '../../../assets/image/message/pic-message-info.svg';
import picDialogDefaultBg from '../../../assets/image/dialog/pic-dialog-default-bg.svg';
import picDialogSuccessBg from '../../../assets/image/dialog/pic-dialog-success-bg.svg';
import picDialogWarningBg from '../../../assets/image/dialog/pic-dialog-warning-bg.svg';
import picDialogDangerBg from '../../../assets/image/dialog/pic-dialog-danger-bg.svg';

const props = withDefaults(defineProps<DialogProps>(), defaultProps);

const emit = defineEmits<{
  /** 点击确认按钮时触发 */
  confirm: [];
  /** 点击取消按钮时触发 */
  cancel: [];
  /** 关闭弹窗时触发 */
  close: [];
  /** 更新显示状态 */
  'update:visible': [value: boolean];
}>();

const headerBgImage = computed(() => {
  switch (typeValue.value) {
    case 'default':
      return picDialogDefaultBg;
    case 'success':
      return picDialogSuccessBg;
    case 'warning':
      return picDialogWarningBg;
    case 'danger':
      return picDialogDangerBg;
    default:
      return picDialogDefaultBg;
  }
});

const leftIcon = computed(() => {
  switch (typeValue.value) {
    case 'default':
      return picMessageInfo;
    case 'success':
      return picMessageSuccess;
    case 'warning':
      return picMessageWarning;
    case 'danger':
      return picMessageDanger;
    default:
      return picMessageInfo;
  }
});

const dialogWidth = ref<string>('');

const typeValue = computed(() => props.type);
const titleValue = computed(() => props.title);
const contentValue = computed(() => props.content);
const confirmTextValue = computed(() => props.confirmText);
const cancelTextValue = computed(() => props.cancelText);
const showConfirmButtonValue = computed(() => props.showConfirmButton);
const showCancelButtonValue = computed(() => props.showCancelButton);
const durationValue = computed(() => props.duration);
const closeOnClickOverlayValue = computed(() => props.closeOnClickOverlay);

const bemClass = computed(() => bem('dialog', [typeValue.value], [], props.customClass));
const dialogStyle = computed(() => (dialogWidth.value ? { width: dialogWidth.value } : {}));

const innerVisible = ref(false);

const updateDialogWidth = () => {
  const getWindowInfo = (uni as any).getWindowInfo;
  const info = typeof getWindowInfo === 'function' ? getWindowInfo() : uni.getSystemInfoSync();
  const windowWidth = Number(info?.windowWidth ?? info?.screenWidth ?? 0);
  const width = Math.max(0, windowWidth - 64);
  dialogWidth.value = `${width}px`;
};

onMounted(() => {
  updateDialogWidth();
});

const overlayClick = () => {
  if (closeOnClickOverlayValue.value) {
    emit('update:visible', false);
    emit('close');
  }
};

const handleConfirm = () => {
  emit('update:visible', false);
  emit('confirm');
};

const handleCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};

watch(
  () => props.visible,
  (newVal: boolean) => {
    innerVisible.value = newVal;
    if (newVal) {
      updateDialogWidth();
    }
  }
);
</script>

<style scoped lang="scss">
.tsm-dialog-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10076;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tsm-dialog {
  position: relative;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-radius: var(--tsm-radius-2xl);
  background: var(--tsm-color-bg-white);
}

.tsm-dialog-header {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--tsm-spacing-m);
  padding: var(--tsm-spacing-3xl) var(--tsm-spacing-3xl) 0 var(--tsm-spacing-3xl);
  box-sizing: border-box;
  overflow: hidden;
}

.tsm-dialog-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 176px;
  object-fit: contain;
  object-position: top left;
  pointer-events: none;
  z-index: 0;
}

.tsm-dialog-header-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.tsm-dialog-header-icon img {
  width: 32px;
  height: 32px;
}

.tsm-dialog-header-title {
  overflow: hidden;
  color: var(--tsm-color-text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-xl);
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-xl);
  position: relative;
  z-index: 1;
}

.tsm-dialog-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--tsm-spacing-xl);
  padding: var(--tsm-spacing-3xl);
  align-self: stretch;
  box-sizing: border-box;
}

.tsm-dialog-content-text {
  overflow: hidden;
  color: var(--tsm-color-text-primary);
  text-overflow: ellipsis;
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  line-height: var(--tsm-line-height-text-l);
}

.tsm-dialog-footer {
  box-sizing: border-box;
  width: 100%;
}

.tsm-dialog-footer-wrapper {
  display: flex;
  align-items: center;
  gap: var(--tsm-spacing-xl);
  padding: 0 var(--tsm-spacing-3xl) var(--tsm-spacing-3xl);
}

.tsm-dialog-footer-wrapper :deep(.tsm-button) {
  flex: 1;
}
</style>
