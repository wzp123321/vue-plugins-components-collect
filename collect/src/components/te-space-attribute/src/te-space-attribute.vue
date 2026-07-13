<template>
  <el-tree
    ref="treeRef"
    :data="treeData"
    :props="{ label: 'name', children: 'children' }"
    node-key="id"
    show-checkbox
    check-strictly
    :default-checked-keys="modelValue"
    @check="onCheck"
  >
    <template #default="{ node, data }">
      <div class="tsa-node">
        <el-checkbox v-if="data.disabled" :model-value="false" disabled class="tsa-node-checkbox" />
        <el-checkbox
          v-else
          :model-value="getIsChecked(data)"
          :indeterminate="getIsHalfChecked(data)"
          @change="(val: any) => onManualCheck(data, val)"
          class="tsa-node-checkbox"
        />
        <span :class="{ 'tsa-disabled': data.disabled }">{{ node.label }}</span>
      </div>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElTree, ElCheckbox } from 'element-plus';
import { useSpaceAttribute, type SpaceAttrTreeNode } from './use-space-attribute';

interface Props {
  modelValue: string[];
  multiple?: boolean;
}
const props = withDefaults(defineProps<Props>(), { multiple: true });
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void; (e: 'change', v: string[]): void }>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);

const { treeData, getChildrenIds, getCheckedPIds, getUncheckedPIds, getIsChecked, getIsHalfChecked } =
  useSpaceAttribute({ modelValue: props.modelValue });

const onCheck = () => {
  // el-tree 的 check 事件: 在此场景我们用手动 checkbox 驱动, 这里仅作兜底
  const checked = treeRef.value?.getCheckedNodes(false) as SpaceAttrTreeNode[];
  if (checked) {
    const ids = checked.flatMap((n) => getChildrenIds(n, []));
    emit('update:modelValue', ids);
    emit('change', ids);
  }
};

const onManualCheck = (data: SpaceAttrTreeNode, val: any) => {
  const next = new Set(props.modelValue || []);
  const childIds = getChildrenIds(data, []);
  if (val) {
    childIds.forEach((id) => next.add(id));
    // 联选父
    getCheckedPIds(data, Array.from(next)).forEach((id) => next.add(id));
  } else {
    childIds.forEach((id) => next.delete(id));
    // 联取消父
    getUncheckedPIds(data, Array.from(next)).forEach((id) => next.delete(id));
  }
  const result = Array.from(next);
  emit('update:modelValue', result);
  emit('change', result);
};

defineOptions({ name: 'TeSpaceAttribute' });
</script>

<style lang="less" scoped>
.tsa-node {
  display: flex;
  align-items: center;
  width: 100%;
}
.tsa-node-checkbox {
  margin-right: 8px;
}
.tsa-disabled {
  color: #c0c4cc;
}
</style>
