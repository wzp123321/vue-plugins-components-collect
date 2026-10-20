<template>
  <te-dialog v-model="modalVisible" width="840px" title="选择岗位" destroy-on-close :close-on-click-modal="false">
    <div class="te-job">
      <div class="te-job-select-warpper">
        <div class="te-job-content-header">待选</div>
        <div class="te-job-select">
          <div class="te-job-select-left">
            <te-search
              v-model="searchValue"
              placeholder="搜索岗位分组"
              clearable
              @input="loadJobGroupTree"
              class="te-job-select-left-input"
            />
            <te-tree
              :default-expanded-keys="defaultExpandKeys"
              :current-node-key="currentNodeKey"
              :data="jobGroupTree"
              class="te-job-select-left-tree"
              highlight-current
              node-key="id"
              :props="{ label: 'name' }"
              @node-click="handleJobGroupClick"
            >
              <template #default="{ node }">
                <div class="te-job-tree-node">
                  <icon-folder-opened v-if="node.expanded" />
                  <icon-folder v-else />
                  <te-tooltip
                    :visible="labelTooltipShowId === node.data.$treeNodeId"
                    placement="top-start"
                    :content="node.label"
                  >
                    <div
                      class="te-job-tree-node-text"
                      @mouseenter="handleCellMouseEnter($event, node.data.$treeNodeId)"
                      @mouseleave="handleCellMouseLeave"
                    >
                      {{ node.label }}
                    </div></te-tooltip
                  >
                </div>
              </template>
            </te-tree>
          </div>

          <te-divider direction="vertical" class="te-job-select-divider" />

          <div class="te-job-select-right">
            <te-search v-model="jobSearchVal" placeholder="搜索岗位" clearable @input="handleSearchJob" />
            <div class="te-job-select-right-list">
              <te-checkbox
                v-if="jobList?.length && multiple"
                :model-value="isCheckAll"
                :indeterminate="isIndeterminate"
                @change="handleCheckAllChange"
                >全选</te-checkbox
              >
              <te-empty v-if="!jobList.length" :image-size="90" description="暂无数据" />
              <div v-for="(item, index) in jobList" :key="index" class="te-job-select-right-list-item">
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
            <div v-if="jobList.length > 0" class="te-job-select-right-pagination">
              <te-pagination
                small
                layout="prev, pager, next"
                v-model:current-page="pageNum"
                :pager-count="5"
                :page-size="PAGE_SIZE"
                :total="total"
                @current-change="getThenSetJobList"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="te-job-selected">
        <div class="te-job-content-header">
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
        <div class="te-job-selected-list">
          <div v-for="(item, index) in selected" :key="index" class="te-job-selected-list-item">
            <div class="te-job-selected-list-item-text">{{ item.name }}</div>
            <icon-close class="te-job-selected-list-item-icon-delete" @click="handleDelete(index)" />
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

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue';
import {
  TeDialog,
  TeDivider,
  TeButton,
  TeCheckbox,
  TeTree,
  TeRadio,
  TeEmpty,
  TeTooltip,
  TeMessage,
  TePagination,
} from '@tiansu/element-plus';
import { IconClose, IconFolder, IconFolderOpened } from '@arco-iconbox/vue-te/esm';
import type { CheckboxValueType } from '@tiansu/element-plus/es/components/checkbox/src/checkbox';
import { type AxiosInstance } from 'axios';

import getAllResultForPage from '../../te-employee/src/get-all-result-for-page';
import { TeSearch } from '../../te-search';
import JobV2OpenApi from '../../api/JobV2OpenApi';
import JobDTO from '../../models/JobDTO';
import JobGroupTreeNodeDTO from '../../models/JobGroupTreeNodeDTO';
import JobQd from '../../models/JobQd';

interface Props {
  visible: boolean;
  selected: { id: string }[];
  axiosInstance: AxiosInstance;
  tenantId: string;
  organizationId?: string;
  multiple?: boolean;
  multipleLimit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  selected: () => [],
  organizationId: '',
  multiple: false,
  multipleLimit: 500,
});

const emit = defineEmits(['update:visible', 'update:selected']);

// 最大可选数量
const multipleLimitMax = computed(() => (props.multipleLimit > 500 ? 500 : props.multipleLimit));

const modalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const handleConfirm = () => {
  emit('update:selected', selected.value);
  modalVisible.value = false;
};

watch(
  () => props.visible,
  (val) => val && init()
);

// 岗位类别树
const jobGroupTree = ref<JobGroupTreeNodeDTO[]>([]);
// 待选岗位列表
const jobList = ref<JobDTO[]>([]);
// 岗位类别搜索值
const searchValue = ref<string>('');
// 岗位搜索值
const jobSearchVal = ref<string>('');
// 已选
const selected = ref<JobDTO[]>([]);
// 当前选择岗位类别节点id
const currentNodeKey = ref<string>();
// 默认展开节点
const defaultExpandKeys = ref<string[]>([]);
// 待选岗位列表分页参数
const pageNum = ref(1);
const total = ref(0);
const PAGE_SIZE = 100;

// 全选状态
const isCheckAll = computed(() => {
  return jobList.value.every((ele) => selected.value.some((item) => item.id === ele.id));
});

// 半选状态
const isIndeterminate = computed(() => {
  return !isCheckAll.value && jobList.value.some((ele) => selected.value.some((item) => item.id === ele.id));
});

// 初始化
const init = () => {
  selected.value = [];
  jobGroupTree.value = [];
  jobList.value = [];
  searchValue.value = '';
  jobSearchVal.value = '';
  currentNodeKey.value = '';
  defaultExpandKeys.value = [];
  pageNum.value = 1;
  total.value = 0;

  // 格式化selected
  if (props.selected.length > 0) {
    const params = {
      idIn: props.selected.map((ele) => ele.id),
      groupIdEq: '',
      fetchParts: ['name'],
      orgIdEq: props.organizationId,
    };

    getAllResultForPage(
      (tenantId, body) => JobV2OpenApi.queryJobForPage(props.axiosInstance, tenantId, body),
      props.tenantId,
      params
    ).then((res) => {
      selected.value = params.idIn
        .map((id) => (res as JobDTO[]).find((item) => item.id === id))
        .filter((item) => !!item);
    });
  }
  // 获取岗位类别树
  loadJobGroupTree();
};

// 获取岗位类别树（全量）
const loadJobGroupTree = () => {
  const params = {
    orgIdEq: props.organizationId,
    nameLike: searchValue.value,
  };
  JobV2OpenApi.queryJobGroupForTree(props.axiosInstance, props.tenantId, params).then((res) => {
    currentNodeKey.value = '';
    defaultExpandKeys.value = [];
    // nextTick中设置TreeData，否则会触发展开旧的defaultExpandKeys中的节点
    nextTick(() => {
      jobGroupTree.value = res.data || [];
      if (jobGroupTree.value.length) {
        handleJobGroupClick(jobGroupTree.value[0]);
        if (params.nameLike) {
          traverseExpand(jobGroupTree.value);
        } else {
          defaultExpandKeys.value = [jobGroupTree.value[0].id];
        }
      }
    });
  });

  // 遍历添加展开节点
  const traverseExpand = (arr = []) => {
    arr.forEach((ele) => {
      if (ele.children?.length > 0) {
        defaultExpandKeys.value.push(ele.id);
        traverseExpand(ele.children);
      }
    });
  };
};

// 点击岗位类别，加载对应岗位
const handleJobGroupClick = (JobGroup: JobDTO) => {
  currentNodeKey.value = JobGroup.id;
  pageNum.value = 1;
  getThenSetJobList();
};

// 加载岗位列表
interface LoadJobList {
  (param?: Partial<JobQd>): Promise<JobDTO[]>;
}
const loadJobList: LoadJobList = (param = {}) => {
  return new Promise((resolve) => {
    let params = new JobQd();
    params = {
      ...params,
      orgIdEq: props.organizationId,
      groupIdEq: currentNodeKey.value,
      keywordLike: jobSearchVal.value,
      page: {
        pageNum: pageNum.value,
        pageSize: PAGE_SIZE,
      },
      fetchParts: ['name'],
      ...param,
    };
    JobV2OpenApi.queryJobForPage(props.axiosInstance, props.tenantId, params).then((res) => {
      total.value = res.data.total || 0;
      resolve(res.data.records || []);
    });
  });
};

// 获取并设置岗位列表
const getThenSetJobList = () => {
  loadJobList().then((records) => (jobList.value = records));
};

// 岗位搜索
const handleSearchJob = () => {
  pageNum.value = 1;
  getThenSetJobList();
};

// 点击左侧待选项，选中/取消选中
const handleLeftItemClick = (item: JobDTO, event: Event) => {
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

    const notChecked = jobList.value.filter((ele) => !selected.value.some((item) => item.id === ele.id));
    // 选中的数量不能超过限制，超出部分不选中
    if (notChecked.length + selected.value.length > multipleLimitMax.value) {
      notChecked.splice(-(notChecked.length - (multipleLimitMax.value - selected.value.length)));
    }
    selected.value = [...selected.value, ...notChecked];
  } else {
    selected.value = selected.value.filter((ele) => !jobList.value.some((item) => item.id === ele.id));
  }
};

// 删除单个已选项
const handleDelete = (index: number) => {
  selected.value.splice(index, 1);
};

// 清空已选项
const handleClear = () => {
  selected.value = [];
};

// 当字符串被截断显示时，才展示tooltip
const labelTooltipShowId = ref('');
const handleCellMouseEnter = (e: MouseEvent, id: string) => {
  let el = e.target as HTMLElement;
  let state = el.scrollWidth > el.offsetWidth;
  if (state) {
    labelTooltipShowId.value = id;
  }
};
const handleCellMouseLeave = () => {
  labelTooltipShowId.value = '';
};
</script>
<style scoped lang="less">
.te-job {
  display: flex;
  height: 486px;
}

.te-job:deep(.te-tree--highlight-current .te-tree-node.is-current > .te-tree-node__content) {
  color: var(--te-color-primary);
  background: var(--te-fill-color-light);
}

.te-job:deep(.te-tabs__content) {
  padding: var(--te-space-20);
}

.te-job-tree-node {
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

.te-job-select-left {
  width: 264px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.te-job-select-left-tree {
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

.te-job-select-left-input {
  margin-bottom: var(--te-space-12);
}

.te-job-select-right {
  width: 280px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.te-job-select-right-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--te-space-8);
}

.te-job-select-right-list {
  margin-top: var(--te-space-12);
  overflow-x: hidden;
  overflow-y: auto;
  flex: 1;
}

.te-job-select-right-list-item {
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
}

.te-job-select-right-list-item:hover {
  background: var(--te-fill-color);
}

.te-job-content-header {
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
}

.te-job-content-header-max {
  color: var(--te-text-color-placeholder);
  font-size: var(--te-font-size-b12);
  line-height: 20px;
}

.te-job-select-warpper {
  flex: 1;
  height: 486px;
}

.te-job-select {
  display: flex;
  height: 100%;
  box-sizing: border-box;
  padding: var(--te-space-20);
  border-right: 1px solid var(--te-border-color-lighter);
}

.te-job-select-divider {
  height: auto;
  margin: 0 var(--te-space-12);
}

.te-job-selected {
  width: 240px;
}

.te-job-selected-list {
  height: calc(100% - 40px);
  padding-left: var(--te-space-8);
  margin-top: var(--te-space-20);
  overflow: auto;
}

.te-job-selected-list-item {
  display: flex;
  padding: var(--te-space-8) var(--te-space-12);
  justify-content: space-between;
  align-items: center;
  gap: var(--te-space-8);
  cursor: pointer;
}

.te-job-selected-list-item:hover {
  background: var(--te-fill-color);
}

.te-job-selected-list-item-text {
  word-break: break-all;
}

.te-job-selected-list-item-icon-delete {
  flex-shrink: 0;
}
</style>
