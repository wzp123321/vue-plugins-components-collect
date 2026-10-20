<template>
  <te-dialog v-model="modalVisible" width="840px" title="选择人员" destroy-on-close :close-on-click-modal="false">
    <div class="te-employee">
      <te-tabs type="border-card" v-model="activeTab" class="te-employee-select">
        <te-tab-pane
          v-for="item in tabs"
          :key="item"
          :label="tabNameMap[item]"
          :name="item"
          class="te-employee-select-wrapper"
        >
          <div class="te-employee-select-left">
            <te-search
              v-model="deptSearchVal"
              class="te-employee-select-left-input"
              clearable
              placeholder="搜索部门"
              @input="handleDeptSearch"
            />
            <te-tree
              ref="treeRefs"
              :default-expanded-keys="defaultExpandArr"
              :current-node-key="currentNodeKey"
              :data="deptTree"
              class="te-employee-select-left-tree"
              highlight-current
              node-key="id"
              :props="{ label: 'name',isLeaf: (data: DepartmentTreeNodeDTO) => !data.hasChildren }"
              :load="loadNode"
              lazy
              @node-click="handleDeptClick"
            >
              <template #default="{ node }">
                <loading-node 
                  v-if="node.data.id.includes('loading')"
                  :label="node.label"
                  @show="handleRenderMore(node.parent.data.id)"
                />
                <div v-else class="te-employee-tree-node">
                  <icon-folder-opened v-if="node.expanded" />
                  <icon-folder v-else />
                  <overflow-tooltip :content="node.label">
                    <div class="te-employee-tree-node-text">{{ node.label }}</div>
                  </overflow-tooltip>
                </div>
              </template>
            </te-tree>
          </div>

          <te-divider direction="vertical" class="te-employee-divider" />

          <div class="te-employee-select-right">
            <div class="te-employee-select-right-header">
              <te-search
                v-model="empSearchValue"
                class="te-employee-select-right-input"
                clearable
                placeholder="搜索人员"
                @input="handleSearchEmp"
              />
            </div>
            <div class="te-employee-select-right-list">
              <te-checkbox
                v-if="empList.length && multiple"
                :model-value="isCheckAll"
                :indeterminate="isIndeterminate"
                @change="handleCheckAllChange"
                >全选</te-checkbox
              >
              <te-empty v-if="!empList.length" :image-size="90" description="暂无数据" />
              <div v-for="(item, index) in empList" :key="index" class="te-employee-select-right-list-item">
                <te-checkbox
                  v-if="multiple"
                  :model-value="selected.findIndex((sel) => sel.id === item.id) > -1"
                  @click="handleLeftItemClick(item, $event)"
                >
                  {{ item.name }}
                </te-checkbox>
                <te-radio
                  v-else
                  :model-value="selected[0]?.id"
                  :label="item.id"
                  @click="handleLeftItemClick(item, $event)"
                >
                  {{ item.name }}
                </te-radio>
              </div>
            </div>
            <div v-if="empList.length > 0" class="te-employee-select-right-pagination">
              <te-pagination
                small
                layout="prev, pager, next"
                v-model:current-page="empPageNum"
                :pager-count="5"
                :page-size="PAGE_SIZE"
                :total="empTotal"
                @current-change="getThenSetEmpList"
              />
            </div>
          </div>
        </te-tab-pane>
      </te-tabs>
      <div class="te-employee-right">
        <div class="te-employee-right-header">
          <div v-if="multiple">
            <span
              >已选（{{ selected.length
              }}<span class="te-employee-right-header-max" v-if="multipleLimitMax !== Infinity">
                /{{ multipleLimitMax }} </span
              >）</span
            >
          </div>
          <div v-else>已选</div>
          <te-button v-if="multiple" link type="primary" @click="handleClear" :disabled="!selected.length"
            >清空</te-button
          >
        </div>
        <div class="te-employee-right-list">
          <div v-for="(item, index) in selected" :key="index" class="te-employee-right-list-item">
            <div class="te-employee-right-list-item-text">{{ item.name }}</div>
            <icon-close class="te-employee-right-list-item-icon-delete" @click="handleDelete(index)" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div>
        <te-button @click="modalVisible = false">取消</te-button>
        <te-button type="primary" @click="handleConfirm">确定</te-button>
      </div>
    </template>
  </te-dialog>
</template>

<script lang="ts" setup name="TeEmployee">
import { ref, computed, watch, nextTick } from 'vue';
import {
  TeDialog,
  TeTabs,
  TeTabPane,
  TeDivider,
  TeButton,
  TeCheckbox,
  TeTree,
  TeRadio,
  TeEmpty,
  TeMessage,
  TePagination,
} from '@tiansu/element-plus';
import type { CheckboxValueType } from '@tiansu/element-plus';
import { TeSearch } from '../../te-search';
import { IconClose, IconFolder, IconFolderOpened } from '@arco-iconbox/vue-te/esm';
import { type AxiosInstance } from 'axios';
import LoadingNode from '../../te-department/src/components/loading-node.vue';
import OverflowTooltip from '../../te-department/src/components/overflow-tooltip.vue';

import getAllResultForPage from './get-all-result-for-page';
import DepartmentV2OpenApi from '../../api/DepartmentV2OpenApi';
import EmployeeV2OpenApi from '../../api/EmployeeV2OpenApi';
import EmployeeQd from '../../models/EmployeeQd';
import DepartmentTreeQuery from '../../models/DepartmentTreeQuery';
import DepartmentTreeNodeDTO from '../../models/DepartmentTreeNodeDTO';
import { TreeNodeQueryStrategy } from '../../models/TreeNodeQueryStrategy';
import DataPermissionCheck from '../../models/DataPermissionCheck';

import type Node from '@tiansu/element-plus/es/components/tree/src/model/node';
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
}

const props = withDefaults(defineProps<Props>(), {
  // tabs: () => ['employee', 'department', 'position', 'job', 'label'], // 后续再允许自定义
  selected: () => [],
  multiple: false,
  multipleLimit: 500,
});

const emit = defineEmits(['update:visible', 'update:selected']);

interface Tabs {
  [index: number]: 'department';
}
const tabNameMap = {
  department: '部门',
};
const tabs: Tabs = ['department'];
const multipleLimitMax = computed(() => (props.multipleLimit > 500 ? 500 : props.multipleLimit));

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

watch(
  () => props.visible,
  (val) => val && init(tabs[0])
);

const treeRefs = ref<InstanceType<typeof TeTree>[]>([]);
// 当前选中tab
const activeTab = ref<string>(tabs[0]);
// 部门树
const deptTree = ref<DepartmentTreeNodeDTO[]>([]);
// 部门搜索值
const deptSearchVal = ref<string>('');
// 部门搜索请求id，防止前面耗时长的请求完成后覆盖后面耗时短已完成的搜索结果
const deptSearchReqId = ref(0);
// 人员搜索值
const empSearchValue = ref<string>('');
// 已选人员
const selected = ref<Item[]>([]);
// 左侧可选列表
const empList = ref<Item[]>([]);
// 当前选择的部门节点id
const currentNodeKey = ref<string>();
// 默认展开节点
const defaultExpandArr = ref<string[]>([]);
// 员工待选列表分页参数
const empPageNum = ref(1);
const empTotal = ref(0);
const PAGE_SIZE = 100;

// 全选状态
const isCheckAll = computed(() => {
  return empList.value.every((ele) => selected.value.some((item) => item.id === ele.id));
});

// 半选状态
const isIndeterminate = computed(() => {
  return !isCheckAll.value && empList.value.some((ele) => selected.value.some((item) => item.id === ele.id));
});

// 初始化
const init = (tab: string) => {
  deptTree.value = [];
  deptSearchVal.value = '';
  empSearchValue.value = '';
  selected.value = [];
  empList.value = [];
  currentNodeKey.value = '';
  defaultExpandArr.value = [];
  empPageNum.value = 1;
  empTotal.value = 0;

  if (props.selected.length > 0) {
    const params = {
      idIn: props.selected.map((ele) => ele.id),
      departmentIdQd: undefined,
    };
    getAllResultForPage(
      (tenantId, body) => EmployeeV2OpenApi.queryEmployeeForPage(props.axiosInstance, tenantId, body),
      props.tenantId,
      params
    ).then((res) => {
      selected.value = params.idIn.map((id) => (res as Item[]).find((item) => item.id === id)).filter((item) => !!item);
    });
  }
};

interface LoadDeptFn {
  (param?: Partial<DepartmentTreeQuery>): Promise<DepartmentTreeNodeDTO[]>;
}
// 获取部门子节点
const loadDeptChildren: LoadDeptFn = (param = {}) => {
  return new Promise((resolve) => {
    const params: DepartmentTreeQuery = {
      orgIdEq: props.organizationId,
      idEq: currentNodeKey.value || '',
      nameLike: deptSearchVal.value,
      levels: 1,
      dataPermissionCheck: props.dataPermissionCheck,
      ...param,
    };
    DepartmentV2OpenApi.queryDepartmentForTree(props.axiosInstance, props.tenantId, params).then((res) => {
      resolve(res.data || []);
    });
  });
};

// 节点分页信息
const pageInfoMap: Record<string, { list: DepartmentTreeNodeDTO[]; pageNum: number }> = {};
const TREE_PAGE_SIZE = 100;
// 获取子节点
const getChildren = (id: string) => {
  const { list, pageNum } = pageInfoMap[id];
  const res = list.slice(0, Math.min(pageNum * TREE_PAGE_SIZE, list.length));
  // 未渲染所有节点时手动push一个loading节点
  if (res.length < list.length) {
    res.push({ ...new DepartmentTreeNodeDTO(), id: 'loading' + id, name: 'loading', parentId: id });
  }
  return res;
};
// 渲染更多节点
const handleRenderMore = (pId: string) => {
  pageInfoMap[pId].pageNum++;
  treeRefs.value[0]?.updateKeyChildren(pId, getChildren(pId));
};

// 懒加载部门树加载节点
const loadNode = async (node: Node, resolve: (data: Item[]) => void) => {
  if (node.data.children?.length > 0) {
    resolve(node.data.children);
    return;
  }

  const isRootNode = node.level === 0; // 是否是加载根节点
  const res = await loadDeptChildren({ idEq: isRootNode ? '' : node.data.id });
  if(res.length > TREE_PAGE_SIZE){
    pageInfoMap[node.data.id] = { list: res, pageNum: 1 };
    resolve(getChildren(node.data.id!));
  } else {
    resolve(res);
  }

  if (isRootNode) {
    // 初始加载时根节点默认选
    nextTick(() => {
      defaultExpandArr.value = [res[0].id];
      currentNodeKey.value = res[0].id;
    });

    loadEmpOnly({ departmentIdQd: { idEq: res[0].id, queryStrategy: TreeNodeQueryStrategy.RECURSE } }).then(
      (records) => (empList.value = records)
    );
  }
};

// 点击部门节点
const handleDeptClick = (dept: Item) => {
  currentNodeKey.value = dept.id;
  empPageNum.value = 1;
  getThenSetEmpList();
};

interface LoadEmpOnly {
  (params?: Partial<EmployeeQd>): Promise<Item[]>;
}
const loadEmpOnly: LoadEmpOnly = async (param = {}) => {
  const params = { ...getParams(), ...param };
  return new Promise((resolve) => {
    EmployeeV2OpenApi.queryEmployeeForPage(props.axiosInstance, props.tenantId, params).then((res) => {
      empTotal.value = res.data.total;
      resolve(res.data.records);
    });
  });
};

// 获取员工查询入参
const getParams = () => {
  const params = new EmployeeQd();
  params.disabledEq = false;
  params.orgIdEq = props.organizationId;
  params.departmentIdQd = { idEq: currentNodeKey.value, queryStrategy: TreeNodeQueryStrategy.RECURSE };
  params.nameLike = empSearchValue.value;
  params.page = { pageNum: empPageNum.value, pageSize: PAGE_SIZE };
  params.fetchParts = [];
  return params;
};

const getThenSetEmpList = () => {
  loadEmpOnly().then((records) => (empList.value = records));
};

// 点击左侧待选项，选中/取消选中
const handleLeftItemClick = (item: Item, event: Event) => {
  event.preventDefault();
  const findIndex = selected.value.findIndex((ele) => ele.id === item.id);
  // 已经选中，取消选中
  if (findIndex > -1) {
    handleDelete(findIndex);
  } else {
    // 单选
    if (!props.multiple) {
      selected.value = [item];
    } else {
      // 多选且未超过最大限制数量
      if (selected.value.length < multipleLimitMax.value) {
        selected.value.push(item);
      } else {
        TeMessage.warning(`超过${multipleLimitMax.value}个无法继续添加`);
      }
    }
  }
};

// 全选、取消全选
const handleCheckAllChange = async (val: CheckboxValueType) => {
  if (val) {
    if (selected.value.length >= multipleLimitMax.value) {
      TeMessage.warning(`超过${multipleLimitMax.value}个无法继续添加`);
      return;
    }

    const notChecked = empList.value.filter((ele) => !selected.value.some((item) => item.id === ele.id));
    // 选中的数量不能超过限制，超出部分不选中
    if (notChecked.length + selected.value.length > multipleLimitMax.value) {
      notChecked.splice(-(notChecked.length - (multipleLimitMax.value - selected.value.length)));
    }
    selected.value = [...selected.value, ...notChecked];
  } else {
    selected.value = selected.value.filter((ele) => !empList.value.some((item) => item.id === ele.id));
  }
};

// 搜索员工
const handleSearchEmp = () => {
  empPageNum.value = 1;
  getThenSetEmpList();
};

// 删除已选项
const handleDelete = (index: number) => {
  selected.value.splice(index, 1);
};

// 清空已选项
const handleClear = () => {
  selected.value = [];
};

// 搜索部门
const handleDeptSearch = (val: string) => {
  deptSearchReqId.value++;
  const currentReqId = deptSearchReqId.value;
  // 搜索返回整个树 levels 传 0
  loadDeptChildren({ idEq: '', levels: !!val ? 0 : 1 }).then((res) => {
    if (currentReqId !== deptSearchReqId.value) {
      return;
    }

    currentNodeKey.value = ''
    defaultExpandArr.value = [];
    // nextTick中设置TreeData，否则会触发展开旧的defaultExpandKeys中的节点
    nextTick(() => {
      deptTree.value = res || [];
      if (deptTree.value.length) {
        handleDeptClick(deptTree.value[0]);
        if (val) {
          traverseExpand(deptTree.value);
        } else {
          defaultExpandArr.value = [deptTree.value[0].id];
        }
      }
    });
  });
};

// 遍历添加展开节点
const traverseExpand = (arr = []) => {
  arr.forEach((ele) => {
    if (ele.children?.length > 0) {
      defaultExpandArr.value.push(ele.id);
      traverseExpand(ele.children);
    } else {
      ele.hasChildren = false;
    }
  });
};

const handleConfirm = () => {
  emit('update:selected', selected.value);
  modalVisible.value = false;
};
</script>
<style scoped lang="less">
.te-employee {
  display: flex;

  :deep(.te-tree--highlight-current .te-tree-node.is-current > .te-tree-node__content) {
    color: var(--te-color-primary);
    background: var(--te-fill-color-light);
  }

  :deep(.te-tabs__content) {
    padding: var(--te-space-20);
  }

  &-tree-node {
    display: flex;
    align-items: center;
    gap: var(--te-space-8);
    overflow: hidden;

    &-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &-select {
    flex: 1;
    &-wrapper {
      display: flex;
      height: 486px;
    }
    &-left {
      width: 264px;
      display: flex;
      flex-direction: column;
      overflow: auto;

      &-tree {
        flex: 1;
        overflow: auto;

        :deep(.te-radio) {
          overflow: hidden;
          .te-radio__label {
            overflow: hidden;
          }
        }

        :deep(.te-checkbox) {
          overflow: hidden;
          .te-checkbox__label {
            overflow: hidden;
          }
        }
      }

      &-input {
        margin-bottom: var(--te-space-12);
      }

      &-search {
        flex: 1;
      }

      &-list {
        flex: 1;
        overflow: auto;
        &-item {
          display: flex;
          align-items: center;
          padding: var(--te-space-4) var(--te-space-8);
          cursor: pointer;

          &:hover {
            background: var(--te-fill-color);
          }

          &-flex1 {
            flex: 1;
          }
        }

        &-item:not(:last-child) {
          margin-bottom: var(--te-space-8);
        }
      }
    }

    &-right {
      width: 280px;
      display: flex;
      flex-direction: column;
      overflow: auto;
      &-list {
        margin-top: var(--te-space-12);
        overflow-x: hidden;
        overflow-y: auto;
        flex: 1;
        &-item {
          padding-left: var(--te-space-12);
          cursor: pointer;
          label {
            width: 100%;
            :deep(.te-checkbox__label),
            :deep(.te-radio__label) {
              width: 100%;
              overflow-x: clip;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          &:hover {
            background: var(--te-fill-color);
          }
        }
      }
      &-pagination {
        display: flex;
        justify-content: flex-end;
        margin-top: var(--te-space-8);
      }
    }
  }

  &-divider {
    height: auto;
    margin: 0 var(--te-space-12);
  }

  &-right {
    width: 240px;
    display: flex;
    flex-direction: column;
    overflow: auto;
    flex-shrink: 1;
    border: 1px solid var(--te-border-color);
    border-left: none;

    &-header {
      height: 40px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--te-text-color-primary);
      padding: var(--te-space-4) var(--te-space-16);
      line-height: 22px;
      border-bottom: 1px solid var(--te-border-color-lighter);
      background: var(--te-fill-color-light);

      &-max {
        color: var(--te-text-color-placeholder);

        font-size: var(--te-font-size-b12);
        line-height: 20px;
      }
    }

    &-list {
      padding-left: var(--te-space-8);
      gap: var(--te-space-8);
      flex: 1 0 0;
      margin-top: var(--te-space-20);
      overflow: auto;

      &-item {
        display: flex;
        // padding: var(--te-space-8) 0 var(--te-space-8) var(--te-space-12);
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
</style>
