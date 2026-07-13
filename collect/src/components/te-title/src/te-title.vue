<template>
  <div class="te-title">
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
      <te-title-content
        v-model="innerValue"
        :multiple="multiple"
        @change="onChange"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElInput, ElDialog, ElButton, ElIcon } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { mockTitles } from '../../_mock/title';
import TeTitleContent from './te-title-content.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    multiple?: boolean;
    placeholder?: string;
    clearable?: boolean;
    title?: string;
  }>(),
  {
    modelValue: () => [],
    multiple: true,
    placeholder: '请选择职务',
    clearable: true,
    title: '选择职务',
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
  const names = innerValue.value
    .map((id) => mockTitles.find((t) => t.id === id)?.name)
    .filter(Boolean);
  return names.join(', ');
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

defineOptions({ name: 'TeTitle' });
</script>

<style lang="less" scoped>
.te-title {
  width: 100%;

  :deep(.el-input__inner) {
    cursor: pointer;
  }
}
</style>
