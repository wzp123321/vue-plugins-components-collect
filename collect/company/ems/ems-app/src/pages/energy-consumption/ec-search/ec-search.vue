<!--
 * @Author: yut
 * @Date: 2023-11-06 17:15:43
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-12 15:04:33
 * @Descripttion: 
-->
<template>
  <uni-popup ref="popupRef" type="bottom">
    <view class="ec-search">
      <view class="es-header">
        <text>选择区域</text>
        <icon-close class="es-close" @click="closePopup" />
      </view>
      <view class="es-body">
        <!-- 搜索框 -->
        <uni-search-bar
          v-filterEmoji
          ref="searchBarRef"
          class="es-body-search"
          maxlength="20"
          placeholder="搜索"
          :adjust-position="false"
          v-model="searchLabel"
          @cancel="handleSearchCancel"
          @confirm="triggerSearch($event)"
          @focus="handleFocus"
        >
        </uni-search-bar>
        <!-- 搜索历史 -->
        <es-search-history v-if="focusFlag" :list="historyList" @triggerSearch="triggerSearch"></es-search-history>
        <!-- 搜索面包屑 -->
        <es-select-crumbs
          v-if="!searchFlag && !focusFlag && treeList.length !== 0"
          :list="searchBreadCrumbList"
          @select="handleCrumbSelect"
        ></es-select-crumbs>
        <!-- 树列表 -->
        <es-tree-list
          v-if="treeList.length"
          v-model="selectedId"
          :searchFlag="searchFlag"
          :treeList="treeList"
          :searchLabel="searchLabel"
          @drill="handleTreeDrill"
          @select="handleTreeSelect"
        ></es-tree-list>
        <!-- 搜索为空 -->
        <common-search-empty
          v-if="!loading && !focusFlag && !treeList.length"
          :title="!searchLabel ? '区域树模型未绑定此能源类型的设备点位' : '搜索结果为空'"
          :subTitle="!searchLabel ? '' : '换个关键词试试吧'"
        ></common-search-empty>
      </view>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import { useCommonTree } from '@/hook';
import { computed, ref } from 'vue';
//组件
import EsTreeList from '../../energy-analysis/ea-search/es-tree-list/es-tree-list.vue';
import EsSearchHistory from '../../energy-analysis/ea-search/es-search-history/es-search-history.vue';
import EsSelectCrumbs from '../../energy-analysis/ea-search/es-select-crumbs/es-select-crumbs.vue';
import { IconClose } from '@arco-iconbox/vue-tem';
//工具
import { handlePageTo, mapSystemInfo } from '@/utils';
import type { Es_IBreadcrumb, Es_IQueryChildTreeParams } from '@/pages/energy-analysis/ea-search/ea-search.api';
import { Common_EMenuId, Common_EPath, Common_ETreeType } from '@/config/enum';
import { FGetStorageData } from '@/utils/storage';
import { SESSION_KEY_USER_ID } from '@/config/session-key';
import { COMMON_DEFAULT_BREADCRUMB } from '@/config/config';
import { cloneDeep } from 'lodash';
import type { Ec_ITopPanelForm } from '../energy-consumption.api';

const {
  treeList,
  searchLabel,
  searchBreadCrumbList,
  historyList,
  loading,
  queryHistoryList,
  handleSearchBreadSelect,
  queryTreeList,
  getTreeNames,
} = useCommonTree();

// 搜索栏实例
const searchBarRef = ref();
// 是否正在搜索
const searchFlag = ref<boolean>(false);
// 输入框是否聚焦
const focusFlag = ref<boolean>(false);

//能源类型
const energyCode = ref('');
/**
 * 清除数据
 */
const clearData = () => {
  searchLabel.value = '';
  searchFlag.value = false;
  focusFlag.value = false;
};
/**
 * 拼接查询树节点参数
 * @param { number | null} treeId
 * @returns {Es_IQueryChildTreeParams}
 */
const mapQueryTreeParams = (treeId: number | null): Es_IQueryChildTreeParams => {
  return {
    menuId: Common_EMenuId.能耗纵览,
    userId: FGetStorageData(SESSION_KEY_USER_ID) ? Number(FGetStorageData(SESSION_KEY_USER_ID)) : null,
    treeType: Common_ETreeType.区域,
    energyCode: energyCode.value,
    keyword: searchLabel.value,
    treeId: treeId === null ? 0 : treeId,
  };
};

/**
 * 输入框聚焦
 * @returns {void}
 */
const handleFocus = (): void => {
  focusFlag.value = true;
  queryHistoryList(Common_EMenuId.能耗纵览, energyCode.value, Common_ETreeType.区域);
};
/**
 * 触发查询
 * @param {string} event
 * @returns {void}
 */
const triggerSearch = (event: { value: string }): void => {
  searchLabel.value = event.value;
  searchFlag.value = true;
  focusFlag.value = false;
  selectedId.value = null;
  treeList.value = [];
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
  handleTreeQuery(null);
};
/**
 * 取消搜索
 * @returns {void}
 */
const handleSearchCancel = (): void => {
  selectedId.value = null;
  clearData();
  handleTreeQuery(null);
};
/**
 * 点击面包屑
 * @param {Es_IBreadcrumb} value
 * @returns {void}
 */
const handleCrumbSelect = (value: Es_IBreadcrumb): void => {
  handleSearchBreadSelect(value?.id, value?.treeName);
  handleTreeQuery(value.id);
};

/**
 * 查询下级节点
 * @param {number} id
 * @param {string} treeName
 */
const handleTreeDrill = (id: number, treeName: string) => {
  handleSearchBreadSelect(id, treeName);
  handleTreeQuery(id);
};
/**
 * 查询
 * @param id
 */
const handleTreeQuery = (id: number | null) => {
  queryTreeList<Es_IQueryChildTreeParams>(mapQueryTreeParams(id), Common_EPath.根据树节点ID查询子节点列表);
};
// 当前节点
const selectedId = ref<number | null>(null);

const emit = defineEmits(['select']);

/**
 * 选择树节点
 * @param {number} id
 * @param {string} treeName
 * @param {string} treeName
 * @returns {void}
 */
const handleTreeSelect = (id: number, treeName: string, treeNames: string): void => {
  handlePageTo('/pages/energy-consumption/energy-consumption', {
    treeId: encodeURIComponent(id),
    treeName: encodeURIComponent(treeName),
    energyCode: encodeURIComponent(energyCode.value),
    topLevel: encodeURIComponent(searchBreadCrumbList.value.length === 1),
  });
  popupRef.value?.close();
};

const popupRef = ref();
/**
 * 关闭弹窗
 */
const closePopup = () => {
  popupRef.value?.close();
};

/**
 * 打开弹窗
 */
const openPopup = async (form: Ec_ITopPanelForm) => {
  clearData();
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
  energyCode.value = form.energyCode;
  selectedId.value = Number(form.treeId);
  popupRef.value?.open();
  uni.showLoading({ title: '加载中...' });
  try {
    await handleTreeQuery(null);
  } catch (error) {
    console.log('%c✨✨打开区域节点弹框Error✨✨', 'font-size: 24px', error);
  } finally {
    console.log('---------------', searchBreadCrumbList.value);
    uni.hideLoading();
  }
};
defineExpose({
  openPopup,
});

const popupHeight = computed(() => {
  return `${mapSystemInfo().screenHeight - uni.upx2px(240)}px`;
});
</script>

<style lang="scss" scoped>
.ec-search {
  width: 100%;
  height: v-bind(popupHeight);
  flex-direction: column;
  display: flex;
  background-color: var(--tem-bg-color);
  border-radius: 24rpx 24rpx 0rpx 0rpx;

  //头部
  .es-header {
    height: 116rpx;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin: 0 32rpx;
    flex: none;

    uni-text {
      padding: 32rpx 0;
      height: 52rpx;
      font-weight: 600;
      font-size: var(--tem-font-size-h18);
      display: inline-flex;
      align-items: center;
    }
    .es-close {
      height: 48rpx;
      width: 48rpx;
      position: absolute;
      right: 0;
    }
  }
  .es-body {
    width: 100%;
    flex: auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    &-search {
      display: flex;
      align-items: center;
      height: 72rpx;
      gap: 20rpx;
      margin: 8rpx 0;
      padding: 0 32rpx;

      :deep(.uni-easyinput) {
        flex: auto;

        .uni-easyinput__content {
          border-radius: 8rpx;
          background-color: var(--tem-fill-color) !important;
        }

        .is-focused .uni-icons.content-clear-icon,
        .uni-icons.content-clear-icon::before {
          color: var(--tem-text-color-secondary) !important;
        }
      }

      > text {
        white-space: nowrap;
        font-size: var(--tem-font-size-b16);
        color: var(--tem-color-primary);
      }
    }
  }
  :deep(.es-search-history) {
    padding: 0 32rpx;
  }
  :deep(.uni-searchbar__box) {
    justify-content: flex-start;
  }
}
</style>
