<template>
  <te-tree-select
    ref="treeRef"
    class="te-space-attribute"
    node-key="id"
    :data="treeData"
    :props="{ label: 'name', children: 'children' }"
    filterable
    check-strictly
    :multiple="multiple"
    :model-value="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    @node-click="handleNodeClick"
    @remove-tag="handleRemoveTag"
  >
    <template #default="{ node, data }">
      <div class="tsa-node">
        <te-checkbox
          v-if="multiple && node.level > 1"
          class="tsa-node-checkbox"
          :indeterminate="getIsHalfChecked(data)"
          :model-value="getIsChecked(data)"
          @click.prevent
        />
        <span> {{ node.label }} </span>
      </div>
    </template>
  </te-tree-select>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { TeTreeSelect, TeCheckbox } from '@tiansu/element-plus';
import { useSpaceAttribute, type TreeNode } from './use-space-attribute';
import { type AxiosInstance } from 'axios';

interface Props {
  modelValue?: string | string[];
  axios: AxiosInstance;
  tenantId: string;
  multiple?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const treeRef = ref<InstanceType<typeof TeTreeSelect>>();
const { treeData, getChildrenIds, getParentIds, getCheckedPIds, getIsChecked, getIsHalfChecked } =
  useSpaceAttribute(props);

// 节点点击
const handleNodeClick = (data: TreeNode) => {
  if (!props.multiple || data.disabled) {
    return;
  }

  let value = (props.modelValue || []) as string[];
  const curChecked = value.some((id) => id === data.id);
  if (curChecked) {
    handleUncheck(data);
  } else {
    const childrenIds = getChildrenIds(data, []);
    const extraPIds = getCheckedPIds(data, [...value, data.id!]);
    value = [...new Set([...value, ...extraPIds, ...childrenIds])];
    nextTick(() => emit('update:modelValue', value));
  }
};

// 多选模式下通过tag删除
const handleRemoveTag = (removeVal: string) => {
  const node = treeRef.value!.getNode(removeVal);
  handleUncheck(node.data as TreeNode);
};

// 取消选中：同时取消祖先及后代节点的选中
const handleUncheck = (data: TreeNode) => {
  const toUncheckIds = [...getParentIds(data), ...getChildrenIds(data, [])];
  const value = (props.modelValue as string[]).filter((id) => !toUncheckIds.includes(id));
  nextTick(() => emit('update:modelValue', value));
};
</script>

<style scoped lang="less">
.te-space-attribute {
  .tsa-node {
    display: flex;
    align-items: center;
  }
  .tsa-node-checkbox {
    height: auto;
    margin-right: var(--te-space-8);
  }
}
</style>
