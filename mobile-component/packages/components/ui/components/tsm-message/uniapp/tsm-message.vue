<template>
  <tsm-transition mode="slide-down" :customStyle="containerStyle" :show="innerVisible">
    <view class="tsm-message" :class="[bemClass, messageAlignClass]">
      <view class="tsm-message-left">
        <img class="tsm-message-left-image" :src="leftIcon" alt="icon" />
      </view>
      <view class="tsm-message-center">
        <text ref="tsm-message-text" class="tsm-message-text">{{ messageValue }}</text>
        <text ref="tsm-message-text-measure" class="tsm-message-text-measure">{{ messageValue }}</text>
      </view>
      <tsm-button v-if="rightActionValue === 'link'" size="s" type="link" theme="primary" @tap="handleTap">
        <text class="tsm-message-link-text"> Link </text>
      </tsm-button>
      <view v-if="rightActionValue === 'close'" class="tsm-message-right">
        <icon-close class="tsm-message-right-close" @tap="handleClose" />
      </view>
    </view>
  </tsm-transition>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref, watch, type CSSProperties } from 'vue';
import { type MessageProps, defaultProps } from './props';
import { addUnit, bem } from '../../../libs/uniapp/function/index';
import picMessageSuccess from '../../../assets/image/message/pic-message-success.svg';
import picMessageWarning from '../../../assets/image/message/pic-message-warning.svg';
import picMessageDanger from '../../../assets/image/message/pic-message-danger.svg';
import picMessageInfo from '../../../assets/image/message/pic-message-info.svg';

// #ifdef APP-NVUE
const dom = uni.requireNativePlugin('dom');
// #endif

const props = withDefaults(defineProps<MessageProps>(), defaultProps);

const emit = defineEmits<{
  /** 更新显示状态 */
  'update:visible': [value: boolean];
  /** 消息打开时触发 */
  open: [];
  /** 消息关闭时触发 */
  close: [];
  /** 点击消息时触发 */
  tap: [];
}>();
const instance = getCurrentInstance();

const leftIcon = computed(() => {
  switch (typeValue.value) {
    case 'error':
      return picMessageDanger;
    case 'success':
      return picMessageSuccess;
    case 'warning':
      return picMessageWarning;
    case 'info':
      return picMessageInfo;
    default:
      return picMessageInfo;
  }
});

// 是否展示当前消息
const innerVisible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;
const isMultiLine = ref(false);

const topValue = computed(() => props.top);
const rightActionValue = computed(() => props.rightAction);
const typeValue = computed(() => props.type);
const messageValue = computed(() => props.message);
const durationValue = computed(() => props.duration);
const messageAlignClass = computed(() => (isMultiLine.value ? 'tsm-message--multi' : 'tsm-message--single'));

// BEM 类名，包含主题类型和外部自定义类名
const bemClass = computed(() => {
  return bem('message', [typeValue.value], []);
});

// 容器样式：控制顶部距离与固定定位
const containerStyle = computed(() => {
  let top = 0;
  if (topValue.value === 0) {
    top = 44; // H5导航栏高度
  }
  const style: CSSProperties = {
    top: addUnit(String(topValue.value === 0 ? top : topValue.value)),
    position: 'fixed',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 10076,
  };
  return style;
});

// 清理定时器并关闭消息
const clearTimer = () => {
  innerVisible.value = false;
  isMultiLine.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

/**
 * 测量消息文本是否为多行
 *
 * 实现思路：
 * 1) 对比两个元素的 height：
 *    - `.tsm-message-text`：实际显示的文本，可能被截断
 *    - `.tsm-message-text-measure`：用于测量单行高度的隐藏元素
 * 2) 如果实际文本高度 > 单行高度，则判定为多行
 *
 * 平台差异：
 * - 非 NVUE：使用 createSelectorQuery 的 boundingClientRect 获取尺寸
 * - NVUE：使用 dom.getComponentRect 获取尺寸
 *   - 需要通过 this.$refs 获取组件实例
 *   - dom.getComponentRect 回调中 res.size 包含 {width, height}
 */
const measureMessageLine = () => {
  if (!innerVisible.value || !instance?.proxy) {
    return;
  }
  nextTick(() => {
    // #ifndef APP-NVUE
    const query = uni.createSelectorQuery().in(instance.proxy);
    query.select('.tsm-message-text').boundingClientRect();
    query.select('.tsm-message-text-measure').boundingClientRect();
    query.exec((result: any) => {
      const textRect = result?.[0];
      const singleLineRect = result?.[1];
      if (!textRect || !singleLineRect) {
        return;
      }
      isMultiLine.value = textRect.height > singleLineRect.height + 1;
    });
    // #endif

    // #ifdef APP-NVUE
    const textRef = instance?.ctx?.$refs?.['tsm-message-text'];
    const measureRef = instance?.ctx?.$refs?.['tsm-message-text-measure'];
    if (!textRef || !measureRef) {
      return;
    }
    dom.getComponentRect(textRef, (textRes: any) => {
      dom.getComponentRect(measureRef, (measureRes: any) => {
        const textRect = textRes?.size;
        const singleLineRect = measureRes?.size;
        if (!textRect || !singleLineRect) {
          return;
        }
        isMultiLine.value = textRect.height > singleLineRect.height + 1;
      });
    });
    // #endif
  });
};

// 点击处理
const handleTap = () => {
  emit('tap');
};

const handleClose = () => {
  emit('update:visible', false);
};

watch(
  () => props.visible,
  (newVal: boolean) => {
    if (newVal) {
      clearTimer();
      isMultiLine.value = false;
      innerVisible.value = true;
      emit('open');
      nextTick(() => {
        measureMessageLine();
      });
      if (durationValue.value > 0) {
        timer = setTimeout(() => {
          emit('update:visible', false);
        }, durationValue.value);
      }
    } else {
      clearTimer();
      emit('close');
    }
  }
);

watch([messageValue, innerVisible], () => {
  measureMessageLine();
});
</script>

<style scoped lang="scss">
.tsm-message {
  display: flex;
  box-sizing: border-box;
  margin: 0;
  width: auto;
  padding: var(--tsm-spacing-m) var(--tsm-spacing-xl);
  border-radius: var(--tsm-radius-l);
  background: var(--tsm-color-bg-white);
  box-shadow:
    0 -1px 8px 0 var(--tsm-shadow-l-04),
    0 12px 16px -4px var(--tsm-shadow-l-01),
    0 4px 6px -2px var(--tsm-shadow-l-02),
    0 2px 2px -1px var(--tsm-shadow-l-03);
}

.tsm-message.tsm-message--single {
  align-items: center;
}

.tsm-message.tsm-message--multi {
  align-items: flex-start;
}

.tsm-message-left {
  display: flex;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
}

.tsm-message-left .tsm-message-left-image {
  width: 32px;
  height: 32px;
}

.tsm-message-text,
.tsm-message-text-measure {
  width: auto;
  color: var(--tsm-color-text-primary);
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m);
}

.tsm-message-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.tsm-message-center {
  position: relative;
  margin-left: var(--tsm-spacing-m);
  margin-right: var(--tsm-spacing-2xs);
  max-width: 220px;
  flex: 0 1 auto;
  display: flex;
  align-items: center;
}

.tsm-message-text-measure {
  position: absolute;
  left: 0;
  top: 0;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
  visibility: hidden;
  display: block;
}

.tsm-message-right {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--tsm-spacing-m) var(--tsm-spacing-xs) var(--tsm-spacing-m) var(--tsm-spacing-m);
  box-sizing: border-box;
}

.tsm-message-link {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tsm-message-link-text {
  color: var(--tsm-color-primary);
  text-align: center;
  font-size: var(--tsm-font-size-text-m);
  font-style: normal;
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-m); /* 157.143% */
}

.tsm-message-right-close {
  width: 16px;
  height: 16px;
  color: var(--tsm-color-text-secondary);
}
</style>
