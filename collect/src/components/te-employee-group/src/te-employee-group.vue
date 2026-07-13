<template>
  <div class="te-employee-group">
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
      width="560px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <te-employee-group-content
        v-model="innerValue"
        :multiple="multiple"
        :mode="mode"
        :filter-member-ids="filterMemberIds"
        @change="onChange"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElInput, ElDialog, ElIcon } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { mockEmployeeGroups } from '../../_mock/employee-group';
import TeEmployeeGroupContent from './te-employee-group-content.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    multiple?: boolean;
    placeholder?: string;
    clearable?: boolean;
    title?: string;
    mode?: 'standard' | 'cloud';
    filterMemberIds?: string[];
  }>(),
  {
    modelValue: () => [],
    multiple: true,
    placeholder: '请选择员工组',
    clearable: true,
    title: '选择员工组',
    mode: 'standard',
    filterMemberIds: () => [],
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
    .map((id) => mockEmployeeGroups.find((g) => g.id === id)?.name)
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

defineOptions({ name: 'TeEmployeeGroup' });
</script>

<style lang="less" scoped>
.te-employee-group {
  width: 100%;
  :deep(.el-input__inner) { cursor: pointer; }
}
</style>
