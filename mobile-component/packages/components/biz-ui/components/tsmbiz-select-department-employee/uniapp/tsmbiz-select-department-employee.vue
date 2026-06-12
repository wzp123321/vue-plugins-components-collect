/** * 选择部门/员工组件 * @description 用于选择部门或员工的弹窗组件 */
<template>
  <tsm-popup
    mode="bottom"
    :show="show"
    @update:show="emit('update:show', $event)"
    :closeable="true"
    :safeAreaInsetBottom="true"
    :closeOnClickOverlay="true"
    :title="'选择人员'"
    :round="20"
    custom-class="tsm-select-department-employee-popup"
  >
    <scroll-view :scroll-y="true" class="tsm-select-department-employee-scroll-view" @scrolltolower="handleRefresh">
      <!-- 搜索组件 -->
      <top-search
        :search-list="searchList"
        :loading="loading"
        v-model:selected="selected"
        v-model:search-value="searchValue"
        @search="handleSearch"
      />
      <!-- 类型选择 -->
      <view
        v-if="breadcrumb.length <= 1 && !searchValue"
        :class="dataList.length > 0 ? 'tsm-select-department-employee-type-container' : ''"
      >
        <list-cell v-for="item in organizationTypes" :key="item.type" :data="item" @click="item.onClick">
          <template #icon>
            <tsm-avatar v-if="item.type === ORGANIZATION_TYPE.SHARED" type="icon" property="organization" />
            <tsm-avatar v-if="item.type === ORGANIZATION_TYPE.LOCAL" type="icon" property="organization" />
          </template>
        </list-cell>
      </view>
      <!-- 列表 -->
      <view
        v-if="!searchValue"
        :class="
          selected.filter(i => !i.isDepartment).length > 0
            ? 'tsm-select-department-employee-list-selected'
            : 'tsm-select-department-employee-list'
        "
      >
        <tsm-breadcrumb v-if="breadcrumb.length > 1">
          <tsm-breadcrumb-item
            v-for="(item, index) in breadcrumb"
            :key="item.id"
            :label="item.path"
            :show-item-icon="false"
            @click="handleBreadcrumbClick(item, index)"
          />
        </tsm-breadcrumb>
        <text
          v-if="breadcrumb.length <= 1 && !searchValue && dataList.length > 0"
          class="tsm-select-department-employee-list-title"
          >近期选择</text
        >

        <view
          v-if="dataList.some(i => i.selectable && !i.isDepartment)"
          class="tsm-select-department-employee-select-all"
        >
          <tsm-checkbox type="primary" v-model:checked="selectAll" @change="handleSelectAllChange" />
          <text class="tsm-select-department-employee-select-all-text">全选</text>
        </view>

        <list-cell
          v-for="item in dataList"
          :key="item.id"
          :data="item"
          v-model:selected="selected"
          @click="handleItemClick(item)"
          @select="handleSelect"
        >
          <template #icon>
            <tsm-avatar v-if="item.isDepartment" type="icon" property="organization" />
            <tsm-avatar v-if="!item.isDepartment && !item.picture" type="icon" property="user" />
            <tsm-avatar v-if="!item.isDepartment && item.picture" type="picture" :src="item.picture" />
          </template>
        </list-cell>

        <tsm-loading v-if="loadingMore" />
      </view>
      <!-- 确认按钮 -->
      <confirm-bottom
        :selected="selected"
        :multiple-limit="multipleLimit"
        @confirm="handleConfirm"
        @count:click="handleCountClick"
      />
    </scroll-view>
    <view v-if="loading" class="tsm-select-department-employee-loading-container">
      <tsm-loading />
    </view>
  </tsm-popup>
  <!-- 选择的员工/部门弹窗 -->
  <employee-selected v-model:selected="selected" v-model:show="showSelected" @confirm="handleConfirm" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SelectDepartmentEmployeeProps } from './props';
import { defaultProps, ORGANIZATION_TYPE } from './props';
import ListCell from '../../../common/list-cell/list-cell.vue';
import type { dataProps } from '../../../common/list-cell/props';
import ShareOrganizationListQdDTO from '../../../models/ShareOrganizationListQdDTO';
import OrganizationV3OpenApi from '../../../api/OrganizationV3OpenApi';
import OrganizationListItemDTO from '../../../models/OrganizationListItemDTO';
import EmployeeComponentPageQd from '../../../models/EmployeeComponentPageQd';
import DepartmentComponentPageQd from '../../../models/DepartmentComponentPageQd';
import DepartmentComponentV3OpenApi from '../../../api/DepartmentComponentV3OpenApi';
import EmployeeComponentV3OpenApi from '../../../api/EmployeeComponentV3OpenApi';
import EmployeeComponentPageItemDTO from '../../../models/EmployeeComponentPageItemDTO';
import DepartmentComponentPageItemDTO from '../../../models/DepartmentComponentPageItemDTO';
import { TreeNodeQueryStrategyEnum } from '../../../models/TreeNodeQueryStrategyEnum';
import EmployeeComponentListQd from '../../../models/EmployeeComponentListQd';
import EmployeeComponentListItemDTO from '../../../models/EmployeeComponentListItemDTO';
import EmployeeSelected from './selected.vue';
import ConfirmBottom from './confirm.vue';
import TopSearch from './search.vue';
import { useProjectOrg } from '../../../common/use-project-org';
import PageParam from '../../../models/PageParam';

const props = withDefaults(defineProps<SelectDepartmentEmployeeProps>(), defaultProps);
const show = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
});
const showSelected = ref(false); // 是否显示选择的员工/部门弹窗
const selectAll = ref(false); // 是否全选
const selected = computed({
  get: () => props.selected,
  set: (val: Array<dataProps>) => emit('update:selected', val),
}); // 选择的员工/部门
const dataList = ref<Array<dataProps>>([]); // 列表数据
const searchList = ref<Array<dataProps>>([]); // 搜索列表
const searchValue = ref(''); // 搜索值
const breadcrumb = ref<Array<{ id: string; path: string; [key: string]: any }>>([
  { id: ORGANIZATION_TYPE.ALL, path: '全部' },
]); // 面包屑
const pageParam = ref<PageParam>({
  pageNum: 1,
  pageSize: 100,
}); // 分页参数
const searchPageParam = ref<PageParam>({
  pageNum: 1,
  pageSize: 100,
}); // 搜索分页参数
const loading = ref(false); // 加载中
const loadingMore = ref(false); // 加载更多
const hasMoreEmployee = ref(false); // 是否还有员工
const hasMoreDept = ref(false); // 是否还有部门
const hasMoreSearch = ref(false); // 是否还有搜索结果

const emit = defineEmits<{
  /** 确认选择 */
  (e: 'confirm', value: Array<dataProps>): void;
  /** 更新显示状态 */
  (e: 'update:show', value: boolean): void;
  /** 更新选择的员工/部门 */
  (e: 'update:selected', value: Array<dataProps>): void;
}>();

const { getOrgQd } = useProjectOrg(props); // 获取项目机构Qd
// 搜索
const handleSearch = async (val: string) => {
  if (!val) {
    searchList.value = [];
    return;
  }
  const params: EmployeeComponentPageQd = {
    ...new EmployeeComponentPageQd(),
    // page: pageParam,
    departmentIdQd: props.rootDeptId
      ? { idEq: props.rootDeptId, queryStrategy: TreeNodeQueryStrategyEnum.RECURSE }
      : undefined,
    orgQd: getOrgQd(),
    keyword: val,
    page: searchPageParam.value,
  }; // 搜索参数
  const { records } = await queryEmployeePage(params); // 查询员工
  searchList.value = records || [];
};

// 全选/取消全选
const handleSelectAllChange = async (val: boolean) => {
  const currentDepartment = breadcrumb.value[breadcrumb.value.length - 1];
  if (val) {
    const records = await queryEmployeeList({
      limit: props.multipleLimit + 1,
      orgQd: { orgIdEq: currentDepartment.orgId! },
      departmentIdQd: { idEq: currentDepartment.id!, queryStrategy: TreeNodeQueryStrategyEnum.RECURSE },
    }); // 查询员工
    selected.value = selected.value.concat(records);
  } else {
    selected.value = selected.value.filter(item => item.rootDepartmentId !== currentDepartment.id);
  }
};

// 查询共享机构
const queryShareOrg = async () => {
  const params = new ShareOrganizationListQdDTO();
  params.organizationIdEq = props.organizationId || '';
  loading.value = true;
  const res = await OrganizationV3OpenApi.queryShareOrganizationForList(props.http, props.tenantId, params).catch(
    () => {}
  );
  loading.value = false;
  const org = (res?.data || []).map((item: OrganizationListItemDTO) => ({
    ...item,
    id: item.id!,
    orgId: item.id!,
    parentId: '-',
    title: item.name!,
    subtitle: item.fullName!,
    hasChildren: true,
    hasNextLevel: true,
    selectable: false,
  }));
  dataList.value = org;
  breadcrumb.value = [
    { id: ORGANIZATION_TYPE.ALL, path: '全部' },
    { id: ORGANIZATION_TYPE.SHARED, path: '从共享机构选择' },
  ];
  return org;
};

// 查询本机构
const handleLocalOrg = async () => {
  const { records } = await queryDeptPage({ orgQd: { orgIdEq: '' }, parentIdEq: '-', page: pageParam.value }); // 查询部门
  dataList.value = records;
  breadcrumb.value = [
    { id: ORGANIZATION_TYPE.ALL, path: '全部' },
    { id: ORGANIZATION_TYPE.LOCAL, path: '从本机构选择' },
  ];
};

// 组织类型
const organizationTypes = [
  {
    id: 'CHOSEN_FROM_SHARED',
    path: '从共享机构选择',
    type: ORGANIZATION_TYPE.SHARED,
    title: '共享机构',
    hasNextLevel: true,
    onClick: queryShareOrg,
  },
  {
    id: 'CHOSEN_FROM_LOCAL',
    path: '从本机构选择',
    type: ORGANIZATION_TYPE.LOCAL,
    title: '本机构',
    hasNextLevel: true,
    onClick: handleLocalOrg,
  },
].filter(item => (props.shareOrg ? true : item.type !== ORGANIZATION_TYPE.SHARED));
// 查询部门
const queryDeptPage = async (param: Partial<DepartmentComponentPageQd> = {}) => {
  const params: DepartmentComponentPageQd = {
    ...new DepartmentComponentPageQd(),
    ...param,
  };
  loading.value = true;
  const res = await DepartmentComponentV3OpenApi.queryDepartmentForPage(props.http, props.tenantId, params).catch(
    () => {}
  );
  loading.value = false;
  const records: dataProps[] = (res?.data?.records || []).map((item: DepartmentComponentPageItemDTO) => {
    return {
      ...item,
      id: item.id!,
      orgId: params.orgQd?.orgIdEq,
      parentId: item.id!,
      title: item.name!,
      hasNextLevel: item.hasChildren || item.hasEmployee, // 有员工或者有子部门时可下钻
      selectable: true,
      isDepartment: true, // 表明该项数据是否是部门数据
    };
  });
  const total = res?.data?.total || 0;
  hasMoreDept.value = total === pageParam.value.pageSize;
  return { records, total };
};

// 查询部门下人员
const queryEmployeePage = async (param: Partial<EmployeeComponentPageQd> = {}) => {
  const params: EmployeeComponentPageQd = {
    ...new EmployeeComponentPageQd(),
    ...param,
  };
  loading.value = true;
  const res = await EmployeeComponentV3OpenApi.queryEmployeeForPage(props.http, props.tenantId, params).catch(() => {});
  loading.value = false;
  const records: dataProps[] = (res?.data?.records || []).map((item: EmployeeComponentPageItemDTO) => {
    return {
      ...item,
      id: item.id!,
      orgId: params.orgQd?.orgIdEq,
      title: item.name!,
      hasNextLevel: false,
      selectable: true,
    };
  });
  const total = res?.data?.total || 0;
  if (searchValue.value) {
    hasMoreSearch.value = total === searchPageParam.value.pageSize;
  } else {
    hasMoreEmployee.value = total === pageParam.value.pageSize;
  }
  return { records, total };
};

// 查询部门下人员
const queryEmployeeList = async (param: Partial<EmployeeComponentListQd> = {}) => {
  const params: EmployeeComponentListQd = {
    ...new EmployeeComponentListQd(),
    ...param,
  };
  loading.value = true;
  const res = await EmployeeComponentV3OpenApi.queryEmployeeForList(props.http, props.tenantId, params).catch(() => {});
  loading.value = false;
  const records: dataProps[] = (res?.data || []).map((item: EmployeeComponentListItemDTO) => {
    return {
      ...item,
      id: item.id!,
      rootDepartmentId: params.departmentIdQd?.idEq,
      title: item.name!,
      hasNextLevel: false,
      selectable: true,
    };
  });
  return records;
};

// 处理面包屑点击事件
const handleBreadcrumbClick = (item: { id: string; path: string; [key: string]: any }, index: number) => {
  breadcrumb.value = breadcrumb.value.slice(0, index + 1);
  pageParam.value.pageNum = 1;
  hasMoreEmployee.value = false;
  hasMoreDept.value = false;
  if (item.id === ORGANIZATION_TYPE.ALL) {
    // 如果点击的是全部
    dataList.value = [];
  } else if (item.id === ORGANIZATION_TYPE.LOCAL) {
    // 如果点击的是本机构
    handleLocalOrg();
  } else if (item.id === ORGANIZATION_TYPE.SHARED) {
    // 如果点击的是共享机构
    queryShareOrg();
  } else {
    handleItemClick(item, true);
  }
};
// 处理近期选择点击事件
const handleItemClick = async (item: dataProps, noUpdateBreadcrumb = false) => {
  dataList.value = [];
  if (item.hasEmployee) {
    // 如果有员工
    // 查询部门下人员
    const { records } = await queryEmployeePage({
      orgQd: { orgIdEq: item.orgId },
      departmentIdQd: { idEq: item.id, queryStrategy: TreeNodeQueryStrategyEnum.DIRECT },
      page: pageParam.value,
    });
    dataList.value.push(...records);
  }
  if (item.hasChildren) {
    // 如果有子部门
    // 查询子部门
    const { records, total } = await queryDeptPage({
      orgQd: { orgIdEq: item.orgId },
      parentIdEq: item.parentId,
      page: pageParam.value,
    });
    dataList.value.push(...records);
  }
  if ((item.hasChildren || item.hasEmployee) && !noUpdateBreadcrumb) {
    // 如果有子部门或者有员工
    // 更新面包屑
    breadcrumb.value.push({ ...item, path: item.title! });
  }
};

// 处理选择事件
const handleSelect = async (item: dataProps) => {
  if (!props.multiple) show.value = false;
  if (item.isDepartment) {
    // 如果选中的是部门
    if (selected.value.some(i => i.id === item.id && i.isDepartment)) {
      // 如果已选择该部门
      selected.value = selected.value.filter(
        // 取消选择该部门下的所有人员
        i => (i.id !== item.id && i.isDepartment) || (i.rootDepartmentId !== item.id && !i.isDepartment)
      );
    } else {
      // 如果未选择该部门
      let records: dataProps[] = [];
      if (item.hasEmployee || item.hasChildren) {
        records = await queryEmployeeList({
          limit: props.multipleLimit + 1,
          orgQd: { orgIdEq: item.orgId! },
          departmentIdQd: { idEq: item.id!, queryStrategy: TreeNodeQueryStrategyEnum.RECURSE },
        });
      }
      selected.value = selected.value.concat([item, ...records]);
    }
  } else {
    // 如果选中的是人员
    selected.value = selected.value?.some(i => i.id === item.id && !i.isDepartment)
      ? selected.value?.filter(i => i.id !== item.id && !i.isDepartment)
      : (selected.value || []).concat(item);
  }
};

// 处理已选择点击事件
const handleCountClick = () => {
  showSelected.value = true;
};

const handleConfirm = () => {
  show.value = false;
  emit('confirm', selected.value);
};

// 处理刷新事件
const handleRefresh = async () => {
  console.log('handleRefresh');

  if (loadingMore.value) return;
  if (searchValue.value) {
    if (!hasMoreSearch.value) return;
    loadingMore.value = true;
    const params: EmployeeComponentPageQd = {
      ...new EmployeeComponentPageQd(),
      // page: pageParam,
      departmentIdQd: props.rootDeptId
        ? { idEq: props.rootDeptId, queryStrategy: TreeNodeQueryStrategyEnum.RECURSE }
        : undefined,
      orgQd: getOrgQd(),
      keyword: searchValue.value,
      page: searchPageParam.value,
    };
    const { records } = await queryEmployeePage(params);
    searchList.value.push(...records);
    pageParam.value.pageNum++;
    const timer = setTimeout(() => {
      loadingMore.value = false;
      clearTimeout(timer);
    }, 800);
  } else {
    if (!hasMoreEmployee.value && !hasMoreDept.value) return;
    loadingMore.value = true;
    const item = breadcrumb.value[breadcrumb.value.length - 1];
    if (item.hasEmployee && hasMoreEmployee.value) {
      // 如果有员工
      // 查询部门下人员
      const { records } = await queryEmployeePage({
        orgQd: { orgIdEq: item.orgId },
        departmentIdQd: { idEq: item.id, queryStrategy: TreeNodeQueryStrategyEnum.DIRECT },
        page: pageParam.value,
      });
      dataList.value.push(...records);
    }
    if (item.hasChildren && hasMoreDept.value) {
      // 如果有子部门
      // 查询子部门
      const { records } = await queryDeptPage({
        orgQd: { orgIdEq: item.orgId },
        parentIdEq: item.parentId,
        page: pageParam.value,
      });
      dataList.value.push(...records);
    }
    pageParam.value.pageNum++;
    const timer = setTimeout(() => {
      loadingMore.value = false;
      clearTimeout(timer);
    }, 800);
  }
};
watch(
  () => searchValue.value,
  newVal => {
    if (!newVal) {
      searchPageParam.value.pageNum = 1;
      searchList.value = [];
    }
  }
);
</script>

<style scoped lang="scss">
.tsm-select-department-employee-popup :deep(.tsm-transition) {
  top: 0;
}

.tsm-select-department-employee-scroll-view {
  height: 100%;
}

.tsm-select-department-employee-select-all {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.tsm-select-department-employee-select-all-text {
  margin-left: 8px;
  color: var(--var-tsm-color-text-primary, rgba(24, 29, 39, 1));
  font-family: var(--var-tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--var-tsm-font-size-text-l, 16px);
  line-height: var(--var-tsm-line-height-text-l, 24px);
}

.tsm-select-department-employee-type-container {
  position: relative;

  ::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    display: block;
    height: 0.5px;
    background-color: var(--tsm-color-border-primary);
  }
}

.tsm-select-department-employee-list {
  margin: 16px 0 0 0;
  position: relative;
}

.tsm-select-department-employee-list-selected {
  margin: 16px 0 0 0;
  position: relative;
  padding-bottom: 68px;
}

.tsm-select-department-employee-list-title {
  display: block;
  padding: 4px 0;
  color: var(--tsm-color-text-secondary, rgba(113, 118, 128, 1));
  font-family: var(--tsm-font-family-regular, 'PingFang SC');
  font-weight: 400;
  font-size: var(--tsm-font-size-text-s, 12px);
  line-height: var(--tsm-line-height-text-s, 20px);
}
.tsm-select-department-employee-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background: var(--var-tsm-color-overlay-scrim, rgba(255, 255, 255, 0.6));
}
</style>
