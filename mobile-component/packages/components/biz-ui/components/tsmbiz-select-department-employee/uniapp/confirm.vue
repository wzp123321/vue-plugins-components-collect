<template>
  <view
    v-if="selected.filter(i => !i.isDepartment).length > 0"
    class="tsm-select-department-employee-footer"
  >
    <view
      class="tsm-select-department-employee-footer-left"
      @click="handleCountClick"
    >
      <text class="tsm-select-department-employee-footer-text">已选:</text>
      <text class="tsm-select-department-employee-footer-count">{{
        selected.filter(i => !i.isDepartment).length
        }}</text>
      <text class="tsm-select-department-employee-footer-total">/{{ props.multipleLimit }}</text>
    </view>
    <tsm-button
      class="tsm-select-department-employee-footer-confirm"
      theme="primary"
      @click="handleConfirm"
    >确定</tsm-button>
  </view>
</template>

<script setup lang="ts">
import type { SelectDepartmentEmployeeProps } from './props';
import { defaultProps } from './props';

type ConfirmBottomProps = Pick<SelectDepartmentEmployeeProps, 'selected' | 'multipleLimit' | 'show'>;
const props = withDefaults(defineProps<ConfirmBottomProps>(), {
  multipleLimit: defaultProps.multipleLimit,
  selected: defaultProps.selected,
  show: false,
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'count:click'): void;
}>();

const handleConfirm = () => {
  emit('confirm');
};

const handleCountClick = () => {
  emit('count:click');
};
</script>

<style scoped lang="scss">
.tsm-select-department-employee-footer {
  position: fixed;
  box-sizing: border-box;
  bottom: 0px;
  left: 0px;
  width: 100%;
  padding: 16px 12px 24px 12px;
  background: var(--var-tsm-color-bg-white, rgba(255, 255, 255, 1));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tsm-select-department-employee-footer-left {
  display: flex;
  align-items: center;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  font-family: var(--var-tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--var-tsm-font-size-text-m, 14px);
  line-height: var(--var-tsm-line-height-text-m, 22px);
}

.tsm-select-department-employee-footer-text {
  margin-right: 4px;
}

.tsm-select-department-employee-footer-count {
  margin-right: 4px;
}

.tsm-select-department-employee-footer-total {
  color: var(--var-tsm-color-text-secondary, rgba(113, 118, 128, 1));
}

.tsm-select-department-employee-footer-confirm {
  margin: 0;
}
</style>
