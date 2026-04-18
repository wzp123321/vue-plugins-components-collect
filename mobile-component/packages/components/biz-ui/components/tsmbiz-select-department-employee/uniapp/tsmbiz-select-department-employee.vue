/** * 选择部门/员工组件 * @description 用于选择部门或员工的弹窗组件 */
<template>
  <tsm-popup
    mode="bottom"
    :show="show"
    @update:show="(value: boolean) => emit('update:show', value)"
    :closeable="true"
    :safeAreaInsetBottom="true"
    :closeOnClickOverlay="true"
    :title="'选择人员'"
    class="tsm-select-department-employee-popup"
  >
    <view class="tsm-select-department-employee">
      <tsm-search placeholder="搜索姓名、拼音、域账号、昵称" />
      <view v-for="item in organizationTypes" :key="item.type" class="tsm-list-item">
        <text>{{ item.name }}</text>
      </view>
    </view>
  </tsm-popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SelectDepartmentEmployeeProps } from './props';
import { defaultProps, ORGANIZATION_TYPE } from './props';
import { bem } from '../../../libs/uniapp/function/index';

const props = withDefaults(defineProps<SelectDepartmentEmployeeProps>(), defaultProps);

const organizationTypes = [
  {
    type: ORGANIZATION_TYPE.LOCAL,
    name: '本机构',
  },
  {
    type: ORGANIZATION_TYPE.SHARED,
    name: '共享机构',
  },
];

const emit = defineEmits<{
  (e: 'confirm', data: Array<{ id: string; name: string; type: 'department' | 'employee' }>): void;
  (e: 'cancel'): void;
  (e: 'close'): void;
  (e: 'update:show', value: boolean): void;
}>();
</script>

<style scoped lang="scss">
.tsm-select-department-employee-popup {
  height: 100%;
}

.tsm-select-department-employee {
  height: 100%;
}
</style>
