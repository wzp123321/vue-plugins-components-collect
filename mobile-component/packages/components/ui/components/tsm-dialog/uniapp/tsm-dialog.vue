/** * Dialog 对话框组件 * @description 弹出对话框，常用于消息提示、消息确认等场景 */
<template>
  <view v-if="visible" class="tsm-dialog-wrapper" @touchmove.stop.prevent>
    <tsm-overlay :show="visible" @click="overlayClick" />
    <tsm-transition mode="zoom" :show="visible" :duration="duration">
      <view class="tsm-dialog" :class="bemClass" @click.stop>
        <slot v-if="dialogType === 'customize'" name="header-content"></slot>
        <template v-else>
          <view class="tsm-dialog-header">
            <view class="tsm-dialog-header-icon">
              <slot v-if="$slots.icon" name="icon"> </slot>
              <template v-else>
                <icon-information-fill :size="32" v-if="dialogType === 'default'" color="var(--tsm-color-primary)" />
                <icon-circle-check-fill
                  :size="32"
                  v-else-if="dialogType === 'success'"
                  color="var(--tsm-color-success)"
                />
                <icon-warning-fill
                  :size="32"
                  v-else-if="dialogType === 'danger' || dialogType === 'warning'"
                  color="var(--tsm-color-danger)"
                />
              </template>
            </view>
            <view class="tsm-dialog-header-title">{{ dialogTitle }}</view>
          </view>
          <view class="tsm-dialog-content">
            <slot v-if="$slots.content" name="content"> </slot>
            <template v-else>
              <text class="tsm-dialog-content-text">{{ dialogContent }}</text>
            </template>
          </view>
        </template>
        <view class="tsm-dialog-footer">
          <view class="tsm-dialog-footer-wrapper" v-if="!$slots.footer">
            <tsm-button v-if="dialogShowCancelButton" @tap="handleCancel">{{ dialogCancelText }}</tsm-button>
            <tsm-button v-if="dialogShowConfirmButton" type="primary" @tap="handleConfirm">{{
              dialogConfirmText
            }}</tsm-button>
          </view>
          <slot v-else name="footer"></slot>
        </view>
      </view>
    </tsm-transition>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DialogProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<DialogProps>(), defaultProps);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
  'update:visible': [value: boolean];
}>();

const runtimeOptions = ref<Partial<DialogProps>>({});

const mergeProp = <K extends keyof DialogProps>(key: K) => computed(() => runtimeOptions.value[key] ?? props[key]);

// 组件采用受控模式：显示状态完全由 props.visible 决定
const visible = computed(() => props.visible);
const dialogType = mergeProp('type');
const dialogTitle = mergeProp('title');
const dialogContent = mergeProp('content');
const dialogConfirmText = mergeProp('confirmText');
const dialogCancelText = mergeProp('cancelText');
const dialogShowConfirmButton = mergeProp('showConfirmButton');
const dialogShowCancelButton = mergeProp('showCancelButton');
const duration = mergeProp('duration');

const bemClass = computed(() => bem('dialog', [dialogType.value], [], props.customClass));

// 通过 v-model:visible 驱动开关
const setVisible = (val: boolean) => {
  emit('update:visible', val);
};

const overlayClick = () => {
  if (props.closeOnClickOverlay) {
    hide();
    emit('close');
  }
};

const hide = () => {
  runtimeOptions.value = {};
  setVisible(false);
};

const handleConfirm = () => {
  hide();
  emit('confirm');
};

const handleCancel = () => {
  hide();
  emit('cancel');
};

const show = (options?: Partial<DialogProps>) => {
  if (options) {
    runtimeOptions.value = { ...options };
  }
  setVisible(true);
};

defineExpose({ show });
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
  width: 326.8px;
  min-height: 176px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border-radius: var(--tsm-radius-2xl);
  background: var(--tsm-color-bg-white);

  .tsm-dialog-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--tsm-spacing-m);
    padding: var(--tsm-spacing-3xl) var(--tsm-spacing-3xl) 0 var(--tsm-spacing-3xl);
    box-sizing: border-box;

    .tsm-dialog-header-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
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
    }
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

    .tsm-dialog-content-text {
      overflow: hidden;
      color: var(--tsm-color-text-primary);
      text-overflow: ellipsis;
      font-family: var(--tsm-font-family-regular);
      font-size: var(--tsm-font-size-text-l);
      line-height: var(--tsm-line-height-text-l);
    }
  }

  .tsm-dialog-footer {
    box-sizing: border-box;
    width: 100%;

    .tsm-dialog-footer-wrapper {
      display: flex;
      align-items: center;
      gap: var(--tsm-spacing-xl);
      padding: 0 var(--tsm-spacing-3xl) var(--tsm-spacing-3xl);

      :deep(.tsm-button) {
        flex: 1;
      }
    }
  }
}
</style>
