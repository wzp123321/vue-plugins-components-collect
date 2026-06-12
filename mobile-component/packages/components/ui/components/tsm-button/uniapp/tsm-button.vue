/** * Button 按钮 * @description 按钮组件，支持多种样式类型、语义主题、尺寸和形状。 */
<template>
  <button
    :hover-class="hoverClassName"
    class="tsm-button"
    :class="buttonClasses"
    :style="buttonStyles"
    :disabled="disabled || loading"
    @tap="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 前缀图标 -->
    <view v-if="showPrefixIcon" class="tsm-button__icon tsm-button__icon--prefix">
      <slot name="prefix-icon">
        <text class="tsm-button__icon-default"></text>
      </slot>
    </view>

    <!-- 加载状态 -->
    <template v-if="loading">
      <view class="tsm-button__loading">
        <slot name="loading">
          <view class="tsm-button__loading-spinner">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9.5" y="1" width="1" height="4" rx="0.5" fill="currentColor" opacity="1" />
              <rect
                x="13.5"
                y="3.5"
                width="1"
                height="3"
                rx="0.5"
                fill="currentColor"
                opacity="0.85"
                transform="rotate(45 14 5)"
              />
              <rect x="15" y="9.5" width="4" height="1" rx="0.5" fill="currentColor" opacity="0.7" />
              <rect
                x="13.5"
                y="13.5"
                width="1"
                height="3"
                rx="0.5"
                fill="currentColor"
                opacity="0.55"
                transform="rotate(-45 14 15)"
              />
              <rect x="9.5" y="15" width="1" height="4" rx="0.5" fill="currentColor" opacity="0.4" />
              <rect
                x="3.5"
                y="13.5"
                width="1"
                height="3"
                rx="0.5"
                fill="currentColor"
                opacity="0.25"
                transform="rotate(45 4 15)"
              />
              <rect x="1" y="9.5" width="4" height="1" rx="0.5" fill="currentColor" opacity="0.1" />
              <rect
                x="3.5"
                y="3.5"
                width="1"
                height="3"
                rx="0.5"
                fill="currentColor"
                opacity="0.95"
                transform="rotate(-45 4 5)"
              />
            </svg>
          </view>
        </slot>
      </view>
      <text v-if="!isIconOnly" class="tsm-button__loading-text">{{ loadingText || label }}</text>
    </template>

    <!-- 默认内容 -->
    <template v-else>
      <slot>
        <text class="tsm-button__text">{{ label }}</text>
      </slot>
    </template>

    <!-- 后缀图标（通用） -->
    <view v-if="showSuffixIcon" class="tsm-button__icon tsm-button__icon--suffix">
      <slot name="suffix">
        <text class="tsm-button__icon-default"></text>
      </slot>
    </view>

    <!-- 后缀图标（仅 iconText 类型使用） -->
    <view v-if="type === 'iconText'" class="tsm-button__icon tsm-button__icon--suffix">
      <slot name="suffix-icon">
        <text class="tsm-button__icon-default"></text>
      </slot>
    </view>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import type { ButtonProps } from './props';
import { defaultProps } from './props';
import { addStyle, bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<ButtonProps>(), defaultProps);

const emit = defineEmits<{
  click: [e: Event];
}>();

// ==================== ButtonGroup 检测 ====================
const isInGroup = inject('tsmButtonGroup', false);

// ==================== 状态管理 ====================

/** 是否处于按下状态（用于 active 样式） */
const isPressed = ref(false);

// ==================== 计算属性 ====================

/** 是否显示前缀图标 */
const showPrefixIcon = computed(() => {
  // loading 状态下隐藏前缀图标，避免和 loading 图标重叠
  if (props.loading) return false;
  return props.prefixIcon || props.type === 'iconText';
});

/** 是否显示后缀图标 */
const showSuffixIcon = computed(() => {
  // loading 状态下隐藏后缀图标，避免和 loading 图标重叠
  if (props.loading) return false;
  return props.suffixIcon;
});

/** 是否为纯图标模式（只有图标没有文字） */
const isIconOnly = computed(() => {
  // 有图标但没有文字（loading 不改变图标按钮的本质）
  // 不依赖 showPrefixIcon/showSuffixIcon，因为 loading 时它们会返回 false
  const hasIcon = props.prefixIcon || props.suffixIcon || props.type === 'iconText';
  return hasIcon && !props.label;
});

/** hover 类名（uniapp 的 hover-class） */
const hoverClassName = computed(() => {
  if (props.disabled || props.loading) return '';
  return 'tsm-button--hover';
});

/** 按钮类名组合 */
const buttonClasses = computed(() => {
  const { type, theme, size, shape, long, disabled, loading, customClass } = props;

  return bem(
    'button',
    // fixed: 基础修饰符
    [type, theme, size, shape],
    // change: 条件修饰符 [string, boolean][]
    [
      ['disabled', disabled],
      ['loading', loading],
      ['long', long],
      ['with-icon', showPrefixIcon.value || showSuffixIcon.value],
      ['icon-only', isIconOnly.value],
      ['pressed', isPressed.value && !disabled && !loading],
      ['in-group', isInGroup],
    ],
    customClass
  );
});

/** 按钮样式 */
const buttonStyles = computed(() => {
  const style: Record<string, string> = {};

  // 自定义颜色（最高优先级）
  if (props.color) {
    applyCustomColor(style, props.color, props.type);
  }

  return addStyle({ ...style, ...props.customStyle });
});

// ==================== 方法 ====================

function applyCustomColor(style: Record<string, string>, color: string, type?: string) {
  switch (type) {
    case 'solid':
      style.backgroundColor = color;
      style.borderColor = color;
      style.color = 'var(--tsm-color-text-white)';
      break;
    case 'outline':
    case 'dash':
      style.backgroundColor = 'transparent';
      style.borderColor = color;
      style.color = color;
      break;
    case 'text':
    case 'link':
      style.backgroundColor = 'transparent';
      style.borderColor = 'transparent';
      style.color = color;
      break;
    case 'ghost':
      style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      style.borderColor = color;
      style.color = color;
      break;
    case 'iconText':
      style.backgroundColor = color;
      style.borderColor = color;
      style.color = 'var(--tsm-color-text-white)';
      break;
    default:
      style.backgroundColor = color;
      style.borderColor = color;
      style.color = 'var(--tsm-color-text-white)';
  }
}

/** 点击处理 */
const handleClick = (e: Event) => {
  if (props.disabled || props.loading) return;
  emit('click', e);
};

/** 触摸开始 - 触发 active 状态 */
const handleTouchStart = () => {
  if (props.disabled || props.loading) return;
  isPressed.value = true;
};

/** 触摸结束 - 取消 active 状态 */
const handleTouchEnd = () => {
  if (props.disabled || props.loading) return;
  isPressed.value = false;
};
</script>

<style scoped lang="scss">
@import '../../../libs/scss/platform-style.scss';

// ==================== 基础样式层（只控制结构，不控制外观）====================

.tsm-button {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border-width: 1px;
  border-style: solid;
  margin: 0;
  transition: all 0.2s ease;
  cursor: pointer;

  // 覆盖 uni-app button 默认伪元素边框
  &::after {
    display: none !important;
    border: none !important;
    content: none !important;
  }
}

// ==================== Theme 层（只控制颜色）====================
// 职责：定义背景色、边框色、文字色
// 不控制：尺寸、圆角、边框样式（solid/dashed）

// Primary 主题 - 文字、边框都是蓝色
.tsm-button--primary {
  --button-text-color: var(--tsm-color-primary);
  --button-bg: var(--tsm-color-primary);
  --button-bg-active: var(--tsm-color-primary-active);
  --button-border-color: var(--tsm-color-primary-border);
  --button-bg-hover: var(--tsm-color-primary-bg);
  --focus-ring: 0 0 0 2px var(--tsm-color-bg-white), 0 0 0 4px var(--tsm-color-primary);
}

// Danger 主题 - 文字、边框都是红色
.tsm-button--danger {
  --button-text-color: var(--tsm-color-danger);
  --button-bg: var(--tsm-color-danger);
  --button-bg-active: var(--tsm-color-danger-active);
  --button-border-color: var(--tsm-color-danger-border);
  --button-bg-hover: var(--tsm-color-danger-bg);
  --focus-ring: 0 0 0 2px var(--tsm-color-bg-white), 0 0 0 4px var(--tsm-color-danger);
}

// Default 主题
.tsm-button--default {
  --button-bg: var(--tsm-color-bg-white);
  --button-bg-active: var(--tsm-color-bg-active);
  --button-border-color: var(--tsm-color-border-primary);
  --button-text-color: var(--tsm-color-text-primary);
  --button-bg-hover: var(--tsm-color-bg-tertiary);
  --focus-ring: 0 0 0 2px var(--tsm-color-bg-white), 0 0 0 4px var(--tsm-color-primary);
}

// ==================== Type 层（控制填充模式和边框样式）====================
// 职责：根据 type 使用 theme 定义的颜色变量
// 不控制：具体的颜色值（由 theme 提供）

// Solid：填充背景 + 边框（只有 primary/danger，没有 default）
// 文字始终是白色
.tsm-button--solid {
  background-color: var(--button-bg);
  border-color: var(--button-border-color);
  color: var(--tsm-color-text-white);
  box-shadow:
    0 0 0 1px rgba(10, 13, 18, 0.18) inset,
    0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
    0 1px 2px 0 rgba(10, 13, 18, 0.05);

  // Default 主题强制转为 primary
  &.tsm-button--default {
    --button-bg: var(--tsm-color-primary);
    --button-bg-active: var(--tsm-color-primary-active);
    --button-border-color: var(--tsm-color-primary-border);
  }

  // Hover：背景变深（仅非 disabled）
  &.tsm-button--hover:not(:disabled),
  &:hover:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--button-bg-active);
  }

  // Active：按下效果 + 焦点环（仅非 disabled）
  &.tsm-button--pressed:not(:disabled),
  &:active:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--button-bg);
    filter: brightness(0.95);
    transform: translateY(1px);
    box-shadow:
      0 0 0 1px rgba(10, 13, 18, 0.18) inset,
      0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
      0 1px 2px 0 rgba(10, 13, 18, 0.05),
      0 0 0 2px var(--tsm-color-bg-white),
      0 0 0 4px var(--button-border-color);
  }

  // Loading - 使用高特异性选择器覆盖 uni-app 默认 disabled 样式
  // uni-button[disabled][type='default'] 特异性为 (0,2,1)
  &.tsm-button--loading.tsm-button--loading {
    background-color: var(--button-bg-active);
    color: var(--tsm-color-text-white);
    border-color: var(--button-border-color);
    box-shadow: none;
  }

  // Disabled（必须在最后，优先级最高）
  &.tsm-button--disabled,
  &:disabled {
    background-color: var(--tsm-color-bg-disabled) !important;
    border-color: var(--tsm-color-border-disabled) !important;
    color: var(--tsm-color-text-disabled) !important;
    box-shadow: none !important;
    transform: none !important;
    filter: none !important;
  }
}

// Outline：透明背景 + 彩色边框
// 文字颜色：primary/danger=theme色, default=黑色
// hover=active色, disabled=border色
.tsm-button.tsm-button--outline {
  background-color: var(--tsm-color-bg-white);
  border-color: var(--button-border-color);

  // Primary/Danger：theme色文字
  &.tsm-button--primary,
  &.tsm-button--danger {
    color: var(--button-border-color);

    // Hover：active色
    &.tsm-button--hover:not(:disabled),
    &:hover:not(:disabled):not(.tsm-button--disabled) {
      color: var(--button-bg-active);
    }

    // Disabled：border色
    &.tsm-button--disabled,
    &:disabled {
      color: var(--button-border-color) !important;
      border-color: var(--button-border-color) !important;
    }
  }

  // Default：黑色文字
  &.tsm-button--default {
    color: var(--tsm-color-text-primary);
  }

  // 拟态阴影
  box-shadow:
    0 0 0 1px rgba(10, 13, 18, 0.18) inset,
    0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
    0 1px 2px 0 rgba(10, 13, 18, 0.05);

  // Hover：浅色背景
  &.tsm-button--hover:not(:disabled),
  &:hover:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--tsm-color-overlay-scrim);
  }

  // Active：焦点环
  &.tsm-button--pressed:not(:disabled),
  &:active:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--tsm-color-bg-white);
    box-shadow:
      0 0 0 1px rgba(10, 13, 18, 0.18) inset,
      0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
      0 1px 2px 0 rgba(10, 13, 18, 0.05),
      0 0 0 2px var(--tsm-color-bg-white),
      0 0 0 4px var(--button-border-color);
  }

  // Loading - 高特异性选择器
  &.tsm-button--loading.tsm-button--loading {
    background-color: var(--tsm-color-overlay-scrim);
    color: var(--button-text-color);
    border-color: var(--button-border-color);
  }

  // Disabled（default）
  &.tsm-button--disabled,
  &:disabled {
    background-color: var(--tsm-color-bg-white) !important;
    border-color: var(--tsm-color-border-disabled) !important;
    color: var(--tsm-color-text-disabled) !important;
    box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05) !important;
    transform: none !important;
    filter: none !important;
  }
}

// Text：纯文字（支持 default, primary, danger）
// 文字颜色：primary/danger=theme色, default=黑色
// hover=active色, disabled=border色
.tsm-button.tsm-button--text {
  background-color: var(--tsm-color-bg-white);
  border-color: transparent;
  box-shadow:
    0 0 0 1px rgba(10, 13, 18, 0.18) inset,
    0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
    0 1px 2px 0 rgba(10, 13, 18, 0.05);

  // Primary/Danger：theme色文字
  &.tsm-button--primary,
  &.tsm-button--danger {
    color: var(--button-border-color);

    // Hover：active色
    &.tsm-button--hover:not(:disabled),
    &:hover:not(:disabled):not(.tsm-button--disabled) {
      color: var(--button-bg-active);
    }

    // Disabled：border色
    &.tsm-button--disabled,
    &:disabled {
      color: var(--button-border-color) !important;
    }
  }

  // Default：黑色文字
  &.tsm-button--default {
    color: var(--tsm-color-text-primary);

    // Disabled：text-disabled
    &.tsm-button--disabled,
    &:disabled {
      color: var(--tsm-color-text-disabled) !important;
    }
  }

  // Hover：浅色背景 + 下划线
  &.tsm-button--hover:not(:disabled),
  &:hover:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--button-bg-hover);
    text-decoration: underline;
  }

  // Active：白色背景 + 焦点环
  &.tsm-button--pressed:not(:disabled),
  &:active:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--tsm-color-bg-white);
    box-shadow:
      0 0 0 2px var(--tsm-color-bg-white),
      0 0 0 4px var(--button-border-color);
  }

  // Loading - 高特异性选择器
  &.tsm-button--loading.tsm-button--loading {
    background-color: var(--tsm-color-bg-white);
    color: var(--button-text-color);
  }
}

// Link：文字链接（只支持 s/m 尺寸，xs/l 映射到 s/m）
// 特点：hover 有下划线，active 有边框+焦点环，其他状态无边框
// 文字颜色：primary/danger=theme色, default=黑色
// hover=active色, disabled=border色
.tsm-button.tsm-button--link {
  background-color: transparent;
  border-color: transparent;
  font-weight: var(--tsm-font-weight-bold);
  box-shadow:
    0 0 0 1px rgba(10, 13, 18, 0.18) inset,
    0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
    0 1px 2px 0 rgba(10, 13, 18, 0.05);

  // link 只支持 s/m 两种尺寸（xs/l 映射到 s/m）
  &.tsm-button--xs,
  &.tsm-button--s {
    height: 22px;
    padding: var(--tsm-spacing-none);
    gap: var(--tsm-spacing-xs);
    font-size: var(--tsm-font-size-text-m);
  }

  &.tsm-button--m,
  &.tsm-button--l {
    height: 24px;
    padding: var(--tsm-spacing-none);
    gap: var(--tsm-spacing-xs);
    font-size: var(--tsm-font-size-text-l);
  }

  // Primary/Danger：theme色文字
  &.tsm-button--primary,
  &.tsm-button--danger {
    color: var(--button-border-color);

    // Hover：active色
    &.tsm-button--hover:not(:disabled),
    &:hover:not(:disabled):not(.tsm-button--disabled) {
      color: var(--button-bg-active);
    }

    // Disabled：border色
    &.tsm-button--disabled,
    &:disabled {
      color: var(--button-border-color) !important;
    }
  }

  // Default：黑色文字，但hover是primary-active（特殊！）
  &.tsm-button--default {
    color: var(--tsm-color-text-primary);

    // Hover：primary-active（蓝色）
    &.tsm-button--hover:not(:disabled),
    &:hover:not(:disabled):not(.tsm-button--disabled) {
      color: var(--tsm-color-primary-active);
    }

    // Disabled：text-disabled
    &.tsm-button--disabled,
    &:disabled {
      color: var(--tsm-color-text-disabled) !important;
    }
  }

  // Hover：下划线
  &.tsm-button--hover:not(:disabled),
  &:hover:not(:disabled):not(.tsm-button--disabled) {
    text-decoration: underline;
  }

  // Active：出现边框 + 焦点环
  &.tsm-button--pressed:not(:disabled),
  &:active:not(:disabled):not(.tsm-button--disabled) {
    border-color: var(--button-border-color);
    background-color: transparent;
    box-shadow:
      0 0 0 2px var(--tsm-color-bg-white),
      0 0 0 4px var(--button-border-color);
  }

  // Loading - 高特异性选择器
  &.tsm-button--loading.tsm-button--loading {
    background-color: transparent;
    border-color: transparent;
    color: var(--button-text-color);
  }
}

// Dash：虚线边框（只有 default 主题）
.tsm-button--dash {
  background-color: var(--tsm-color-bg-white);
  border-style: dashed;
  border-color: var(--tsm-color-border-primary);
  color: var(--tsm-color-text-primary);

  // 阴影
  box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05);

  // Hover：背景变浅
  &.tsm-button--hover:not(:disabled),
  &:hover:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--tsm-color-bg-tertiary);
  }

  // Active：白色背景 + 蓝色焦点环
  &.tsm-button--pressed:not(:disabled),
  &:active:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--tsm-color-bg-white);
    box-shadow:
      0 0 0 1px rgba(10, 13, 18, 0.18) inset,
      0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
      0 1px 2px 0 rgba(10, 13, 18, 0.05);
  }

  // Loading - 高特异性选择器
  &.tsm-button--loading.tsm-button--loading {
    background-color: var(--tsm-color-bg-white);
    border-color: var(--tsm-color-border-primary);
    color: var(--tsm-color-text-primary);
  }

  // Disabled
  &.tsm-button--disabled,
  &:disabled {
    background-color: var(--tsm-color-bg-white) !important;
    border-color: var(--tsm-color-border-disabled) !important;
    color: var(--tsm-color-text-disabled) !important;
    box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05) !important;
  }
}

// Ghost：幽灵按钮（深色背景上用）
// 主题：primary、danger（注意：用于深色背景）
.tsm-button--ghost {
  background-color: transparent;

  // 所有主题共享的skeuomorphic阴影
  box-shadow:
    0 0 0 1px rgba(10, 13, 18, 0.18) inset,
    0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
    0 1px 2px 0 rgba(10, 13, 18, 0.05);

  // primary主题
  &.tsm-button--primary {
    border-color: var(--tsm-color-primary);
    color: var(--tsm-color-primary);

    // hover
    &.tsm-button--hover:not(:disabled),
    &:hover:not(:disabled):not(.tsm-button--disabled) {
      background-color: var(--tsm-color-overlay-scrim);
      border-color: var(--tsm-color-primary-active);
      color: var(--tsm-color-primary-active);
    }

    // active
    &.tsm-button--pressed:not(:disabled),
    &:active:not(:disabled):not(.tsm-button--disabled) {
      background-color: var(--tsm-color-overlay-scrim);
      border-color: var(--tsm-color-primary);
      color: var(--tsm-color-primary);
      // focus ring - blue
      box-shadow:
        0 0 0 1px rgba(10, 13, 18, 0.18) inset,
        0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
        0 1px 2px 0 rgba(10, 13, 18, 0.05),
        0 0 0 2px var(--tsm-color-bg-white),
        0 0 0 4px var(--tsm-color-primary);
    }

    // disabled
    &.tsm-button--disabled,
    &:disabled {
      background-color: transparent !important;
      border-color: var(--tsm-color-primary-border) !important;
      color: var(--tsm-color-primary-border) !important;
      box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05) !important;
    }

    // loading - 高特异性选择器
    &.tsm-button--loading.tsm-button--loading {
      background-color: transparent;
      border-color: var(--tsm-color-primary);
      color: var(--tsm-color-primary);
    }
  }

  // danger主题
  &.tsm-button--danger {
    border-color: var(--tsm-color-danger);
    color: var(--tsm-color-danger);

    // hover
    &.tsm-button--hover:not(:disabled),
    &:hover:not(:disabled):not(.tsm-button--disabled) {
      background-color: var(--tsm-color-overlay-scrim);
      border-color: var(--tsm-color-danger);
      color: var(--tsm-color-danger-active);
    }

    // active
    &.tsm-button--pressed:not(:disabled),
    &:active:not(:disabled):not(.tsm-button--disabled) {
      background-color: var(--tsm-color-overlay-scrim);
      border-color: var(--tsm-color-danger);
      color: var(--tsm-color-danger);
      // focus ring - red
      box-shadow:
        0 0 0 1px rgba(10, 13, 18, 0.18) inset,
        0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
        0 1px 2px 0 rgba(10, 13, 18, 0.05),
        0 0 0 2px var(--tsm-color-bg-white),
        0 0 0 4px var(--tsm-color-danger);
    }

    // disabled
    &.tsm-button--disabled,
    &:disabled {
      background-color: transparent !important;
      border-color: var(--tsm-color-danger-border) !important;
      color: var(--tsm-color-danger-border) !important;
      box-shadow: 0 1px 2px 0 rgba(10, 13, 18, 0.05) !important;
    }

    // loading - 高特异性选择器
    &.tsm-button--loading.tsm-button--loading {
      background-color: transparent;
      border-color: var(--tsm-color-danger);
      color: var(--tsm-color-danger);
    }
  }
}

// IconText：图标文字按钮
.tsm-button--iconText {
  background-color: var(--button-bg);
  border-color: var(--button-border-color);
  color: var(--button-text-color);
  box-shadow:
    0 0 0 1px rgba(10, 13, 18, 0.18) inset,
    0 -2px 0 0 rgba(10, 13, 18, 0.05) inset,
    0 1px 2px 0 rgba(10, 13, 18, 0.05);

  &.tsm-button--hover:not(:disabled),
  &:hover:not(:disabled):not(.tsm-button--disabled) {
    background-color: var(--button-bg-active);
  }

  &.tsm-button--pressed:not(:disabled),
  &:active:not(:disabled):not(.tsm-button--disabled) {
    filter: brightness(0.9);
    transform: translateY(1px);
  }

  // Loading - 高特异性选择器
  &.tsm-button--loading.tsm-button--loading {
    background-color: var(--button-bg);
    border-color: var(--button-border-color);
    color: var(--button-text-color);
  }

  &.tsm-button--disabled,
  &:disabled {
    background-color: var(--tsm-color-bg-disabled) !important;
    border-color: var(--tsm-color-border-disabled) !important;
    color: var(--tsm-color-text-disabled) !important;
    transform: none !important;
    filter: none !important;
  }
}

// ==================== Size 层（只控制尺寸）====================
// 职责：height, padding, font-size, gap, icon-size
// 不控制：颜色、圆角

.tsm-button.tsm-button--xs {
  height: 24px;
  padding: 0 var(--tsm-spacing-m);
  gap: var(--tsm-spacing-xs);
  font-size: var(--tsm-font-size-text-m);

  .tsm-button__icon,
  .tsm-button__icon-default,
  .tsm-button__icon :deep(.icon) {
    width: var(--tsm-font-size-text-l);
    height: var(--tsm-font-size-text-l);
  }
}

.tsm-button.tsm-button--s {
  height: 32px;
  padding: 0 var(--tsm-spacing-xl);
  gap: var(--tsm-spacing-xs);
  font-size: var(--tsm-font-size-text-m);

  .tsm-button__icon,
  .tsm-button__icon-default,
  .tsm-button__icon :deep(.icon) {
    width: var(--tsm-font-size-text-l);
    height: var(--tsm-font-size-text-l);
  }
}

.tsm-button.tsm-button--m {
  height: 40px;
  padding: 0 var(--tsm-spacing-xl);
  gap: var(--tsm-spacing-xs);
  font-size: var(--tsm-font-size-text-l);

  .tsm-button__icon,
  .tsm-button__icon-default,
  .tsm-button__icon :deep(.icon) {
    width: var(--tsm-font-size-text-2xl);
    height: var(--tsm-font-size-text-2xl);
  }
}

.tsm-button.tsm-button--l {
  height: 48px; // l 单独定义
  padding: 0 var(--tsm-spacing-2xl);
  gap: var(--tsm-spacing-s);
  font-size: var(--tsm-font-size-text-l);

  .tsm-button__icon,
  .tsm-button__icon-default,
  .tsm-button__icon :deep(.icon) {
    width: 22px;
    height: 22px;
  }
}

// Link 类型不需要额外覆盖，在 Type 层已定义

// ==================== Shape 层（只控制圆角）====================
// 职责：border-radius
// 不控制：其他任何

.tsm-button.tsm-button--rectangle {
  border-radius: var(--tsm-radius-m);
}

.tsm-button.tsm-button--round {
  border-radius: var(--tsm-radius-full);
}

.tsm-button.tsm-button--circle {
  border-radius: var(--tsm-radius-full);
  padding: 0;

  &.tsm-button--xs {
    width: 24px;
  }
  &.tsm-button--s {
    width: 32px;
  }
  &.tsm-button--m {
    width: 40px;
  }
  &.tsm-button--l {
    width: 48px;
  }

  .tsm-button__text {
    display: none;
  }
}

// ==================== 文字样式 ====================

.tsm-button__text {
  display: inline-flex;
  align-items: center;
  font-family: var(--tsm-font-family-regular);
  font-weight: var(--tsm-font-weight-bold);
  line-height: 1;
}

.tsm-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  height: 100%;

  &--prefix {
    margin-right: var(--tsm-spacing-xs);
  }
  &--suffix {
    margin-left: var(--tsm-spacing-xs);
  }
}

// 纯图标模式：移除图标的 margin，确保居中；隐藏文字容器
.tsm-button--icon-only {
  .tsm-button__icon--prefix,
  .tsm-button__icon--suffix {
    margin: 0;
  }

  .tsm-button__text {
    display: none;
  }

  // loading 状态下 loading 图标绝对居中
  .tsm-button__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    width: 100%;
    height: 100%;
  }
}

// ==================== 加载动画 ====================

.tsm-button__loading {
  display: inline-flex;
  align-items: center;
}

.tsm-button__loading-text:empty {
  display: none;
}

.tsm-button__loading-text {
  font-weight: var(--tsm-font-weight-bold);
}

.tsm-button__loading-spinner {
  width: 1em;
  height: 1em;
  animation: tsm-button-spin 1s linear infinite;

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}

@keyframes tsm-button-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// ==================== Long 长按钮 ====================

.tsm-button.tsm-button--long {
  display: flex;
  width: 100%;
}

// ==================== ButtonGroup 样式 ====================
// 当按钮在 ButtonGroup 中时，移除默认边框和圆角
.tsm-button.tsm-button--in-group {
  // 移除 margin
  margin: 0;
  // 移除默认边框，添加右边框作为分隔线
  border: none;
  border-right: 1px solid var(--tsm-color-border-primary);
  border-radius: var(--tsm-radius-none);
  // 移除阴影（outline 类型有 inset 阴影模拟边框）
  box-shadow: none !important;

  // 最后一个按钮移除右边框
  &:last-child {
    border-right: none;
  }
}

// 实心按钮使用白色分隔线
.tsm-button.tsm-button--in-group.tsm-button--solid {
  border-right-color: var(--tsm-color-text-white);
}

// ==================== 禁用状态光标 ====================

.tsm-button.tsm-button--disabled,
.tsm-button:disabled {
  cursor: not-allowed;
}
</style>
