<template>
  <te-dialog v-model="modalVisible" width="800px" title="选择部门" destroy-on-close :close-on-click-modal="false">
    <div class="te-department">
      <div class="te-department-content">
        <div class="te-department-content-header">
          <span>待选</span>
          <te-dropdown v-if="multiple">
            <div class="te-department-content-header-dropdown">
              <span>{{ checkStrictly ? '任选' : '联选' }}</span>
              <icon-down />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <te-dropdown-item @click="handleStrictlyChange(true)">任选</el-dropdown-item>
                <te-dropdown-item @click="handleStrictlyChange(false)">联选</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="te-department-content-left">
          <te-search
            v-model="searchVal"
            class="te-department-content-left-input"
            clearable
            placeholder="搜索部门"
            @input="handleDeptSearch"
          />
          <check-relative-multiple-tree
            v-if="isRelativeTree"
            ref="checkRelativeTreeRef"
            v-model="selected"
            :max="multipleLimitMax"
            :queryDeptTree="queryDeptTree"
          />
          <check-strictly-tree
            v-else
            ref="checkStrictlyTreeRef"
            v-model="selected"
            :multiple="multiple"
            :max="multipleLimitMax"
            :queryDeptTree="queryDeptTree"
          />
        </div>
      </div>
      <div class="te-department-content-right">
        <div class="te-department-content-header">
          <div v-if="multiple">
            <span
              >已选（{{ selected.length
              }}<span class="te-employee-right-header-max"> /{{ multipleLimitMax }} </span>）</span
            >
          </div>
          <div v-else>已选</div>
          <te-button v-if="multiple" link type="primary" @click="selected = []" :disabled="!selected.length"
            >清空</te-button
          >
        </div>
        <div class="te-department-content-right-list">
          <div v-for="(item, index) in selected" :key="index" class="te-department-content-right-list-item">
            <div class="te-department-content-right-list-item-text">{{ item.name }}</div>
            <icon-close class="te-department-content-right-list-item-icon-delete" @click="handleDelete(index)" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div>
        <te-button @click="modalVisible = false">取消</el-button>
        <te-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="Tedepartment">
import { ref, computed, watch } from 'vue';
import { ElDialog, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import { TeSearch } from '../../te-search';
import { IconClose, IconDown } from '@arco-iconbox/vue-te/esm';
import { type AxiosInstance } from 'axios';

import getAllResultForPage from '../../te-employee/src/get-all-result-for-page';
import DepartmentV2OpenApi from '../../api/DepartmentV2OpenApi';
import DepartmentTreeQuery from '../../models/DepartmentTreeQuery';
import DepartmentQd from '../../models/DepartmentQd';
import DataPermissionCheck from '../../models/DataPermissionCheck';
import CheckStrictlyTree from './components/check-strictly-tree.vue';
import CheckRelativeMultipleTree from './components/check-relative-multiple-tree.vue';
interface Item {
  id: string;
  name?: string;
  [key: string]: any;
}
interface Props {
  visible: boolean;
  selected: Item[];
  axiosInstance: AxiosInstance;
  tenantId: string;
  organizationId?: string;
  multiple?: boolean;
  multipleLimit?: number;
  dataPermissionCheck?: DataPermissionCheck;
  defaultCheckStrictly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: () => [],
  multiple: false,
  defaultCheckStrictly: true,
  multipleLimit: 500,
});

const emit = defineEmits(['update:visible', 'update:selected']);

const multipleLimitMax = computed(() => (props.multipleLimit > 500 ? 500 : props.multipleLimit));
// 当前部门树是check-relative-multiple-tree (多选且联选时)
const isRelativeTree = computed(() => props.multiple && !checkStrictly.value);
// 获取部门树数据的方法，包含props传入的固定入参
const queryDeptTree = computed(() => {
  return (params: Partial<DepartmentTreeQuery>) =>
    DepartmentV2OpenApi.queryDepartmentForTree(props.axiosInstance, props.tenantId, {
      ...new DepartmentTreeQuery(),
      orgIdEq: props.organizationId,
      dataPermissionCheck: props.dataPermissionCheck,
      ...params,
    }).then((res) => res.data || []);
});

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

watch(
  () => props.visible,
  (val) => val && init()
);

// 单选或者任选时的treeRef（懒加载树）
const checkStrictlyTreeRef = ref<InstanceType<typeof CheckStrictlyTree>>();
// 多选且联选时的treeRef（全量树）
const checkRelativeTreeRef = ref<InstanceType<typeof CheckRelativeMultipleTree>>();
// true:任选、false:联选
const checkStrictly = ref(props.defaultCheckStrictly);
// 部门搜索值
const searchVal = ref<string>('');
// 已选
const selected = ref<Item[]>([]);

// 初始化
const init = () => {
  checkStrictly.value = props.defaultCheckStrictly;
  searchVal.value = '';
  selected.value = [];

  // 格式化selected
  if (props.selected.length > 0) {
    initSelected();
  }
};

const initSelected = () => {
  const PAGE_SIZE = 100;
  const params = new DepartmentQd();
  params.page = { pageNum: 1, pageSize: PAGE_SIZE };
  params.idIn = props.selected.map((ele) => ele.id);
  params.orgIdEq = props.organizationId;
  params.fetchParts = ['name'];

  getAllResultForPage(
    (tenantId: string, body: DepartmentQd) =>
      DepartmentV2OpenApi.queryDepartmentForPage(props.axiosInstance, tenantId, body),
    props.tenantId,
    params
  ).then((res) => {
    selected.value = params
      .idIn!.map((ele) => (res as Item[]).find((item) => item.id === ele))
      .filter((item) => !!item);
  });
};

// 任选/联选改变，清空搜索值、已选
const handleStrictlyChange = (value: boolean) => {
  if (checkStrictly.value === value) {
    return;
  }

  checkStrictly.value = !checkStrictly.value;
  searchVal.value = '';
  selected.value = [];
};

// 删除已选项
const handleDelete = (index: number) => {
  if (isRelativeTree.value) {
    checkRelativeTreeRef.value?.handleRightRemove(selected.value[index].id!);
  } else {
    selected.value.splice(index, 1);
  }
};

// 搜索
const handleDeptSearch = (val: string) => {
  if (isRelativeTree.value) {
    checkRelativeTreeRef.value?.handleSearch(val);
  } else {
    checkStrictlyTreeRef.value?.handleSearch(val);
  }
};

const handleConfirm = () => {
  emit('update:selected', selected.value);
  modalVisible.value = false;
};
</script>
<style lang="less">
.te-department {
  display: flex;
  height: 486px;

  &-tree-node {
    display: flex;
    align-items: center;
    gap: var(--te-space-8);
    overflow: hidden;

    &-text {
      flex: 1;
    }
  }

  &-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    overflow: auto;

    &-left {
      display: flex;
      flex-direction: column;
      height: calc(100% - 40px);
      box-sizing: border-box;
      padding: var(--te-space-20) var(--te-space-20) 0;
      border-right: 1px solid var(--te-border-color-lighter);

      &-input {
        margin-bottom: var(--te-space-12);
      }

      &-tree {
        flex: 1;
        overflow: auto;

        .te-radio {
          overflow: hidden;
          .te-radio__label {
            overflow: hidden;
          }
        }

        .te-checkbox {
          overflow: hidden;
          .te-checkbox__label {
            overflow: hidden;
            line-height: normal;
          }
        }
      }
    }
    &-header {
      height: 40px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--te-text-color-primary);
      padding: var(--te-space-4) var(--te-space-16);
      line-height: 22px;

      border-top: 1px solid var(--te-border-color-lighter);
      border-bottom: 1px solid var(--te-border-color-lighter);
      border-right: 1px solid var(--te-border-color-lighter);
      background: var(--te-fill-color-light);

      &-dropdown {
        display: flex;
        align-items: center;
        gap: var(--te-space-4);
        cursor: pointer;
      }

      &-max {
        color: var(--te-text-color-placeholder);

        font-size: var(--te-font-size-b12);
        line-height: 20px;
      }
    }

    &-right {
      width: 240px;
      height: 100%;

      &-list {
        padding-left: var(--te-space-8);
        gap: var(--te-space-8);
        flex: 1 0 0;
        margin-top: var(--te-space-20);
        height: calc(100% - 40px);
        overflow: auto;

        &-item {
          display: flex;
          padding: var(--te-space-8) var(--te-space-12);
          justify-content: space-between;
          align-items: center;
          gap: var(--te-space-8);
          cursor: pointer;

          &:hover {
            background: var(--te-fill-color);
          }

          &-text {
            word-break: break-all;
          }

          &-icon-delete {
            flex-shrink: 0;
          }
        }
      }
    }
  }
}
</style>
