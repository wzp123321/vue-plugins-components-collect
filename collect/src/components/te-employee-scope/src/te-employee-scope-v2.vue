<template>
  <div class="te-employee-scope">
    <el-input
      v-model="displayText"
      :placeholder="placeholder"
      readonly
      :clearable="clearable"
      @clear="handleClear"
      @click="dialogVisible = true"
    >
      <template #suffix>
        <el-icon><ArrowDown /></el-icon>
      </template>
    </el-input>

    <el-dialog v-model="dialogVisible" :title="title" width="640px" :close-on-click-modal="false" destroy-on-close>
      <el-tabs v-model="activeTab" class="tes-tabs">
        <el-tab-pane label="按员工" name="employee">
          <div class="tes-pane">
            <el-input v-model="empKeyword" placeholder="搜索员工" clearable :prefix-icon="Search" class="tes-search" />
            <div class="tes-list">
              <el-checkbox-group v-model="empIds" class="tes-group">
                <div
                  v-for="e in filteredEmployees"
                  :key="e.id"
                  class="tes-item"
                  :class="{ checked: empIds.includes(e.id) }"
                >
                  <el-checkbox :label="e.id" :value="e.id" />
                  <div class="tes-item-info">
                    <div class="tes-item-name">
                      {{ e.name }}
                      <span class="tes-item-account">@{{ e.account }}</span>
                    </div>
                    <div class="tes-item-meta">
                      <el-tag size="small" effect="plain">{{ getDeptName(e.departmentId) }}</el-tag>
                      <el-tag size="small" type="info" effect="plain">{{ e.phone }}</el-tag>
                    </div>
                  </div>
                </div>
              </el-checkbox-group>
              <el-empty v-if="filteredEmployees.length === 0" description="无匹配员工" :image-size="60" />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="按群组" name="group">
          <te-employee-group-content
            v-model="groupIds"
            :multiple="true"
            :filter-member-ids="empIds"
            @change="onGroupChange"
          />
        </el-tab-pane>
      </el-tabs>

      <div v-if="totalSelected > 0" class="tes-summary">
        <span>共选 {{ empIds.length }} 名员工 + {{ groupIds.length }} 个群组</span>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import {
  ElInput,
  ElDialog,
  ElIcon,
  ElTabs,
  ElTabPane,
  ElCheckbox,
  ElCheckboxGroup,
  ElEmpty,
  ElTag,
  ElButton,
} from 'element-plus';
import { ArrowDown, Search } from '@element-plus/icons-vue';
import { mockEmployees } from '../../_mock/employee';
import { mockEmployeeGroups } from '../../_mock/employee-group';
import { flatMockDepartments } from '../../_mock/department';
import TeEmployeeGroupContent from '../../te-employee-group/src/te-employee-group-content.vue';

export interface ScopeValue {
  employeeIds: string[];
  groupIds: string[];
}

const props = withDefaults(
  defineProps<{
    modelValue?: ScopeValue;
    placeholder?: string;
    clearable?: boolean;
    title?: string;
  }>(),
  {
    modelValue: () => ({ employeeIds: [], groupIds: [] }),
    placeholder: '请选择员工/群组',
    clearable: true,
    title: '选择员工范围',
  },
);

const emit = defineEmits<{ (e: 'update:modelValue', v: ScopeValue): void; (e: 'change', v: ScopeValue): void }>();

const dialogVisible = ref(false);
const activeTab = ref<'employee' | 'group'>('employee');
const empIds = ref<string[]>([]);
const groupIds = ref<string[]>([]);
const empKeyword = ref('');

const innerValue = ref<ScopeValue>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (v) => {
    innerValue.value = { ...v };
    empIds.value = [...v.employeeIds];
    groupIds.value = [...v.groupIds];
  },
);

const getDeptName = (id: string) => flatMockDepartments.find((d) => d.id === id)?.name || '';

const filteredEmployees = computed(() => {
  const k = empKeyword.value.trim().toLowerCase();
  if (!k) return mockEmployees;
  return mockEmployees.filter(
    (e) => e.name.toLowerCase().includes(k) || e.account.toLowerCase().includes(k) || e.phone.includes(k),
  );
});

const totalSelected = computed(() => empIds.value.length + groupIds.value.length);

const displayText = computed(() => {
  const empNames = innerValue.value.employeeIds
    .map((id) => mockEmployees.find((e) => e.id === id)?.name)
    .filter(Boolean);
  const grpNames = innerValue.value.groupIds
    .map((id) => mockEmployeeGroups.find((g) => g.id === id)?.name)
    .filter(Boolean);
  return [...empNames.map((n) => `员工: ${n}`), ...grpNames.map((n) => `群组: ${n}`)].join('；');
});

const onGroupChange = () => {
  // 群组变更无需额外处理
};

const confirm = () => {
  const v: ScopeValue = { employeeIds: [...empIds.value], groupIds: [...groupIds.value] };
  innerValue.value = v;
  emit('update:modelValue', v);
  emit('change', v);
  dialogVisible.value = false;
};

const handleClear = () => {
  innerValue.value = { employeeIds: [], groupIds: [] };
  empIds.value = [];
  groupIds.value = [];
  emit('update:modelValue', innerValue.value);
  emit('change', innerValue.value);
};

defineOptions({ name: 'TeEmployeeScopeV2' });
</script>

<style lang="less" scoped>
.te-employee-scope {
  width: 100%;
  :deep(.el-input__inner) {
    cursor: pointer;
  }
}

.tes-tabs {
  :deep(.el-tabs__content) {
    overflow: visible;
  }
}

.tes-pane {
  display: flex;
  flex-direction: column;
  height: 400px;
  padding-top: 4px;
}

.tes-search {
  margin-bottom: 8px;
}

.tes-list {
  flex: 1;
  overflow: auto;
}

.tes-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tes-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  transition: all 0.15s;

  &.checked {
    background: #ecf5ff;
    border-color: #409eff;
  }
}

.tes-item-info {
  flex: 1;
  margin-left: 8px;
}
.tes-item-name {
  font-size: 13px;
}
.tes-item-account {
  color: #909399;
  font-size: 12px;
}
.tes-item-meta {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.tes-summary {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409eff;
  font-size: 13px;
}
</style>
