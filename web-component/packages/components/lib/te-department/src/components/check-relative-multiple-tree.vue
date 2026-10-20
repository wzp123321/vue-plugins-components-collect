<template>
  <te-tree
    :key="treeKey"
    ref="treeRef"
    class="te-department-content-left-tree"
    node-key="id"
    check-strictly
    :data="fullTreeData"
    :props="{ label: 'name' }"
    :expand-on-click-node="false"
    :default-expanded-keys="defaultExpandKeys"
    :filterNodeMethod="(value, data) => data.name.includes(value)"
    @node-click="handleNodeClick"
    @node-expand="handleNodeExpand"
  >
    <template #default="{ node, data }">
      <loading-node
        v-if="data.id.includes('loading')"
        label="loading"
        @show="handleRenderMore(node.parent.data)"
      />
      <te-checkbox
        v-else
        :indeterminate="getIsHalfChecked(data)"
        :model-value="getIsChecked(data)"
        @click.prevent
      >
        <div class="te-department-tree-node">
          <icon-folder-opened v-if="node.expanded" />
          <icon-folder v-else />
          <overflow-tooltip :content="node.label">
            <div class="te-department-tree-node-text">{{ node.label }}</div>
          </overflow-tooltip>
        </div>
      </te-checkbox>
    </template>
  </te-tree>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { TeTree, TeCheckbox, TeMessage } from '@tiansu/element-plus';
import { IconFolder, IconFolderOpened } from '@arco-iconbox/vue-te/esm';
import OverflowTooltip from './overflow-tooltip.vue';
import LoadingNode from './loading-node.vue';
import DepartmentTreeQuery from '../../../models/DepartmentTreeQuery';
import DepartmentTreeNodeDTO from '../../../models/DepartmentTreeNodeDTO';

interface TreeNode extends DepartmentTreeNodeDTO {
  parent?: TreeNode;
  children: Nullable<TreeNode[]>;
  allChildren?: Nullable<TreeNode[]>;
}

interface Item {
  id: string;
}

interface Props {
  modelValue: Item[];
  max: number;
  queryDeptTree: (param: Partial<DepartmentTreeQuery>) => Promise<TreeNode[]>;
}

const props = defineProps<Props>();

const emit = defineEmits(['update:modelValue']);

onMounted(() => {
  props.queryDeptTree({ levels: 0 }).then((res) => {
    fullTreeData.value = res;
    traverse(fullTreeData.value);
  });
});

const treeKey = ref(0);
const treeRef = ref<InstanceType<typeof TeTree>>();
const fullTreeData = ref<TreeNode[]>([]);
// 第一层只有一个节点且有子节点时才默认展开
const defaultExpandKeys = computed(() =>
  fullTreeData.value.length === 1 && fullTreeData.value[0].hasChildren ? [fullTreeData.value[0].id!] : []
);

// 节点点击
const handleNodeClick = (data: TreeNode) => {
  let valueIds = (props.modelValue || []).map((item) => item.id!);
  const curChecked = valueIds.some((id) => id === data.id);

  if (curChecked) {
    handleUncheck(data);
  } else {
    if (valueIds.length >= props.max) {
      TeMessage.warning(`超过${props.max}个无法继续添加`);
      return;
    }

    const childrenIds = getChildrenIds(data, []);
    const shouldCheckedPIds = getShouldCheckedPIds(data, [...valueIds, data.id!]);
    valueIds = [...new Set([...valueIds, ...shouldCheckedPIds, ...childrenIds])];
    if (valueIds.length > props.max) {
      TeMessage.warning(`联选添加后数量会超出${props.max}个，无法选择当前部门`);
      return;
    }

    const value = findNodesByIds(valueIds, fullTreeData.value);
    nextTick(() => emit('update:modelValue', value));
  }
};

const pageInfoMap: Record<string, { list: TreeNode[]; pageNum: number }> = {};
const PAGE_SIZE = 100;
// 节点展开时判断子节点数量大于PAGE_SIZE时，进行分页
const handleNodeExpand = (data: TreeNode) => {
  if (data.children.length < PAGE_SIZE || pageInfoMap[data.id!]) {
    return;
  }
  pageInfoMap[data.id!] = { list: [...data.children], pageNum: 1 };
  data.children.splice(PAGE_SIZE, data.children.length - PAGE_SIZE);
  treeRef.value!.updateKeyChildren(data.id!, getChildren(data.id!));
};
const getChildren = (id: string) => {
  const { list, pageNum } = pageInfoMap[id];
  const res = list.slice(0, Math.min(pageNum * PAGE_SIZE, list.length));
  if (res.length < list.length) {
    res.push({
      ...new DepartmentTreeNodeDTO(),
      id: 'loading' + id,
      name: 'loading',
    });
  }
  return res;
};
// 渲染更多节点
const handleRenderMore = (parentData: TreeNode) => {
  const { id } = parentData;
  pageInfoMap[id!].pageNum++;
  treeRef.value!.updateKeyChildren(id, getChildren(id!));
};

// 右侧已选区域删除选中
const handleRightRemove = (removeId: string) => {
  const [node] = findNodesByIds([removeId], fullTreeData.value);
  node && handleUncheck(node);
};

// 取消选中：同时取消祖先及后代节点的选中
const handleUncheck = (data: TreeNode) => {
  const toUncheckIds = [...getParentIds(data), ...getChildrenIds(data, [])];
  const value = props.modelValue.filter((item) => !toUncheckIds.includes(item.id!));
  nextTick(() => emit('update:modelValue', value));
};

// 遍历树：添加parent属性和allChildren属性
const traverse = (data?: TreeNode[]) => {
  data?.forEach((item) => {
    item.children?.forEach((child) => (child.parent = item));
    item.allChildren = [...(item.children || [])];
    traverse(item.children);
  });
};

// 根据ids查找节点
const findNodesByIds = (ids: string[], data: TreeNode[]): TreeNode[] => {
  const result: TreeNode[] = [];
  
  for (const node of data) {
    if (ids.includes(node.id!)) {
      result.push(node);
    }
    if (node.allChildren) {
      const found = findNodesByIds(ids, node.allChildren);
      result.push(...found);
    }
  }
  
  return result;
};

// 获取后代节点id
const getChildrenIds = (data: TreeNode, ids: string[]) => {
  ids.push(data.id!);
  data.allChildren?.forEach((child) => getChildrenIds(child, ids));
  return ids;
};

// 获取祖先节点id
const getParentIds = (data: TreeNode) => {
  const ids: string[] = [];
  let parent = data.parent;
  while (parent) {
    ids.push(parent.id!);
    parent = parent.parent;
  }
  return ids;
};

// 节点选中，判断父节点的子节点是否全部选中，若全部选中，则继续向上判断。返回父节点ids
const getShouldCheckedPIds = (data: TreeNode, curValue: string[]) => {
  const res: string[] = [];
  const value = [...curValue];
  let parent = data.parent;
  while (
    parent &&
    value.length >= parent.allChildren!.length &&
    parent.allChildren!.every((child) => value.includes(child.id!))
  ) {
    res.push(parent.id!);
    value.push(parent.id!);
    parent = parent.parent;
  }
  return res;
};

// 是否选中
const getIsChecked = (data: TreeNode) => props.modelValue.some((item) => item.id === data.id);
// 是否半选
const getIsHalfChecked = (data: TreeNode) => !getIsChecked(data) && data.allChildren?.some((child) => getIsChecked(child));

// 搜索
const handleSearch = (val: string) => {
  if (val) {
    treeRef.value?.filter(val);
  } else {
    treeKey.value++;
  }
};

defineExpose({ handleSearch, handleRightRemove });
</script>
<style scoped></style>
