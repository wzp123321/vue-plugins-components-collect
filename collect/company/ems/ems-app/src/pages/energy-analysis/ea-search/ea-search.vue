<template>
  <uni-popup ref="eaSearchPopup" type="bottom">
    <view class="ea-search" :style="{ height }">
      <!-- 头部 -->
      <view class="es-header">
        <ec-energy-tab
          :tabList="treeTypeList"
          :selectedCode="treeType"
          :transparentFlag="false"
          height="44px"
          @select="handleTreeTypeChange"
        ></ec-energy-tab>
        <!-- 关闭按钮 -->
        <icon-close @click="handleClose" />
      </view>

      <view class="es-body">
        <!-- 能源类型 -->
        <text class="es-body-title">能耗类型</text>
        <es-energy-switch
          :energyCode="energyCode"
          :energyCodeList="energyCodeList"
          @change="handleEnergyCodeChange"
        ></es-energy-switch>
        <!-- 分析对象 -->
        <text class="es-body-title">分析对象</text>
        <!-- 搜索框 -->
        <uni-search-bar
          v-filterEmoji
          ref="searchBarRef"
          class="es-body-search"
          :adjust-position="false"
          maxlength="20"
          placeholder="搜索"
          v-model="searchLabel"
          @cancel="handleSearchCancel"
          @confirm="triggerSearch($event)"
          @focus="handleFocus"
        >
          <template v-slot:searchIcon><icon-search /></template>
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
        ></es-tree-list>
        <!-- 搜索为空 -->
        <common-search-empty
          v-if="!loading && !focusFlag && !treeList.length"
          :title="
            !searchLabel
              ? `${treeType === Common_ETreeType.区域 ? '区域' : '业态'}树模型未绑定此能源类型的设备点位`
              : '搜索结果为空'
          "
          :subTitle="!searchLabel ? '' : '换个关键词试试吧'"
        ></common-search-empty>
      </view>
      <!-- 底部按钮 -->
      <view class="es-bottom">
        <button class="es-bottom-reset" @click="handleReset">重置</button>
        <button class="es-bottom-submit" @click="handleSubmit">确定</button>
      </view>
    </view>
  </uni-popup>
</template>
<script lang="ts" setup>
// 公共库
import { computed, ref } from 'vue';
// hook
import { useCommonTree, useCommonEnergy } from '../../../hook';
// 组件
import EcEnergyTab from '../../energy-consumption/ec-energy-tab/ec-energy-tab.vue';
import EsEnergySwitch from './es-energy-switch/es-energy-switch.vue';
import EsSearchHistory from './es-search-history/es-search-history.vue';
import EsSelectCrumbs from './es-select-crumbs/es-select-crumbs.vue';
import EsTreeList from './es-tree-list/es-tree-list.vue';
import { IconClose, IconSearch } from '@arco-iconbox/vue-tem';
// api
import type { Ea_IPanelForm } from '../energy-analysis.api';
import type { Es_IBreadcrumb, Es_IQueryChildTreeParams } from './ea-search.api';
// store
import { useStore } from 'vuex';
// 工具方法
import { FGetStorageData } from '@/utils/storage';
import { cloneDeep } from 'lodash';
import { handlePageTo } from '@/utils';
// 配置
import { Common_EMenuId, Common_EPath, Common_ETreeType } from '@/config/enum';
import { SESSION_KEY_USER_ID } from '@/config/session-key';
import { COMMON_DEFAULT_BREADCRUMB } from '@/config/config';
// store
const store = useStore();
// emits
const emits = defineEmits(['submit']);

const {
  treeList,
  treeType,
  searchLabel,
  treeTypeList,
  searchBreadCrumbList,
  historyList,
  loading,
  queryTreeTypeList,
  queryHistoryList,
  handleSearchBreadSelect,
  queryTreeList,
} = useCommonTree();
const { energyCode, energyCodeList, queryEnergyCodeList } = useCommonEnergy();

// 弹框实例
const eaSearchPopup = ref();
// 高度
const height = computed(() => {
  return `${store.getters.systemInfo.screenHeight - uni.upx2px(240)}px`;
});
// 日期信息
let date = '';
let timeUnit = '';
// 打开弹框
const handleOpen = async (form: Ea_IPanelForm) => {
  searchFlag.value = false;
  searchLabel.value = '';
  // loading
  uni.showLoading({ title: '加载中...' });
  eaSearchPopup.value && eaSearchPopup.value.open();
  clearData();
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
  date = form.date;
  timeUnit = form.timeUnit;
  energyCode.value = form.energyCode;
  selectedId.value = Number(form.treeId);
  try {
    await queryTreeTypeList();
    treeType.value = form.treeType;
    const promiseArr = [queryEnergyCodeList(), handleTreeQuery(null)];
    await Promise.all(promiseArr);
  } catch (error) {
    console.log('%c✨✨打开区域节点弹框Error✨✨', 'font-size: 24px', error);
  } finally {
    console.log('---------------', searchBreadCrumbList.value);
    uni.hideLoading();
  }
};
/**
 * 关闭
 */
const handleClose = () => {
  eaSearchPopup.value && eaSearchPopup.value.close();
};

// 是否正在搜索
const searchFlag = ref<boolean>(false);
// 输入框是否聚焦
const focusFlag = ref<boolean>(false);
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
    menuId: Common_EMenuId.能耗分析,
    userId: FGetStorageData(SESSION_KEY_USER_ID) ? Number(FGetStorageData(SESSION_KEY_USER_ID)) : null,
    treeType: treeType.value,
    energyCode: energyCode.value,
    keyword: searchLabel.value,
    treeId: treeId === null ? 0 : treeId,
  };
};
/**
 * 切换树类型
 * @param {string} value
 * @returns {void}
 */
const handleTreeTypeChange = (value: string): void => {
  treeType.value = value;
  selectedId.value = null;
  clearData();
  handleTreeQuery(null);
};
/**
 * 切换能源类型
 * @param {string} code
 * @returns {void}
 */
const handleEnergyCodeChange = (code: string): void => {
  energyCode.value = code;
  selectedId.value = null;
  clearData();
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
  handleTreeQuery(null);
};
// 搜索栏实例
const searchBarRef = ref();
/**
 * 输入框聚焦
 * @returns {void}
 */
const handleFocus = (): void => {
  focusFlag.value = true;
  queryHistoryList(Common_EMenuId.能耗分析, energyCode.value, treeType.value);
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
 * @returns {void}
 */
const handleTreeDrill = (id: number, treeName: string): void => {
  handleSearchBreadSelect(id, treeName);
  handleTreeQuery(id);
};
/**
 * 查询
 * @param id
 * @returns {void}
 */
const handleTreeQuery = (id: number | null): void => {
  queryTreeList<Es_IQueryChildTreeParams>(mapQueryTreeParams(id), Common_EPath.根据树节点ID查询子节点列表);
};
// 当前节点
const selectedId = ref<number | null>(null);
/**
 * 确定选择
 * @returns {void}
 */
const handleSubmit = (): void => {
  if (!energyCode.value) {
    uni.showToast({
      title: '请选择能源类型',
      icon: 'none',
      mask: true,
    });
    return;
  }
  if (!selectedId.value) {
    uni.showToast({
      title: '请选择树节点',
      icon: 'none',
      mask: true,
    });
    return;
  }
  // 处理能耗名称、树名称、树链路名称
  let energyName = '';
  let energyUnit = '';
  let treeName = '';
  let treeNames = '';
  energyCodeList.value.forEach((item) => {
    if (item.code === energyCode.value) {
      energyName = item.name;
      energyUnit = item.unit;
    }
  });
  treeList.value.forEach((item) => {
    if (selectedId.value && item.id === +selectedId.value) {
      treeName = item.treeName;
      treeNames = item.treeNames ?? '';
    }
  });
  // 如果当前页没有选中的节点，则直接关闭
  if (!!treeName) {
    handlePageTo('/pages/energy-analysis/energy-analysis', {
      treeId: encodeURIComponent(selectedId.value),
      energyCode: encodeURIComponent(energyCode.value),
      treeType: encodeURIComponent(treeType.value),
      treeName: encodeURIComponent(treeName),
      treeNames: encodeURIComponent(treeNames),
      energyName: encodeURIComponent(energyName),
      energyUnit: encodeURIComponent(energyUnit),
      date: encodeURIComponent(date),
      timeUnit: encodeURIComponent(timeUnit),
    });
  }

  handleClose();
};
/**
 * 重置
 * @returns {void}
 */
const handleReset = (): void => {
  energyCode.value =
    energyCodeList.value.length && energyCodeList.value[0] && energyCodeList.value[0].code
      ? energyCodeList.value[0].code
      : '';
  treeType.value =
    treeTypeList.value.length && treeTypeList.value[0] && treeTypeList.value[0].code ? treeTypeList.value[0].code : '';
  selectedId.value = null;
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
  clearData();
  handleTreeQuery(null);
};
defineExpose({
  handleOpen,
});
</script>
<style lang="scss" scoped>
.ea-search {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--tem-color-white);
  border-radius: 16rpx 16rpx 0 0;

  .es-header {
    width: 100%;
    position: relative;
    height: 116rpx;
    box-sizing: border-box;
    padding: 14rpx 0;

    .ec-energy-tab {
      :deep(.uni-scroll-view-content) {
        justify-content: center;
      }

      .eet-item-selected.eet-item {
        color: var(--tem-color-primary);

        &::before {
          background-color: var(--tem-color-primary);
        }
      }
    }

    > svg {
      width: 48rpx;
      height: 48rpx;

      position: absolute;
      top: 34rpx;
      right: 32rpx;
    }
  }

  .es-body {
    width: 100%;
    flex: auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .es-energy-switch,
    .es-body-title,
    .es-body-search,
    .es-search-history {
      padding: 0 32rpx;
    }

    .es-body-title {
      display: block;
      color: var(--tem-text-color-secondary);
      font-size: 28rpx;
      margin-bottom: 32rpx;
    }

    :deep(.es-body-search) {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-bottom: 24rpx;

      .uni-searchbar__cancel {
        color: var(--tem-color-primary);
        font-size: var(--tem-font-size-b16);
      }

      .uni-searchbar__box {
        justify-content: flex-start;
      }

      .uni-input-input:focus {
        caret-color: var(--tem-color-primary);
      }

      .uni-searchbar__box-icon-search {
        width: 72rpx;
        height: 48rpx;
        padding: 0 16rpx;
      }

      .uni-input-placeholder {
        color: var(--tem-text-color-placeholder);
        font-size: var(--tem-font-size-b16);
      }
    }

    :deep(.es-tree-list) .etl-item:last-child .uni-radio-wrapper {
      border-bottom: none;
    }

    :deep(.common-search-empty) {
      overflow-y: auto;
    }
  }

  .es-bottom {
    padding: 32rpx;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    align-items: center;
    gap: 32rpx;
    border-top: 1rpx solid var(--tem-border-color-light);

    .es-bottom-submit,
    .es-bottom-reset {
      font-weight: 600;
      font-size: 32rpx;
      height: 80rpx;
      line-height: 80rpx;
      box-sizing: border-box;
    }

    .es-bottom-reset {
      width: 160rpx;
      border-radius: 8rpx;
      border: 2rpx solid var(--tem-border-color);
      box-sizing: border-box;
      background-color: var(--tem-color-white);
      color: var(--tem-text-color-regular);

      &::after {
        border: none;
      }
    }

    .es-bottom-submit {
      flex: auto;
      background-color: var(--tem-color-primary);
      color: var(--tem-color-white);
      border: none;
    }
  }
}
</style>
