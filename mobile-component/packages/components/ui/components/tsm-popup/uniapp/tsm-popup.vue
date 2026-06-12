/** * Popup 弹窗组件 * @description 弹出层容器，用于展示弹窗、信息提示等内容，支持上、下、左、右和中部弹出 */
<template>
  <view class="tsm-popup" :class="[customClass]">
    <tsm-overlay :show="show" @click="overlayClick" v-if="overlay" :zIndex="zIndex" :opacity="0.5"></tsm-overlay>
    <tsm-transition :show="show" :customStyle="transitionStyle" :mode="position" :class="[popperClass]">
      <view class="tsm-popup-content" :style="[contentStyle]">
        <!-- 弹窗内容头, 仅在从底部弹出时生效 -->
        <view
          class="tsm-popup-content-header"
          :class="[titlePosition === 'left' ? 'tsm-pch-left' : 'tsm-pch-center']"
          v-if="mode === 'bottom' && (title || $slots['header'])"
        >
          <template v-if="titlePosition === 'left'">
            <view class="tsm-pch-title">
              <!-- 弹窗标题槽位 -->
              <slot name="header">
                <view class="tsm-pch-title-text">{{ title }}</view>
              </slot>
            </view>
            <view class="tsm-pch-left">
              <slot name="header-left"></slot>
            </view>
            <view class="tsm-pch-right">
              <slot name="header-right"></slot>
            </view>
            <icon-close class="tsm-pch-close" v-if="closeable" @click="close" />
          </template>
          <template v-else>
            <view class="tsm-pch-left">
              <slot name="header-left"></slot>
            </view>
            <view class="tsm-pch-title">
              <!-- 弹窗标题槽位 -->
              <slot name="header">
                <view class="tsm-pch-title-text">{{ title }}</view>
              </slot>
            </view>
            <view class="tsm-pch-right">
              <slot name="header-right"></slot>
            </view>
            <icon-close class="tsm-pch-close" v-if="closeable" @click="close" />
          </template>
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
    return deepMerge(style, { left: 0, right: 0, 'max-height': '100%' });
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
    max-height: 100%;
  }

  .tsm-transition--slide-down {
    max-height: 100%;
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
      padding: 0 var(--tsm-spacing-xl);
      display: flex;
      gap: var(--tsm-spacing-m);
      height: 56px;
      justify-content: flex-end;
      align-items: center;
      .tsm-pch-left {
        flex: 1 0 80px;
        height: 100%;
        line-height: 56px;
      }
      .tsm-pch-title {
        flex: 0 1 auto;
        overflow: hidden;
        height: 100%;
        line-height: 56px;
        text-align: center;
        .tsm-pch-title-text {
          color: var(--tsm-color-text-primary);
          font-family: var(--tsm-font-family-regular);
          font-size: var(--tsm-font-size-text-xl);
          font-style: normal;
          font-weight: var(--tsm-font-weight-bold);
          line-height: 56px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .tsm-pch-right {
        flex: 1 0 50px;
        text-align: right;
        height: 100%;
        line-height: 56px;
      }
      .tsm-pch-close {
        flex: 0 0 22px;
      }
    }
    .tsm-popup-content-body {
      padding: var(--tsm-spacing-xl);
      flex: 1 1 auto;
      overflow: auto;
      box-sizing: border-box;
    }
    .tsm-popup-content-footer {
      padding: var(--tsm-spacing-2xl) var(--tsm-spacing-xl) var(--tsm-spacing-4xl) var(--tsm-spacing-xl);
    }
  }
}
</style>
