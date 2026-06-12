/** * ListCell 列表单元格组件 * @description 业务列表单元格组件，支持多种布局和交互模式 */
<template>
  <view class="tsmbiz-list-cell" hover-class="tsmbiz-list-cell--hover">
    <tsm-checkbox
      v-if="data.selectable"
      :checked="selected.map(item => item.id).includes(data.id)"
      @click.stop="onSelect"
      class="tsmbiz-list-cell__checkbox"
    />

    <view class="tsmbiz-list-cell__icon">
      <slot name="icon"></slot>
      <!-- <tsm-avatar v-if="!$slots.icon" type="icon" /> -->
    </view>

    <view class="tsmbiz-list-cell__content">
      <view class="tsmbiz-list-cell__main">
        <view v-if="data.title" class="tsmbiz-list-cell__title">
          <text>{{ data.title }}</text>
          <text v-if="data.count" class="tsmbiz-list-cell__count">({{ data.count }})</text>
        </view>
        <text v-if="data.subtitle" class="tsmbiz-list-cell__subtitle">{{ data.subtitle }}</text>
      </view>
    </view>

    <icon-right v-if="data.hasNextLevel" class="tsmbiz-list-cell__right-icon" />
    <icon-close-medium v-if="data.clearable" class="tsmbiz-list-cell__right-icon" @click="onClear" />
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import type { dataProps, ListCellProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<ListCellProps>(), defaultProps);
const emit = defineEmits(['select', 'update:selected', 'clear']);
const selected = computed({
  get: () => props.selected,
  set: (val: Array<dataProps>) => emit('update:selected', val),
});

const onSelect = () => {
  emit('select', props.data);
};

const onClear = () => {
  emit('clear', props.data);
};

defineExpose({});
</script>

<style scoped lang="scss">
.tsmbiz-list-cell--hover {
  width: 100%;
  height: 100%;
  border-radius: var(--te-radius-l, 8px);
  // background: var(--var-tsm-color-bg-tertiary, rgba(245, 245, 245, 1));
  background: red;
}

.tsmbiz-list-cell {
  display: flex;
  align-items: center;
  padding: 8px 0px;
  background-color: #ffffff;
}

.tsmbiz-list-cell__checkbox {
  margin-right: 8px;
}

.tsmbiz-list-cell__icon {
  margin-right: 8px;
}

.tsmbiz-list-cell__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tsmbiz-list-cell__main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tsmbiz-list-cell__title {
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  font-family: var(--var-tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--var-tsm-font-size-text-l, 16px);
  line-height: var(--var-tsm-line-height-text-l, 24px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tsmbiz-list-cell__count {
  color: var(--var-tsm-color-text-quaternary, rgba(164, 167, 174, 1));
  font-family: var(--var-tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--var-tsm-font-size-text-s, 12px);
  line-height: var(--var-tsm-line-height-text-s, 20px);
  margin-left: 4px;
}

.tsmbiz-list-cell__subtitle {
  color: var(--var-tsm-color-text-quaternary, rgba(164, 167, 174, 1));
  font-family: var(--var-tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--var-tsm-font-size-text-m, 14px);
  line-height: var(--var-tsm-line-height-text-m, 22px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tsmbiz-list-cell__right-icon {
  display: flex;
  align-items: center;
  width: 20px;
  height: 20px;
  color: var(--var-tsm-color-text-quaternary, rgba(164, 167, 174, 1));
}
</style>
