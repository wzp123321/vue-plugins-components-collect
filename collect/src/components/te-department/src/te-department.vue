<template>
  <div class="te-department">
    <el-input
      v-model="displayText"
      :placeholder="placeholder"
      readonly
      :clearable="clearable"
      @clear="handleClear"
      @click="dialogVisible = true"
    >
      <template #suffix>
        <el-icon><ArrowDown /></el-icon>
      </template>
    </el-input>

    <el-dialog
      v-model="dialogVisible"
      :title="title"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <te-department-content
        v-model="innerValue"
        :multiple="multiple"
        :mode="mode"
        :show-disabled="showDisabled"
        @change="onChange"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElInput, ElDialog, ElIcon } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { flatMockDepartments } from '../../_mock/department';
import TeDepartmentContent from './te-department-content.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    multiple?: boolean;
    placeholder?: string;
    clearable?: boolean;
    title?: string;
    mode?: 'standard' | 'cloud';
    showDisabled?: boolean;
  }>(),
  {
    modelValue: () => [],
    multiple: true,
    placeholder: '请选择部门',
    clearable: true,
    title: '选择部门',
    mode: 'standard',
    showDisabled: false,
  }
);

const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void; (e: 'change', v: any[]): void }>();

const dialogVisible = ref(false);
const innerValue = ref<string[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  (v) => (innerValue.value = [...v])
);

const displayText = computed(() => {
  if (!innerValue.value || innerValue.value.length === 0) return '';
  return innerValue.value
    .map((id) => flatMockDepartments.find((d) => d.id === id)?.name)
    .filter(Boolean)
    .join(', ');
});

const handleClear = () => {
  innerValue.value = [];
  emit('update:modelValue', []);
  emit('change', []);
};

const onChange = (list: any[]) => {
  innerValue.value = list.map((n) => n.id);
  emit('update:modelValue', innerValue.value);
  emit('change', list);
};

defineOptions({ name: 'TeDepartment' });
</script>

<style lang="less" scoped>
.te-department {
  width: 100%;

  :deep(.el-input__inner) {
    cursor: pointer;
  }
}
</style>
