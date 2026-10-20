<template>
  <div class="left-tree-item">
    <div v-if="!isEmpty(treeTitle)" class="ct-content-left-tree-title">
      {{ treeTitle }}
    </div>
    <div v-if="showSearch" class="ct-content-left-tree-search">
      <te-input
        ref="inputRef"
        v-model="filterText"
        v-bind="$attrs"
        :maxlength="50"
        placeholder="请输入关键字"
      >
        <template #prefix>
          <icon-search />
        </template>
      </te-input>
    </div>
    <!-- 列表 -->
    <te-scrollbar class="common-transfer-list">
      <te-tree
        v-if="!isTreeV2"
        ref="treeRef"
        :highlight-current="true"
        :expand-on-click-node="false"
        :filter-node-method="filterTreeNodeList"
        @check="(data, node) => emit('check', data, node)"
        @node-click="(data, node) => emit('node-click', data, node)"
        v-bind="$attrs"
      >
        <!-- 通过遍历实现插槽透传 -->
        <template v-for="k in Object.keys($slots)" #[k]="scope" :key="k">
          <slot :name="k" v-bind="scope"></slot>
        </template>
        <template #default="{ node, data }">
          <span
            class="custom-tree-node"
            :title="data[treeRef?.$props.props.label]"
            v-html="formatTreeLabel(data[treeRef?.$props.props.label])"
          >
          </span>
        </template>
        <template #empty>
          <span class="custom-tree-empty">暂无内容</span>
        </template>
      </te-tree>
      <te-tree-v2
        v-else
        ref="treeRef"
        :highlight-current="true"
        :expand-on-click-node="false"
        @check="(data, node) => emit('check', data, node)"
        @node-click="(data, node) => emit('node-click', data, node)"
        v-bind="$attrs"
        :filter-method="filterMethod"
        empty-text="暂无内容"
      >
        <template #default="{ node, data }">
          <span
            class="custom-tree-node"
            :title="data[treeRef?.$props.props.label]"
            v-html="formatTreeLabel(data[treeRef?.$props.props.label])"
          >
          </span>
        </template>
      </te-tree-v2>
    </te-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { isEmpty } from 'lodash';
import { ref, watch } from 'vue';
import { IconSearch } from '@arco-iconbox/vue-te';
import { TeInput, TeTree, TeScrollbar, TeTreeV2 } from '@tiansu/element-plus';
import type { TreeNode } from '@tiansu/element-plus/es/components/tree-v2/src/types';

const treeRef = ref();
const inputRef = ref();
const filterText = ref('');

defineOptions({
  name: 'TeImmediateTransferTreeItem',
});
const props = defineProps({
  treeTitle: {
    type: String,
    default: '',
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  isTreeV2: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['node-click', 'check']);

/**
 * 树节点查询筛选
 */
const filterTreeNodeList = (value: any, data: any) => {
  if (!value) return true;
  return data.hasOwnProperty(treeRef.value?.$props.props.label)
    ? data[treeRef.value?.$props.props.label].indexOf(value) !== -1
    : true;
};

/**
 * 根据过滤文本处理树节点文本
 * @param label
 */
const formatTreeLabel = (label: string) => {
  const keyTrimValue = filterText.value?.trim();
  return !keyTrimValue
    ? label
    : (label as any).replaceAll(keyTrimValue, `<em>${keyTrimValue}</em>`);
};

const filterMethod = (query: string, node: TreeNode) => {
  return node[treeRef.value.$props.props.label]?.includes(query);
};

/**
 * 监听查询输入
 */
watch(
  () => inputRef.value?.$props.modelValue,
  (val) => {
    treeRef.value?.filter(val?.trim());
  },
  {
    deep: true,
  },
);

defineExpose({
  treeRef,
});
</script>

<style lang="scss" scoped>
.left-tree-item {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1 1 0;
}
.ct-content-left-tree-title {
  padding: var(--te-space-8) var(--te-space-16) 0 var(--te-space-16);
  box-sizing: border-box;
  font-weight: 600;
  color: var(--te-text-color-primary);
  font-size: var(--te-font-size-b14);
}

.ct-content-left-tree-search {
  // height: 64px;
  flex: none;
  padding: var(--te-space-12) var(--te-space-16) 0 var(--te-space-16);
  box-sizing: border-box;
  .te-input__wrapper {
    box-shadow: 0 0 0 1px var(--te-input-border-color, var(--te-border-color)) !important;
  }
}

.common-transfer-list {
  flex: auto;
  height: 0;
  overflow-x: overlay;
  margin-top: var(--te-space-8);
  .te-tree {
    min-width: 100%;
    width: fit-content;
    :deep(.te-tree-node__content) {
      padding-right: var(--te-space-16);
    }
  }

  :deep(.custom-tree-node > em) {
    font-style: normal !important;
    color: var(--iot-color-active) !important;
  }

  .custom-tree-empty {
    color: var(--te-text-color-secondary);
    font-size: var(--te-font-size-b14);
    margin-top: 8px;
  }
}
</style>
