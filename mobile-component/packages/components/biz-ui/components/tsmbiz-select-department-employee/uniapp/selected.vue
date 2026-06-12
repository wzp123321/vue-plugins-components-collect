<template>
  <tsm-popup
    mode="bottom"
    :show="show"
    @update:show="emit('update:show', $event)"
    :closeable="true"
    :safeAreaInsetBottom="true"
    :closeOnClickOverlay="true"
    :title="'已选'"
    :round="20"
    custom-class="tsm-select-department-employee-popup-selected"
  >
    <tsm-button type="primary" @click="handleClearAll">清空</tsm-button>
    <view class="tsm-selected-list">
      <view v-for="item in selected.filter((i: dataProps) => !i.isDepartment)" :key="item.id">
        <list-cell :data="item" v-model:selected="selected" @clear="handleClear" />
      </view>
    </view>

    <confirm-bottom :selected="selected" :multiple-limit="multipleLimit" @confirm="handleConfirm" />
  </tsm-popup>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ConfirmBottom from './confirm.vue';
import type { SelectDepartmentEmployeeProps } from './props';
import { defaultProps } from './props';
import type { dataProps } from '../../../common/list-cell/props';
import ListCell from '../../../common/list-cell/list-cell.vue';

type EmployeeSelectedProps = Pick<SelectDepartmentEmployeeProps, 'selected' | 'multipleLimit' | 'show'>;

const props = withDefaults(defineProps<EmployeeSelectedProps>(), {
  multipleLimit: defaultProps.multipleLimit,
  selected: defaultProps.selected,
  show: false,
});
const show = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
});
const selected = computed({
  get: () => props.selected.map(i => ({ ...i, selectable: false, clearable: true, subtitle: i.departmentFullName! })),
  set: (val: Array<dataProps>) => emit('update:selected', val),
});
const emit = defineEmits<{
  (e: 'update:selected', value: Array<dataProps>): void;
  (e: 'update:show', value: boolean): void;
  (e: 'confirm', value: Array<dataProps>): void;
}>();

const handleConfirm = () => {
  show.value = false;
  emit('confirm', selected.value);
};

const handleClear = (item: dataProps) => {
  selected.value = selected.value.filter((i: dataProps) => i.id !== item.id || i.isDepartment);
};

const handleClearAll = () => {
  selected.value = [];
  show.value = false;
};
</script>

<style scoped lang="scss">
.tsm-select-department-employee-popup-selected :deep(.tsm-transition) {
  top: 0;
}
.tsm-selected-list {
  box-sizing: border-box;
  padding-bottom: 68px;
}
</style>
