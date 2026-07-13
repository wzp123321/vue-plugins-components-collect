<template>
  <el-dialog v-model="visible" title="选择项目" width="560px" destroy-on-close :close-on-click-modal="false">
    <project-list v-model="innerValue" :multiple="multiple" @change="onChange" />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ElDialog, ElButton } from 'element-plus';
import ProjectList from './project-list.vue';

const props = defineProps<{ modelValue: boolean; multiple: boolean; value: string[] }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'update:value', v: string[]): void;
  (e: 'change', v: string[]): void;
}>();

const visible = ref(props.modelValue);
const innerValue = ref<string[]>([...(props.value || [])]);

watch(
  () => props.modelValue,
  (v) => (visible.value = v)
);
watch(visible, (v) => emit('update:modelValue', v));
watch(
  () => props.value,
  (v) => (innerValue.value = [...(v || [])])
);

const onChange = (v: string[]) => {
  innerValue.value = v;
};

const confirm = () => {
  emit('update:value', innerValue.value);
  emit('change', innerValue.value);
  visible.value = false;
};

defineOptions({ name: 'ProjectDialog' });
</script>
