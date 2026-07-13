<template>
  <div class="te-project-select">
    <project-list
      v-if="style === ProjectSelectorStyleEnum.DROP_DOWN_LIST"
      v-model="innerValue"
      :multiple="multiple"
      @change="onChange"
    />
    <project-dialog
      v-else-if="style === ProjectSelectorStyleEnum.MODAL_POP_UP_WINDOW"
      v-model="visible"
      v-model:value="innerValue"
      :multiple="multiple"
      @change="onChange"
    />
    <el-button v-else @click="visible = true">弹层选择 (Style 未指定)</el-button>

    <div class="tps-display">
      <p>已选项目 id: <code>{{ innerValue.join(', ') }}</code></p>
      <p>已选项目名: <code>{{ displayName }}</code></p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElButton } from 'element-plus';
import ProjectList from './components/project-list.vue';
import ProjectDialog from './components/project-dialog.vue';
import { getProjectById } from '../../_mock/project';
import { projectHook } from './components/project-hook';
import { ProjectSelectorStyleEnum } from './constant';

interface Props {
  modelValue?: string[];
  multiple?: boolean;
  style?: keyof typeof ProjectSelectorStyleEnum;
  needAllProjects?: boolean;
  tenantId?: string;
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: true,
  style: 'DROP_DOWN_LIST',
  needAllProjects: true,
  tenantId: 'demo',
});
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void; (e: 'change', v: string[]): void }>();

const innerValue = ref<string[]>([...props.modelValue]);
const visible = ref(false);

watch(
  () => props.modelValue,
  (v) => (innerValue.value = [...v])
);

const { initFlag } = projectHook({
  searchValue: ref(''),
  multiple: ref(props.multiple),
  needAllProjects: ref(props.needAllProjects),
  tenantId: props.tenantId || 'demo',
});
// 占位: 真实项目会触发加载
void initFlag;

const onChange = (v: string[]) => {
  innerValue.value = v;
  emit('update:modelValue', v);
  emit('change', v);
};

const displayName = computed(() => innerValue.value.map((id) => getProjectById(id)?.name).filter(Boolean).join(', '));

defineOptions({ name: 'TeProjectSelect' });
</script>

<style lang="less" scoped>
.te-project-select { width: 100%; }
.tps-display {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fafbfc;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;

  code { color: #409eff; }
}
</style>
