/** * ActionSheet 操作菜单组件 * @description 操作菜单组件，用于显示操作选项 */
<template>
  <tsm-popup mode="bottom" v-model:show="showValue" :closeOnClickOverlay="true" :round="20" @close="onClose">
    <view class="tsm-action-sheet" :class="bemClass" :style="[customStyle, actionSheetStyle]">
      <!-- 顶部描述 -->
      <view
        v-if="displayDescription"
        class="tsm-action-sheet__description"
        :class="[
          `tsm-action-sheet__description--${computedDescriptionAlign}`,
          { 'tsm-action-sheet__description--no-divider': !computedShowDescriptionDivider },
        ]"
      >
        <text class="tsm-action-sheet__description__text">{{ displayDescription }}</text>
      </view>

      <!-- 列表模式 -->
      <template v-if="mode === 'list'">
        <view class="tsm-action-sheet__list" :style="listStyle">
          <view
            v-for="(item, index) in actions"
            :key="index"
            class="tsm-action-sheet__item"
            :class="{
              'tsm-action-sheet__item--disabled': item.type === 'disabled',
              [`tsm-action-sheet__item--${itemAlign}`]: true,
            }"
            @tap="onSelect(item, index)"
          >
            <slot :name="`action-${index}`" :item="item" :index="index">
              <!-- 默认渲染：带图标 + 描述 -->
              <template v-if="item.icon || item[descriptionKey]">
                <image
                  v-if="isImageUrl(item.icon)"
                  :src="item.icon"
                  class="tsm-action-sheet__item__icon"
                  mode="aspectFit"
                />
                <view class="tsm-action-sheet__item__content">
                  <text
                    class="tsm-action-sheet__item__text"
                    :class="`tsm-action-sheet__item__text--${item.type || 'default'}`"
                    >{{ item[textKey] }}</text
                  >
                  <text v-if="item[descriptionKey]" class="tsm-action-sheet__item__desc">{{
                    item[descriptionKey]
                  }}</text>
                </view>
              </template>
              <!-- 默认渲染：纯文字 -->
              <text
                v-else
                class="tsm-action-sheet__item__text"
                :class="`tsm-action-sheet__item__text--${item.type || 'default'}`"
                >{{ item[textKey] }}</text
              >
            </slot>
          </view>
        </view>
      </template>

      <!-- 宫格模式 -->
      <template v-else>
        <view
          class="tsm-action-sheet__grid"
          :class="{
            'tsm-action-sheet__grid--stack': gridMode === 'stack',
            'tsm-action-sheet__grid--scroll': gridMode === 'scroll',
          }"
          :style="gridStyle"
        >
          <view
            v-for="(item, index) in actions"
            :key="index"
            class="tsm-action-sheet__grid-item"
            :class="{
              'tsm-action-sheet__grid-item--disabled': item.type === 'disabled',
            }"
            @tap="onSelect(item, index)"
          >
            <view class="tsm-action-sheet__grid-icon">
              <slot :name="`grid-icon-${index}`" :item="item" :index="index">
                <image
                  v-if="isImageUrl(item.icon)"
                  :src="item.icon"
                  class="tsm-action-sheet__grid-icon__image"
                  mode="aspectFit"
                />
                <text v-else-if="item.icon" class="tsm-action-sheet__grid-icon__text">{{ item.icon }}</text>
              </slot>
            </view>
            <text
              class="tsm-action-sheet__grid-text"
              :class="`tsm-action-sheet__grid-text--${item.type || 'default'}`"
              >{{ item[textKey] }}</text
            >
          </view>
        </view>
      </template>

      <!-- 间隔区域 -->
      <view v-if="showCancel" class="tsm-action-sheet__gap"></view>

      <!-- 取消按钮 -->
      <view v-if="showCancel" class="tsm-action-sheet__cancel" @tap="onCancel">
        <text class="tsm-action-sheet__cancel__text">{{ cancelText }}</text>
      </view>
    </view>
  </tsm-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ActionSheetProps } from './props';
import { defaultProps } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const sysInfo = uni.getSystemInfoSync();
const statusBarHeight = sysInfo.statusBarHeight || 0;
const windowHeight = sysInfo.windowHeight || 0;
const defaultMaxHeight = `${windowHeight - statusBarHeight}px`;

const props = withDefaults(defineProps<ActionSheetProps>(), defaultProps);

const emit = defineEmits<{
  select: [item: any, index: number, value?: any];
  cancel: [];
  close: [];
  open: [];
  'update:show': [value: boolean];
}>();

const showValue = computed({
  get: () => props.show,
  set: val => emit('update:show', val),
});

const bemClass = computed(() => {
  return bem('action-sheet', [], [], props.customClass);
});

const displayDescription = computed(() => {
  return props.description || props.title;
});

const computedDescriptionAlign = computed(() => {
  if (props.descriptionAlign !== undefined) return props.descriptionAlign;
  return props.mode === 'grid' ? 'left' : 'center';
});

const computedShowDescriptionDivider = computed(() => {
  if (props.showDescriptionDivider !== undefined) return props.showDescriptionDivider;
  return props.mode !== 'grid';
});

const sheetMaxHeight = computed(() => props.maxHeight || defaultMaxHeight);

const actionSheetStyle = computed(() => {
  return {
    maxHeight: sheetMaxHeight.value,
    display: 'flex',
    flexDirection: 'column',
  };
});

const listStyle = computed(() => {
  return {
    overflowY: 'auto',
    flex: 1,
  };
});

const gridStyle = computed(() => {
  if (props.gridMode === 'stack') {
    return {
      overflowY: 'auto',
      flex: 1,
    };
  }
  return {};
});

const isImageUrl = (icon?: string) => {
  if (!icon) return false;
  return (
    icon.startsWith('http') ||
    icon.startsWith('data:') ||
    icon.includes('/') ||
    /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(icon)
  );
};

const doClose = async (action: 'select' | 'cancel' | 'overlay') => {
  if (props.beforeClose) {
    const result = props.beforeClose(action);
    const canClose = result instanceof Promise ? await result : result;
    if (!canClose) return;
  }
  emit('update:show', false);
  emit('close');
};

const textKey = computed(() => props.textKey || 'label');
const descriptionKey = computed(() => 'description');

const getValue = (item: any) => {
  return props.valueKey ? item[props.valueKey] : undefined;
};

const onSelect = (item: any, index: number) => {
  if (item.type === 'disabled') return;
  emit('select', item, index, getValue(item));
  doClose('select');
};

const onCancel = () => {
  emit('cancel');
  doClose('cancel');
};

const onClose = () => {
  doClose('overlay');
};

const open = () => {
  emit('update:show', true);
  emit('open');
};

const close = () => {
  doClose('overlay');
};

defineExpose({
  open,
  close,
});
</script>

<style scoped lang="scss">
:deep(.tsm-popup-content-body) {
  padding: 0px !important;
}
.tsm-action-sheet {
  background-color: transparent;
  overflow: hidden;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.tsm-action-sheet__description {
  padding: var(--tsm-spacing-xl);
  border-bottom: 1px solid var(--tsm-color-border-secondary);
  background-color: var(--tsm-color-bg-white);

  &--center {
    text-align: center;
  }

  &--left {
    text-align: left;
  }

  &--no-divider {
    border-bottom: none;
  }
}

.tsm-action-sheet__description__text {
  color: var(--tsm-color-text-secondary);
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-m);

  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-m);
}

.tsm-action-sheet__list {
  flex: 1;
  overflow-y: auto;
  background-color: var(--tsm-color-bg-white);
}

.tsm-action-sheet__item {
  display: flex;
  align-items: center;
  padding-inline: var(--tsm-spacing-2xl);
  padding-top: var(--tsm-spacing-2xl);
  padding-bottom: 15px;
  border-bottom: 1px solid var(--tsm-color-border-secondary);

  &:last-child {
    border-bottom: none;
  }

  &--center {
    justify-content: center;
  }

  &--left {
    justify-content: flex-start;
  }
}

.tsm-action-sheet__item--disabled {
  .tsm-action-sheet__item__text,
  .tsm-action-sheet__item__desc {
    color: var(--tsm-color-text-disabled);
  }
}

.tsm-action-sheet__item__icon {
  width: 20px;
  height: 20px;
  margin-right: var(--tsm-spacing-m);
  flex-shrink: 0;
}

.tsm-action-sheet__item__content {
  display: flex;
  flex-direction: column;
  gap: var(--tsm-spacing-xs);
}

.tsm-action-sheet__item__text {
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);

  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
  text-align: center;

  &--default {
    color: var(--tsm-color-text-primary);
  }

  &--danger {
    color: var(--tsm-color-danger);
  }

  &--disabled {
    color: var(--tsm-color-text-disabled);
  }
}

.tsm-action-sheet__item__desc {
  color: var(--tsm-color-text-secondary);
  text-align: center;
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-s);

  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-s);
}

/* ========== 宫格模式 ========== */
.tsm-action-sheet__grid {
  background-color: var(--tsm-color-bg-white);
  width: 100%;
  min-width: 0;

  &--stack {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    overflow-y: auto;

    .tsm-action-sheet__grid-item {
      width: 25%;
    }
  }

  &--scroll {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;

    .tsm-action-sheet__grid-item {
      flex-shrink: 0;
      width: 80px;
    }
  }
}

.tsm-action-sheet__grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--tsm-spacing-xl) 0;
  box-sizing: border-box;
}

.tsm-action-sheet__grid-item--disabled {
  .tsm-action-sheet__grid-icon {
    opacity: 0.4;
  }

  .tsm-action-sheet__grid-text {
    color: var(--tsm-color-text-disabled);
  }
}

.tsm-action-sheet__grid-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--tsm-spacing-m);
  background-color: var(--tsm-color-bg-tertiary);
  border-radius: var(--tsm-radius-m);
  overflow: hidden;
}

.tsm-action-sheet__grid-icon__image {
  width: 24px;
  height: 24px;
}

.tsm-action-sheet__grid-icon__text {
  font-size: var(--tsm-font-size-display-m);
}

.tsm-action-sheet__grid-text {
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-s);

  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-xs);
  text-align: center;

  &--default {
    color: var(--tsm-color-text-primary);
  }

  &--danger {
    color: var(--tsm-color-danger);
  }

  &--disabled {
    color: var(--tsm-color-text-disabled);
  }
}

/* ========== 底部 ========== */
.tsm-action-sheet__gap {
  height: var(--tsm-spacing-m);
  background: var(--tsm-color-bg-tertiary);
}

.tsm-action-sheet__cancel {
  display: flex;
  min-height: 48px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  background-color: var(--tsm-color-bg-white);
}

.tsm-action-sheet__cancel__text {
  color: var(--tsm-color-text-primary);
  text-align: center;
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);

  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-l);
}
</style>
