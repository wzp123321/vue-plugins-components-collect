<template>
  <te-tree
    ref="treeRef"
    class="te-department-content-left-tree"
    node-key="id"
    :data="treeData"
    :props="{ label: 'name', isLeaf: (data) => !data.hasChildren }"
    :expand-on-click-node="false"
    :default-expanded-keys="defaultExpandKeys"
    lazy
    :load="loadNode"
    @node-click="handleNodeClick"
  >
    <template #default="{ node, data }">
      <loading-node
        v-if="data.id.includes('loading')"
        :label="node.label"
        @show="handleRenderMore(node.parent.data.id)"
      />
      <component
        v-else
        :is="multiple ? ElCheckbox : ElRadio"
        :="
          multiple
            ? { modelValue: modelValue.findIndex((ele) => ele.id === data.id) > -1 }
            : { modelValue: modelValue[0]?.id, label: data.id }
        "
        @click.prevent
      >
        <div class="te-department-tree-node">
          <icon-folder-opened v-if="node.expanded" />
          <icon-folder v-else />
          <overflow-tooltip :content="node.label">
            <div class="te-department-tree-node-text">{{ node.label }}</div>
          </overflow-tooltip>
        </div>
      </component>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { ElTree, ElCheckbox, ElRadio, ElMessage } from 'element-plus';
import type Node from 'element-plus/es/components/tree/src/model/node';
import { IconFolder, IconFolderOpened } from '@arco-iconbox/vue-te/esm';
import OverflowTooltip from './overflow-tooltip.vue';
import LoadingNode from './loading-node.vue';
import DepartmentTreeQuery from '../../../models/DepartmentTreeQuery';
import DepartmentTreeNodeDTO from '../../../models/DepartmentTreeNodeDTO';

interface Item {
  id: Nullable<string>;
}

interface Props {
  modelValue: Item[];
  multiple: boolean;
  max: number;
  queryDeptTree: (param: Partial<DepartmentTreeQuery>) => Promise<DepartmentTreeNodeDTO[]>;
}

const props = defineProps<Props>();

const emit = defineEmits(['update:modelValue']);

const treeData = ref<DepartmentTreeNodeDTO[]>([]);
// 部门搜索请求id，防止前面耗时长的请求完成后覆盖后面耗时短已完成的搜索结果
const deptSearchReqId = ref(0);
const defaultExpandKeys = ref<string[]>([]);

const treeRef = ref<InstanceType<typeof ElTree>>();
// 节点分页信息
const pageInfoMap: Record<string, { list: DepartmentTreeNodeDTO[]; pageNum: number }> = {};
const PAGE_SIZE = 100;
// 获取子节点
const getChildren = (id: string) => {
  const { list, pageNum } = pageInfoMap[id];
  const res = list.slice(0, Math.min(pageNum * PAGE_SIZE, list.length));
  // 未渲染所有节点时手动push一个loading节点
  if (res.length < list.length) {
    res.push({ ...new DepartmentTreeNodeDTO(), id: 'loading' + id, name: 'loading', parentId: id });
  }
  return res;
};
// 渲染更多节点
const handleRenderMore = (pId: string) => {
  pageInfoMap[pId].pageNum++;
  treeRef.value?.updateKeyChildren(pId, getChildren(pId));
};

const loadNode = async (node: Node, resolve: (data: Item[]) => void) => {
  if (node.data.children?.length > 0) {
    resolve(node.data.children);
    return;
  }

  const isLevel0 = node.level === 0; // 是否是加载第一层
  const res = await props.queryDeptTree({ levels: 1, idEq: isLevel0 ? '' : node.data.id });
  if(res.length > PAGE_SIZE){
    pageInfoMap[node.data.id] = { list: res, pageNum: 1 };
    resolve(getChildren(node.data.id!));
    return;
  }
  resolve(res);
  // 第一层只有一个节点且有子节点时才默认展开
  if (isLevel0 && res.length === 1 && res[0].hasChildren) {
    nextTick(() => (defaultExpandKeys.value = [res[0].id!]));
  }
};

// 节点点击
const handleNodeClick = (data: Item) => {
  const findIndex = props.modelValue.findIndex((item) => item.id === data.id);
  if (findIndex > -1) {
    props.modelValue.splice(findIndex, 1);
  } else {
    if (!props.multiple) {
      emit('update:modelValue', [data]);
    } else {
      if (props.modelValue.length >= props.max) {
        ElMessage.warning(`超过${props.max}个无法继续添加`);
        return;
      }
      props.modelValue.push(data);
    }
  }
};

// 搜索
const handleSearch = (val: string) => {
  deptSearchReqId.value++;
  const currentReqId = deptSearchReqId.value;
  // 搜索返回整个树 levels 传 0
  props.queryDeptTree({ levels: val ? 0 : 1, nameLike: val }).then((res) => {
    if (currentReqId !== deptSearchReqId.value) {
      return;
    }

    defaultExpandKeys.value = [];
    // nextTick中设置TreeData，否则会触发展开旧的defaultExpandKeys中的节点
    nextTick(() => {
      treeData.value = res;
      if (val) {
        traverseExpand(treeData.value);
      } else {
        treeData.value.length && (defaultExpandKeys.value = [treeData.value[0].id!]);
      }
    });
  });
};

// 遍历添加展开节点
const traverseExpand = (arr: DepartmentTreeNodeDTO[] = []) => {
  arr.forEach((ele) => {
    if (ele.children?.length) {
      defaultExpandKeys.value.push(ele.id!);
      traverseExpand(ele.children);
    } else {
      ele.hasChildren = false;
    }
  });
};

defineExpose({ handleSearch });
</script>
<style scoped></style>
