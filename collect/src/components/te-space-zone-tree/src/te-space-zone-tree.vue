<template>
  <div class="te-space-zone-tree" :class="{ 'no-right': !showRightContent }">
    <div class="tszt-left" :style="{ width: leftWidth + 'px' }">
      <div class="tszt-header">
        <slot name="header">
          <h4>{{ typeCode || '分区' }}</h4>
        </slot>
      </div>
      <el-input v-model="searchValue" placeholder="搜索分区" clearable :prefix-icon="Search" class="tszt-search" />
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="{ label: 'name', isLeaf: (data: any) => !data.hasChildren }"
        node-key="id"
        :load="loadNode"
        lazy
        highlight-current
        :filter-node-method="filterNode"
        @node-click="onNodeClick"
      >
        <template #default="{ data }">
          <span class="tszt-node">{{ data.name }}</span>
        </template>
      </el-tree>
    </div>
    <div v-if="showRightContent" class="tszt-drag-handle" @mousedown="startDrag"></div>
    <div v-if="showRightContent" class="tszt-right">
      <slot name="right-content">
        <el-empty description="选中分区查看详情" :image-size="80" />
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { ElInput, ElTree, ElEmpty } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { mockZoneTree, loadZoneChildren } from '../../_mock/zone';
import type { MockZone } from '../../_mock/zone';

interface Props {
  typeCode?: string;
  showRightContent?: boolean;
  initialWidth?: number;
}
const props = withDefaults(defineProps<Props>(), {
  typeCode: '分区',
  showRightContent: true,
  initialWidth: 240,
});
const emit = defineEmits<{ (e: 'nodeClick', data: MockZone | { id: string; name: string }): void }>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const searchValue = ref('');
const treeData = ref<MockZone[]>([...mockZoneTree]);
const leftWidth = ref(props.initialWidth);
let dragging = false;
let startX = 0;
let startWidth = 0;

watch(searchValue, (val) => treeRef.value?.filter(val));

const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.name.includes(value);
};

const loadNode = (node: any, resolve: (data: MockZone[]) => void) => {
  if (node.level === 0) {
    resolve([...mockZoneTree]);
    return;
  }
  loadZoneChildren(node.data.id).then((list) => resolve(list));
};

const onNodeClick = (data: any) => {
  if (data.id === 'all') {
    emit('nodeClick', { id: '', name: '全部分区' });
  } else {
    emit('nodeClick', data);
  }
};

const startDrag = (e: MouseEvent) => {
  dragging = true;
  startX = e.clientX;
  startWidth = leftWidth.value;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (e: MouseEvent) => {
  if (!dragging) return;
  const next = startWidth + (e.clientX - startX);
  leftWidth.value = Math.max(160, Math.min(480, next));
};

const stopDrag = () => {
  dragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

onBeforeUnmount(stopDrag);

defineOptions({ name: 'TeSpaceZoneTree' });
</script>

<style lang="less" scoped>
.te-space-zone-tree {
  display: flex;
  height: 100%;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.tszt-left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-right: 1px solid #ebeef5;
  overflow: hidden;
}

.tszt-header {
  margin-bottom: 8px;
  h4 { margin: 0; font-size: 14px; }
}

.tszt-search { margin-bottom: 8px; }

.tszt-drag-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.2s;

  &:hover { background: #409eff; }
}

.tszt-right {
  flex: 1;
  padding: 12px;
  overflow: auto;
  min-width: 0;
}

.no-right { .tszt-left { border-right: none; } }

.tszt-node { font-size: 13px; }
</style>
