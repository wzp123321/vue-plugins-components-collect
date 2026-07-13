<template>
  <div class="te-title-content">
    <!-- 搜索框 -->
    <div class="ttc-search">
      <el-input v-model="keyword" placeholder="搜索职务" clearable :prefix-icon="Search" />
    </div>

    <!-- 已选 chips -->
    <div v-if="selected.length > 0" class="ttc-chips">
      <el-tag v-for="item in selected" :key="item.id" size="small" class="ttc-chip" closable @close="removeOne(item)">
        <el-tooltip :content="item.name" :disabled="!isOverflow(item.name, chipMaxWidth)" placement="top">
          <span class="ttc-chip-text">{{ item.name }}</span>
        </el-tooltip>
      </el-tag>
      <el-button v-if="selected.length > 1" link size="small" type="primary" @click="clearAll">清空</el-button>
    </div>

    <!-- 树 -->
    <el-tree
      ref="treeRef"
      class="ttc-tree"
      :data="filteredTree"
      :props="treeProps"
      node-key="id"
      :show-checkbox="multiple"
      :check-strictly="false"
      :default-expand-all="false"
      :filter-node-method="filterNode"
      @check="onCheck"
      @node-click="onNodeClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import { ElInput, ElTree, ElTag, ElButton, ElTooltip } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { mockTitleCategories, mockTitles, type MockTitle } from '../../_mock/title';

interface Props {
  multiple?: boolean;
  /** 触发 onMounted 后的初始值 */
  modelValue?: string[];
  /** 树源数据, 不传用 mock */
  dataSource?: any[];
  /** 树节点 props 映射 */
  treeProps?: { label: string; children: string };
}
const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  modelValue: () => [],
  treeProps: () => ({ label: 'name', children: 'children' }),
});

const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void; (e: 'change', v: MockTitle[]): void }>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const keyword = ref('');
const selected = ref<MockTitle[]>([]);
const chipMaxWidth = ref(140);

/* 默认按 categoryId 分组, 形成二级树 */
const buildTree = (list: MockTitle[]) => {
  const groups: Record<string, { id: string; name: string; children: MockTitle[] }> = {};
  list.forEach((t) => {
    if (!groups[t.categoryId]) groups[t.categoryId] = { id: `cat-${t.categoryId}`, name: '未分组', children: [] };
    groups[t.categoryId].children.push(t);
  });
  // 补充分类名
  Object.values(groups).forEach((g) => {
    const cat = mockTitleCategories.find((c: any) => c.id === g.id.replace('cat-', ''));
    if (cat) g.name = cat.name;
  });
  return Object.values(groups);
};

const fullTree = computed(() => props.dataSource || buildTree(mockTitles));

const filteredTree = computed(() => fullTree.value);
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.name.includes(value);
};

watch(keyword, (val) => {
  treeRef.value?.filter(val);
});

watch(
  () => props.modelValue,
  async (v) => {
    await nextTick();
    if (v && v.length && treeRef.value) {
      treeRef.value.setCheckedKeys(v);
      const nodes: MockTitle[] = [];
      v.forEach((id) => {
        const node = findNodeById(fullTree.value, id);
        if (node && node.categoryId) nodes.push(node as MockTitle);
      });
      selected.value = nodes;
    } else {
      treeRef.value?.setCheckedKeys([]);
      selected.value = [];
    }
  },
  { immediate: true },
);

const findNodeById = (tree: any[], id: string): any => {
  for (const n of tree) {
    if (n.id === id) return n;
    if (n.children) {
      const r = findNodeById(n.children, id);
      if (r) return r;
    }
  }
  return null;
};

const onCheck = () => {
  const checked = treeRef.value?.getCheckedNodes() as MockTitle[];
  selected.value = checked || [];
  const ids = (checked || []).map((n) => n.id);
  emit('update:modelValue', ids);
  emit('change', checked || []);
};

const onNodeClick = (node: any) => {
  if (props.multiple) return;
  selected.value = [node];
  emit('update:modelValue', [node.id]);
  emit('change', [node]);
};

const removeOne = (item: MockTitle) => {
  treeRef.value?.setChecked(item.id, false, false);
  onCheck();
};

const clearAll = () => {
  treeRef.value?.setCheckedKeys([]);
  onCheck();
};

const isOverflow = (text: string, max: number) => {
  // 简单估算: 12px 一个汉字约 12px, 不到 max 就认为不溢出
  return text.length * 14 > max;
};

defineOptions({ name: 'TeTitleContent' });
</script>

<style lang="less" scoped>
.te-title-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  padding: 12px;

  .ttc-search {
    margin-bottom: 8px;
  }

  .ttc-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  .ttc-chip-text {
    display: inline-block;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }

  .ttc-tree {
    flex: 1;
    overflow: auto;
  }
}
</style>
