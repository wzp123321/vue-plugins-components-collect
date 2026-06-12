<template>
  <view class="tsm-picker" :class="[customClass]" :style="customStyle">
    <tsm-popup mode="bottom" :show="show" :title="title" :closeable="true" @update:show="onUpdateShow" @close="onClose">
      <!-- picker-view 选择器 -->
      <view class="tsm-picker__content">
        <picker-view
          class="tsm-picker__view"
          :value="[currentIndex]"
          indicator-class="tsm-picker__indicator"
          mask-class="tsm-picker__mask"
          @change="onChange"
        >
          <picker-view-column>
            <view
              v-for="(option, index) in options"
              :key="index"
              class="tsm-picker__item"
              :class="{ 'tsm-picker__item--active': index === currentIndex }"
            >
              {{ option.label }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>

      <!-- Footer 插槽：确定按钮 -->
      <template #footer>
        <view class="tsm-picker__footer">
          <tsm-button :style="{ width: '100%' }" theme="primary" block :label="confirmText" @click="onConfirm" />
        </view>
      </template>
    </tsm-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed, inject } from 'vue';
import type { PickerProps } from './props';
import { defaultProps } from './props';
import type { FormItemContext } from '../../tsm-form-item/uniapp/type';

const props = withDefaults(defineProps<PickerProps>(), defaultProps);

const emit = defineEmits<{
  /** 确认事件 */
  (e: 'confirm', value: string | number): void;
  /** 取消事件 */
  (e: 'cancel'): void;
  /** 选项变更事件 */
  (e: 'change', value: string | number): void;
  /** 同步显示/隐藏状态 */
  (e: 'update:show', value: boolean): void;
  /** 同步选中值 */
  (e: 'update:value', value: string | number): void;
}>();

// 注入 FormItemContext（在 FormItem 内使用时触发验证）
const formItemContext = inject<FormItemContext | null>('formItemContext', null);

// 内部维护的选中值（非受控模式）
const internalValue = ref<string | number | undefined>(props.defaultValue);

// 当前选中值（受控模式优先，否则使用内部值）
const currentValue = computed(() => {
  if (props.value !== undefined) {
    return props.value; // 受控模式
  }
  return internalValue.value ?? props.options[0]?.value; // 非受控模式
});

// 根据值计算索引
const currentIndex = computed(() => {
  const idx = props.options.findIndex(opt => opt.value === currentValue.value);
  return idx >= 0 ? idx : 0;
});

// picker-view change 事件
const onChange = (e: any) => {
  const index = e.detail.value[0];
  const option = props.options[index];
  if (option) {
    // 非受控模式：更新内部值
    internalValue.value = option.value;
    // 通知外部
    emit('update:value', option.value);
    emit('change', option.value);
    // 触发 FormItem 验证（change 触发）
    formItemContext?.onValueChange(option.value);
  }
};

// 确认选择
const onConfirm = () => {
  const option = props.options[currentIndex.value];
  if (option) {
    emit('confirm', option.value);
    // 触发 FormItem 验证（change 触发）
    formItemContext?.onValueChange(option.value);
  }
  emit('update:show', false);
};

// 取消/关闭
const onClose = () => {
  emit('cancel');
  emit('update:show', false);
};

// 弹层状态同步
const onUpdateShow = (val: boolean) => {
  emit('update:show', val);
};

// 监听 defaultValue 变化，更新内部值（非受控模式初始化）
watch(
  () => props.defaultValue,
  newVal => {
    if (props.value === undefined && newVal !== undefined) {
      internalValue.value = newVal;
    }
  }
);

// 监听 options 变化，确保当前值仍然有效
watch(
  () => props.options,
  () => {
    // 如果当前值不在 options 中，重置为第一个选项
    const exists = props.options.some(opt => opt.value === currentValue.value);
    if (!exists && props.options.length > 0) {
      const firstValue = props.options[0].value;
      internalValue.value = firstValue;
      emit('update:value', firstValue);
    }
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.tsm-picker {
  :deep(.tsm-popup-content-body) {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}

.tsm-picker__content {
  height: 220px;
  overflow: hidden;
}

.tsm-picker__view {
  height: 100%;
}

.tsm-picker__item {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tsm-color-text-primary);
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-l);
  font-weight: var(--tsm-font-weight-regular);
  line-height: var(--tsm-line-height-text-l);
}

.tsm-picker__item--active {
  font-size: var(--tsm-font-size-text-2xl);
  font-weight: var(--tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-2xl);
}

:deep(.tsm-picker__indicator) {
  height: 48px;
  background-color: var(--tsm-color-bg-tertiary);
  border-radius: var(--tsm-radius-m);
  z-index: 0 !important;
}
// 隐藏 picker-view 默认的上下细线边框（通过伪元素实现）
:deep(.tsm-picker__indicator)::before,
:deep(.tsm-picker__indicator)::after {
  display: none;
}

:deep(.tsm-picker__mask) {
  background-image:
    /* 上半部分渐变：从顶部浓 → 50%位置透明 */
    linear-gradient(180deg, hsla(0, 0%, 100%, 0.95) 0%, hsla(0, 0%, 100%, 0) 50%),
    /* 下半部分渐变：从底部浓 → 50%位置透明 */
    linear-gradient(0deg, hsla(0, 0%, 100%, 0.95) 0%, hsla(0, 0%, 100%, 0) 50%);
}

.tsm-picker__footer {
  width: 100%;
}
</style>
