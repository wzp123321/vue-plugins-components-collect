<template>
  <el-popover
    v-model:visible="visible"
    :width="width"
    placement="bottom-start"
    trigger="click"
    popper-class="te-space-select-popper"
  >
    <template #reference>
      <div class="tss-trigger" :class="{ active: visible }">
        <el-input v-model="displayText" readonly :placeholder="placeholder" :clearable="clearable" @clear="handleClear">
          <template #suffix>
            <el-icon><ArrowDown /></el-icon>
          </template>
        </el-input>
      </div>
    </template>

    <div class="tss-panel">
      <el-cascader-panel
        v-model="selectedPath"
        :options="options"
        :props="cascaderProps"
        :border="false"
        @change="onChange"
      />
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElPopover, ElInput, ElIcon, ElCascaderPanel } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { mockSpaceTree, flatMockSpaces } from '../../_mock/space';
import { useRemoteData } from './use-remote-data';

interface Props {
  modelValue?: string[];
  multiple?: boolean;
  placeholder?: string;
  clearable?: boolean;
  width?: number;
  allowSelectAllLevels?: { building: boolean; floor: boolean; room: boolean };
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  multiple: true,
  placeholder: '请选择空间',
  clearable: true,
  width: 320,
  allowSelectAllLevels: () => ({ building: true, floor: true, room: true }),
});
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void; (e: 'change', v: any[]): void }>();

const visible = ref(false);
const selectedPath = ref<string[][]>([]);

const { dealwithLazyData } = useRemoteData();

const options = computed<any>(() => dealwithLazyData(mockSpaceTree, props.allowSelectAllLevels));

const cascaderProps = computed(() => ({
  multiple: props.multiple,
  checkStrictly: false,
  value: 'value',
  label: 'label',
  children: 'children',
  emitPath: true,
  lazy: false,
}));

/* v-model 同步 */
watch(
  () => props.modelValue,
  (v) => {
    // 把 id 反推回 path
    const map = new Map(flatMockSpaces().map((n) => [n.id, buildPath(n.id)]));
    selectedPath.value = v.map((id) => map.get(id) || [id]);
  },
  { immediate: true },
);

const buildPath = (leafId: string): string[] => {
  const all = flatMockSpaces();
  const leaf = all.find((n) => n.id === leafId);
  if (!leaf) return [leafId];
  const ids: string[] = [];
  let cur = leaf;
  while (cur) {
    ids.unshift(cur.id);
    cur = cur.parent ? all.find((n) => n.id === cur!.parent)! : (null as any);
  }
  return ids;
};

const onChange = (paths: any) => {
  const ids = paths.map((p: any) => p[p.length - 1]);
  emit('update:modelValue', ids);
  emit(
    'change',
    ids.map((id: any) => flatMockSpaces().find((n) => n.id === id)),
  );
  if (!props.multiple) visible.value = false;
};

const displayText = computed(() => {
  return props.modelValue
    .map((id) => flatMockSpaces().find((n) => n.id === id)?.name)
    .filter(Boolean)
    .join(', ');
});

const handleClear = () => {
  selectedPath.value = [];
  emit('update:modelValue', []);
  emit('change', []);
};

defineOptions({ name: 'TeSpaceSelect' });
</script>

<style lang="less" scoped>
.tss-trigger {
  width: 100%;

  :deep(.el-input__inner) {
    cursor: pointer;
  }
}
.tss-panel {
  max-height: 400px;
  overflow: auto;
}
</style>

<style lang="less">
.te-space-select-popper {
  padding: 0 !important;
  .el-cascader-panel {
    width: 100% !important;
  }
}
</style>
