<template>
  <div class="ca-search-bar">
    <te-form :inline="true" :model="searchForm">
      <te-form-item label="分析对象">
        <te-tree-select
          ref="treeSelectRef"
          :model-value="searchForm.treeIdList"
          placeholder="请选择分析对象"
          :node-key="node_key"
          :props="default_props"
          :data="treeList"
          :default-expanded-keys="expandedKeys"
          :render-after-expand="true"
          :fit-input-width="true"
          :show-arrow="false"
          :teleported="false"
          multiple
          clearable
          show-checkbox
          check-strictly
          check-on-click-node
          collapse-tags
          collapse-tags-tooltip
          @check-change="handleTreeCheckChange"
          @remove-tag="handleTagRemove"
          @clear="handleClear"
        ></te-tree-select>
      </te-form-item>
      <te-form-item label="日期">
        <te-date-picker
          :disabled-date="mapDateDisabled"
          v-model="searchForm.date"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          range-separator="~"
        >
        </te-date-picker>
      </te-form-item>
      <te-form-item>
        <te-button type="primary" @click="search">查询</te-button>
        <te-button @click="reset">重置</te-button>
      </te-form-item>
    </te-form>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive, nextTick } from 'vue';
import { postRequest } from '../../../services/request';
import costAnalysisService from '../cost-analysis.service';

import { CA_SB_ISearchForm, CA_SB_ITreeRes, CA_SB_ITreeVO, CA_SB_MAX_TREE_CHECKED } from './ca-search-bar.api';
import { CA_EPath } from '../cost-analysis.api';
import { Common_ETreeType, Common_IHttpRes } from '../../../services/api';

import { getCampusParams } from '../../../utils/token';
import { startOfMonth, startOfYear, subDays } from 'date-fns';
import { formatDate } from '../../../utils';
import message from '../../../utils/message';

const node_key = 'id';
const default_props = {
  label: 'treeName',
  children: 'childTree',
  disabled: 'lockFlag',
};
// 树元素
const treeSelectRef = ref();
// 树模型列表
const treeList = ref<CA_SB_ITreeVO[]>([]);
// 展开节点
const expandedKeys = ref<number[]>([]);
// 表单
const searchForm = reactive<CA_SB_ISearchForm>({
  treeIdList: [],
  date: [],
});
/**
 * 日期选择-禁用
 * @param current
 */
const mapDateDisabled = (current: Date) => {
  return new Date().getTime() < current.getTime();
};
/**
 * 查询树列表
 */
const queryTree = async () => {
  const convertTree = (list: CA_SB_ITreeVO[], keys: number[]) => {
    treeList.value = list ?? [];
    expandedKeys.value = keys ?? [];
  };
  try {
    const res: Common_IHttpRes<CA_SB_ITreeRes> = await postRequest(CA_EPath.根据能源类型查询树模型, {
      energyCode: '00000',
      expandLevel: 2,
      treeType: Common_ETreeType.区域树,
      ...getCampusParams(),
    });
    if (res?.success) {
      convertTree(res?.data?.data ?? [], res?.data?.expandTreeIds ?? []);
    } else {
      convertTree([], []);
    }
  } catch (error) {
    convertTree([], []);
  }
};
/**
 * 获取选中树节点
 */
const getCheckedKeys = () => {
  if (treeList.value?.length === 0) {
    expandedKeys.value = [];
    treeList.value = [];
    searchForm.treeIdList = [];
  } else {
    if (treeList.value?.length && treeList.value?.[0]?.childTree?.length === 1) {
      // 有三级
      if (treeList.value?.[0]?.childTree[0]?.childTree?.length > 0) {
        searchForm.treeIdList = treeList.value[0]?.childTree[0]?.childTree.map((item: CA_SB_ITreeVO) => {
          return item.id;
        });
        // 只有一个三级
        if (searchForm.treeIdList?.length === 1) {
          searchForm.treeIdList.push(treeList.value[0]?.childTree[0].id);
        }
      } else {
        searchForm.treeIdList = treeList.value[0]?.childTree.map((item: CA_SB_ITreeVO) => {
          return item.id;
        });
        // 只有一个二级
        if (searchForm.treeIdList?.length === 1) {
          searchForm.treeIdList.push(treeList.value[0].id);
        }
      }
    } else {
      searchForm.treeIdList = treeList.value[0]?.childTree.map((item: CA_SB_ITreeVO) => {
        return item.id;
      });

      // 没有二级
      if (searchForm.treeIdList?.length === 0) {
        if (!treeList.value[0]?.lockFlag) {
          searchForm.treeIdList.push(treeList.value[0].id);
        }
      }
    }
  }
  searchForm.treeIdList = searchForm.treeIdList.slice(0, CA_SB_MAX_TREE_CHECKED);
};
/**
 * 树节点选中事件
 */
const handleTreeCheckChange = (node: CA_SB_ITreeVO, checked: boolean, childChecked: boolean) => {
  // 如果超出数量，则进行提示
  if (searchForm.treeIdList?.length >= CA_SB_MAX_TREE_CHECKED) {
    message.error(`分析对象最多可选择${CA_SB_MAX_TREE_CHECKED}个`);
    searchForm.treeIdList = searchForm.treeIdList?.slice(0, CA_SB_MAX_TREE_CHECKED);
  } else {
    // 如果是选中---插入
    if (checked) {
      if (!searchForm.treeIdList?.includes(node?.id)) {
        searchForm.treeIdList.push(node?.id);
      }
    } else {
      // 单个删除
      handleTagRemove(node.id);
    }
  }
  // 处理选中状态
  nextTick(() => {
    if (treeSelectRef.value) {
      treeSelectRef.value?.setCheckedKeys(searchForm.treeIdList, false);
    }
  });
};
/**
 * 单个删除
 * @param value
 */
const handleTagRemove = (value: number) => {
  searchForm.treeIdList = searchForm.treeIdList?.filter((item) => {
    return item !== value;
  });
};
/**
 * 清空事件
 */
const handleClear = () => {
  searchForm.treeIdList = [];
};
/**
 * 查询
 */
const search = () => {
  if (!searchForm.date || searchForm.date?.length === 0) {
    message.error('请选择日期');
  }
  if (searchForm.treeIdList?.length === 0) {
    message.error('请选择分析对象');
  }
  costAnalysisService.query(searchForm);
};
/**
 * 重置方法
 */
const reset = () => {
  searchForm.date = [startOfMonth(new Date()), new Date()];
  // 根据树列表处理选中节点
  getCheckedKeys();
  search();
};
/**
 * 初始化
 * 查询区域树,处理能源异常跳转参数
 * TODO-----需要自测跳转
 */
onMounted(async () => {
  searchForm.date = [startOfMonth(new Date()), new Date()];
  searchForm.treeIdList = [];
  await queryTree();
  // 根据树列表处理选中节点
  getCheckedKeys();
  /**
   * 获取本地缓存
   */
  let params = window.sessionStorage.getItem('ems-energyAbnormalParams');
  if (params) {
    params = JSON.parse(JSON.stringify(params));
    if (params && Object.keys(params)?.length) {
      const { treeId, transferDate } = JSON.parse(params);
      searchForm.treeIdList = [treeId];
      searchForm.date[0] = new Date(formatDate(startOfYear(new Date()), 'yyyy-MM-dd'));
      if (transferDate) {
        searchForm.date[1] = new Date(formatDate(subDays(new Date(transferDate), 1), 'yyyy-MM-dd'));
      } else {
        searchForm.date[1] = new Date(formatDate(subDays(new Date(), 1), 'yyyy-MM-dd'));
      }
      window.sessionStorage.removeItem('ems-energyAbnormalParams');
    }
  }

  costAnalysisService.query(searchForm);
});
</script>
<style lang="less" scoped>
.ca-search-bar {
  border-bottom: 1px solid var(--te-border-color);

  :deep(.te-select) {
    width: 380px;

    .te-scrollbar__view.te-select-dropdown__list {
      width: fit-content;
      min-width: 100%;
    }
  }
}
</style>
