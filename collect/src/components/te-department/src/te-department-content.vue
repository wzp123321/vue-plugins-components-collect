<template>
  <div class="te-department-content">
    <div class="tdc-search">
      <el-input v-model="keyword" placeholder="搜索部门" clearable :prefix-icon="Search" />
    </div>

    <div v-if="selected.length > 0" class="tdc-chips">
      <el-tag v-for="item in selected" :key="item.id" size="small" class="tdc-chip" closable @close="removeOne(item)">
        <el-tooltip :content="item.name" :disabled="!isOverflow(item.name)" placement="top">
          <span class="tdc-chip-text">{{ item.name }}</span>
        </el-tooltip>
      </el-tag>
      <el-button v-if="selected.length > 1" link size="small" type="primary" @click="clearAll">清空</el-button>
    </div>

    <el-tree
      ref="treeRef"
      class="tdc-tree"
      :data="tree"
      :props="defaultProps"
      node-key="id"
      :show-checkbox="multiple"
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
import { mockDepartments, type MockDeptNode } from '../../_mock/department';
import { buildTree } from '../../_mock/utils';

interface Props {
  multiple?: boolean;
  modelValue?: string[];
  /** 业务模式: standard 本地数据, cloud 模拟云端数据(实际仍用 mock) */
  mode?: 'standard' | 'cloud';
  /** 是否包含禁用节点 */
  showDisabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  modelValue: () => [],
  mode: 'standard',
  showDisabled: false,
});
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void; (e: 'change', v: MockDeptNode[]): void }>();

const treeRef = ref<InstanceType<typeof ElTree> | null>(null);
const keyword = ref('');
const selected = ref<MockDeptNode[]>([]);

const defaultProps = { label: 'name', children: 'children' };

const tree = computed(() => {
  const filtered = props.showDisabled ? mockDepartments : mockDepartments.filter((d) => !d.disabled);
  return buildTree(filtered as any);
});

const filterNode = (value: string, data: any) => {
  if (!value) return true;
  return data.name.includes(value);
};

watch(keyword, (val) => treeRef.value?.filter(val));

watch(
  () => props.modelValue,
  async (v) => {
    await nextTick();
    if (v && v.length) {
      treeRef.value?.setCheckedKeys(v, false);
      const all = (function flat(list: any[]): any[] {
        return list.reduce((a, n) => a.concat(n, flat(n.children || [])), []);
      })(tree.value);
      selected.value = all.filter((n) => v.includes(n.id));
    } else {
      treeRef.value?.setCheckedKeys([], false);
      selected.value = [];
    }
  },
  { immediate: true },
);

const onCheck = () => {
  const checked = (treeRef.value?.getCheckedNodes() || []) as MockDeptNode[];
  const halfChecked = (treeRef.value?.getHalfCheckedNodes() || []) as MockDeptNode[];
  // 包含半选中的父级, 让联选完整
  selected.value = checked.concat(halfChecked);
  emit(
    'update:modelValue',
    selected.value.map((n) => n.id),
  );
  emit('change', selected.value);
};

const onNodeClick = (node: any) => {
  if (props.multiple) return;
  selected.value = [node];
  emit('update:modelValue', [node.id]);
  emit('change', [node]);
};

const removeOne = (item: MockDeptNode) => {
  treeRef.value?.setChecked(item.id, false, false);
  onCheck();
};

const clearAll = () => {
  treeRef.value?.setCheckedKeys([], false);
  onCheck();
};

const isOverflow = (text: string) => text.length * 14 > 140;

defineOptions({ name: 'TeDepartmentContent' });
</script>

<style lang="less" scoped>
.te-department-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  padding: 12px;

  .tdc-search {
    margin-bottom: 8px;
  }

  .tdc-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  .tdc-chip-text {
    display: inline-block;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }

  .tdc-tree {
    flex: 1;
    overflow: auto;
  }
}
</style>
