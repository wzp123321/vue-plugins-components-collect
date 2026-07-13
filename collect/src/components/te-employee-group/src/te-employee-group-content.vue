<template>
  <div class="te-employee-group-content">
    <div class="teg-search">
      <el-input v-model="keyword" placeholder="搜索员工组" clearable :prefix-icon="Search" />
    </div>

    <div v-if="selected.length > 0" class="teg-chips">
      <el-tag v-for="item in selected" :key="item.id" size="small" class="teg-chip" closable @close="removeOne(item)">
        <el-tooltip
          :content="`${item.name}（${item.memberCount} 人）`"
          :disabled="!isOverflow(item.name)"
          placement="top"
        >
          <span class="teg-chip-text">{{ item.name }} ({{ item.memberCount }})</span>
        </el-tooltip>
      </el-tag>
      <el-button v-if="selected.length > 1" link size="small" type="primary" @click="clearAll">清空</el-button>
    </div>

    <div class="teg-list">
      <el-checkbox-group v-model="selectedIds">
        <div v-for="g in filteredList" :key="g.id" class="teg-item" :class="{ checked: selectedIds.includes(g.id) }">
          <el-checkbox :label="g.id" :value="g.id" />
          <div class="teg-item-info">
            <div class="teg-item-name">
              <el-tooltip :content="g.description || g.name" :disabled="!isOverflow(g.name)" placement="top">
                <span>{{ g.name }}</span>
              </el-tooltip>
            </div>
            <div class="teg-item-meta">
              <el-tag v-for="m in g.memberIds.slice(0, 3)" :key="m" size="small" effect="plain" class="teg-member">
                {{ getMemberName(m) }}
              </el-tag>
              <span v-if="g.memberIds.length > 3" class="teg-member-more">+{{ g.memberIds.length - 3 }}</span>
            </div>
          </div>
        </div>
      </el-checkbox-group>
      <el-empty v-if="filteredList.length === 0" description="无匹配员工组" :image-size="60" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { ElInput, ElTag, ElButton, ElTooltip, ElCheckbox, ElCheckboxGroup, ElEmpty } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { mockEmployeeGroups, type MockEmployeeGroup } from '../../_mock/employee-group';
import { mockEmployees } from '../../_mock/employee';

interface Props {
  multiple?: boolean;
  modelValue?: string[];
  mode?: 'standard' | 'cloud';
  /** 仅显示包含某些成员的组 */
  filterMemberIds?: string[];
}
const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  modelValue: () => [],
  mode: 'standard',
  filterMemberIds: () => [],
});
const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void;
  (e: 'change', v: MockEmployeeGroup[]): void;
}>();

const keyword = ref('');
const selectedIds = ref<string[]>([...props.modelValue]);
const selected = ref<MockEmployeeGroup[]>([]);

const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  return mockEmployeeGroups.filter((g) => {
    const passKey = !k || g.name.toLowerCase().includes(k);
    const passFilter = props.filterMemberIds.length === 0 || g.memberIds.some((m) => props.filterMemberIds.includes(m));
    return passKey && passFilter;
  });
});

const getMemberName = (id: string) => mockEmployees.find((e) => e.id === id)?.name || id;

const isOverflow = (text: string) => text.length * 14 > 140;

watch(
  () => props.modelValue,
  (v) => {
    selectedIds.value = [...v];
    syncSelected();
  },
  { immediate: true },
);

watch(selectedIds, () => {
  syncSelected();
  if (!props.multiple && selectedIds.value.length > 1) selectedIds.value = [selectedIds.value[0]];
  emit('update:modelValue', selectedIds.value);
  emit('change', selected.value);
});

const syncSelected = () => {
  selected.value = mockEmployeeGroups.filter((g) => selectedIds.value.includes(g.id));
};

const removeOne = (item: MockEmployeeGroup) => {
  selectedIds.value = selectedIds.value.filter((id) => id !== item.id);
};

const clearAll = () => {
  selectedIds.value = [];
};

defineOptions({ name: 'TeEmployeeGroupContent' });
</script>

<style lang="less" scoped>
.te-employee-group-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  padding: 12px;

  .teg-search {
    margin-bottom: 8px;
  }

  .teg-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }
  .teg-chip-text {
    display: inline-block;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }

  .teg-list {
    flex: 1;
    overflow: auto;
  }

  .teg-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 6px;
    transition: all 0.15s;

    &.checked {
      background: #ecf5ff;
      border-color: #409eff;
    }
  }

  .teg-item-info {
    flex: 1;
    margin-left: 8px;
  }
  .teg-item-name {
    font-size: 13px;
    font-weight: 500;
  }
  .teg-item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }
  .teg-member-more {
    color: #909399;
    font-size: 12px;
    align-self: center;
  }
}
</style>
