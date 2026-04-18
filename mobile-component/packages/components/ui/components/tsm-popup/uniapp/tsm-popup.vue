/** * Popup 弹窗组件 * @description 弹出层容器，用于展示弹窗、信息提示等内容，支持上、下、左、右和中部弹出 */
<template>
  <view class="tsm-popup" :class="[customClass]">
    <tsm-overlay :show="show" @click="overlayClick" v-if="overlay" :zIndex="zIndex" :opacity="0.5"></tsm-overlay>
    <tsm-transition :show="show" :customStyle="transitionStyle" :mode="position">
      <view class="tsm-popup-content" :style="[contentStyle]">
        <!-- 弹窗内容头, 仅在从底部弹出时生效 -->
        <view class="tsm-popup-content-header" v-if="mode === 'bottom' && (title || $slots['header'])">
          <view class="tsm-pch-indicator">
            <view class="tsm-pch-indicator-rect"></view>
          </view>
          <view class="tsm-pch-tc">
            <view class="tsm-pch-title">
              <!-- 弹窗标题槽位 -->
              <slot name="header">
                <view>{{ title }}</view>
              </slot>
            </view>
            <icon-close class="tsm-pch-close" v-if="closeable" @click="close" />
          </view>
        </view>
        <!-- 弹窗内容体 -->
        <scroll-view class="tsm-popup-content-body" :scroll-y="true" :scroll-x="true">
          <!-- 弹窗内容槽位 -->
          <slot></slot>
        </scroll-view>
        <!-- 弹窗内容脚 -->
        <view class="tsm-popup-content-footer" v-if="(mode === 'bottom' || mode === 'top') && $slots['footer']">
          <!-- 弹窗操作槽位 -->
          <slot name="footer"></slot>
        </view>
      </view>
    </tsm-transition>
  </view>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { PopupProps } from './props';
import { defaultProps } from './props';
import { addUnit, addStyle, deepMerge } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<PopupProps>(), defaultProps);

const emit = defineEmits<{
  open: [];
  close: [];
  'update:show': [value: boolean];
}>();

const transitionStyle = computed(() => {
  const style: Record<string, any> = {
    zIndex: props.zIndex,
    position: 'fixed',
    display: 'flex',
  };
  style[props.mode] = 0;
  if (props.mode === 'left' || props.mode === 'right') {
    return deepMerge(style, { bottom: 0, top: 0, 'max-width': 'calc(100% - 44px)' });
  }
  if (props.mode === 'top' || props.mode === 'bottom') {
    return deepMerge(style, { left: 0, right: 0, 'max-height': 'calc(100% - 44px)' });
  }
  return style;
});

const contentStyle = computed(() => {
  const style: Record<string, any> = {};
  if (props.round) {
    const value = addUnit(props.round);
    if (props.mode === 'top') {
      style.borderBottomLeftRadius = value;
      style.borderBottomRightRadius = value;
    } else if (props.mode === 'bottom') {
      style.borderTopLeftRadius = value;
      style.borderTopRightRadius = value;
    }
  }
  return addStyle({ ...style, ...props.customStyle });
});

const position = computed(() => {
  if (props.mode === 'left') return 'slide-left';
  if (props.mode === 'right') return 'slide-right';
  if (props.mode === 'bottom') return 'slide-up';
  if (props.mode === 'top') return 'slide-down';
  return props.mode;
});

const overlayClick = () => {
  if (props.closeOnClickOverlay) {
    emit('update:show', false);
  }
};

const close = () => {
  emit('update:show', false);
};

watch(
  () => props.show,
  newVal => {
    if (newVal) {
      emit('open');
    } else {
      emit('close');
    }
  }
);
</script>

<style scoped lang="scss">
.tsm-popup {
  overflow: hidden;
  .tsm-transition--slide-up {
    max-height: calc(100% - 44px);
  }

  .tsm-transition--slide-down {
    max-height: calc(100% - 44px);
  }

  .tsm-transition--slide-left {
    max-width: calc(100% - 44px);
  }

  .tsm-transition--slide-right {
    max-width: calc(100% - 44px);
  }

  .tsm-popup-content {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--tsm-color-bg-white);
    position: relative;
    .tsm-popup-content-header {
      .tsm-pch-indicator {
        display: flex;
        padding: 8px 10px 0 10px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        align-self: stretch;
        .tsm-pch-indicator-rect {
          width: 40px;
          height: 4px;
          border-radius: 4px;
          background: #d9d9d9;
        }
      }
      .tsm-pch-tc {
        display: flex;
        height: 56px;
        justify-content: flex-end;
        align-items: center;
        .tsm-pch-title {
          flex: 1 1 0;
          color: var(--tsm-color-text-primary);
          text-align: center;
          font-style: normal;
          font-weight: 600;
          line-height: var(--tsm-line-height-text-xl);
        }
        .tsm-pch-close {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
      }
    }
    .tsm-popup-content-body {
      padding: var(--tsm-spacing-xl);
      flex: 1 1 auto;
      overflow: auto;
      box-sizing: border-box;
    }
    .tsm-popup-content-footer {
      display: flex;
      padding: var(--tsm-spacing-2xl) var(--tsm-spacing-xl) var(--tsm-spacing-4xl) var(--tsm-spacing-xl);
      align-items: center;
      gap: var(--tsm-spacing-xl);
    }
  }
}
</style>
