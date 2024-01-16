<!--
 * @Author: yut
 * @Date: 2023-10-23 16:52:37
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-15 09:31:38
 * @Descripttion: 
-->
<template>
  <view class="quota-management">
    <z-paging
      :auto="false"
      ref="zPagingRef"
      :refresher-only="true"
      :lower-threshold="'300rpx'"
      @onRefresh="handlePullDownRefresh"
      @scrolltolower="handleScrollToLower"
    >
      <!-- 顶部导航栏 -->
      <template #top>
        <!-- 顶部导航栏 -->
        <common-navigation-bar :nativeFlag="true" title="定额管理"></common-navigation-bar>
        <view class="qm-header" v-if="mapPageNormal() || mapDataEmpty()">
          <zb-dropdown-menu style="width: 100%">
            <zb-dropdown-item
              name="dateType"
              :options="dateOption"
              @change="changeEvt"
              v-model="qmService.searchParams.quotaType"
            ></zb-dropdown-item>
            <zb-dropdown-item
              name="treeType"
              :options="areaOption"
              @change="changeEvt"
              v-model="qmService.searchParams.treeType"
            ></zb-dropdown-item>
            <zb-dropdown-item
              name="levelType"
              :options="levelOption"
              @change="changeEvt"
              v-model="qmService.searchParams.treeLevel"
            ></zb-dropdown-item>
          </zb-dropdown-menu>
        </view>
      </template>
      <!-- 自定义下拉刷新view(如果use-custom-refresher为true且不设置下面的slot="refresher"，此时不用获取refresherStatus，会自动使用z-paging自带的下拉刷新view) -->
      <template #refresher="{ refresherStatus }">
        <common-refresher :refresherStatus="refresherStatus"></common-refresher>
      </template>

      <view class="qm-content" v-if="mapPageNormal() && !mapDataEmpty()">
        <view v-for="(item, index) in qmService.dataList" :key="'card' + index">
          <qmCard
            :treeName="item.treeName"
            :treeId="item.treeId"
            :energyList="item.energyInfoList"
            @get-detail-val="getDetailVal"
          ></qmCard>
        </view>
        <view class="qm-bottom-text" v-if="showMoreData && (!qmService.isLoading || refreshLoading)">已经到底啦 </view>
      </view>
      <!-- 缺省状态 -->
      <!-- 页面非正常状态都展示 -->
      <view class="qm-error" v-if="!mapPageNormal()">
        <!-- 网络异常缺省 -->
        <common-network-error v-if="mapPageNetworkError()" @refresh="handleRefresh"></common-network-error>
        <!-- 加载失败-任意接口报错都出现 -->
        <common-load-error v-if="qmService.loadError" @refresh="handleRefresh"></common-load-error>
        <!-- 暂无内容 -->
        <common-data-empty v-if="mapDataEmpty() && !qmService.loadError" title="暂无数据"></common-data-empty>
      </view>
    </z-paging>
  </view>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
//组件
import qmCard from './qm-card/qm-card.vue';
//服务
import { QM_EDateType, QM_ELevelType, type QM_IEnergyType } from './quota-management.api';
import qmService from './quota-management.service';
import { useNetwork } from '@/hook';
import { onHide, onLoad, onShow } from '@dcloudio/uni-app';
import { handlePageTo, mapAdaptiveKeyboard, mapStatusBarHide } from '@/utils';
import { Common_EPageErrorType, Common_ETreeType } from '@/config/enum';
import { getSystemTime } from '../../utils';
const { networkErrorFlag } = useNetwork();
import { usePageErrorController } from '../../hook';

/**
 * 异常状态
 */
const { onWatchNetworkStatus, offWatchNetworkStatus, setPageStatus, mapPageNormal, mapPageNetworkError } =
  usePageErrorController();

/**
 * 暂无数据
 * @returns {boolean}
 */
const mapDataEmpty = (): boolean => {
  return !qmService.dataList.length;
};

/**
 * 刷新
 */
const handleRefresh = async () => {
  networkErrorFlag.value = false;
  uni.showLoading({ title: '加载中' });
  await qmService.getDataList();
  uni.hideLoading();
};

//时间
const dateOption = Object.entries(QM_EDateType).map(([k, v]) => ({ value: v, text: k }));

//区域
const areaOption = Object.entries(Common_ETreeType).map(([k, v]) => ({ value: v, text: k }));

// 节点
const levelOption = Object.entries(QM_ELevelType).map(([k, v]) => ({ value: v, text: k }));

//是否展示没有数据
const showMoreData = computed(
  () => qmService.searchParams.pageNum * qmService.searchParams.pageSize >= qmService.pageInfo.total,
);

//下拉刷新
const refreshLoading = ref(false);

/**
 * 更新选项
 */
const changeEvt = async () => {
  uni.showLoading({ title: '加载中' });
  qmService.searchParams.pageNum = 1;
  qmService.searchParams.pageSize = 10;
  await qmService.getDataList();
  uni.hideLoading();
};

/**
 * 跳转
 * @param treeId 树id
 * @param item 卡片
 */
const getDetailVal = (treeId: number, item: QM_IEnergyType) => {
  handlePageTo('/pages/energy-saving-assessment/energy-saving-assessment', {
    quotaType: qmService.searchParams.quotaType,
    treeId: treeId,
    treeType: qmService.searchParams.treeType,
    energyCode: item.energyCode,
  });
};
// 下拉刷新组件实例
const zPagingRef = ref();
/**
 * 下拉刷新
 * @returns {void}
 */
const handlePullDownRefresh = async () => {
  if (zPagingRef.value) {
    refreshLoading.value = true;
    qmService.searchParams.pageNum = 1;
    await qmService.getDataList();
    zPagingRef.value?.complete();
    refreshLoading.value = false;
  }
};

const handleScrollToLower = async () => {
  // 判断是否还有下一页数据
  if (showMoreData.value) {
    return;
  }
  // 让页码值自增 +1
  qmService.searchParams.pageNum += 1;
  uni.showLoading({ title: '加载中' });
  await qmService.getDataList(true);
  uni.hideLoading();
};

watch(
  () => qmService.dataList,
  () => {
    if (qmService.dataList.length) {
      setPageStatus(Common_EPageErrorType.正常加载);
    } else {
      setPageStatus(Common_EPageErrorType.配置正常但是没有数据);
    }
  },
  { deep: true },
);

/**
 * 页面加载
 */
onShow(async () => {
  await getSystemTime();
  // 隐藏状态栏
  mapStatusBarHide();
  // 适配原生键盘
  mapAdaptiveKeyboard();
  onWatchNetworkStatus(() => {});
  uni.showLoading({ title: '加载中' });
  await qmService.getDataList();
  uni.hideLoading();
});
/**
 * 页面销毁
 */
onHide(() => {
  offWatchNetworkStatus;
});
</script>
<style lang="scss" scoped>
.quota-management {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.zp-paging-container) {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    .zp-paging-container-content {
      flex: auto;
      display: flex;
      flex-direction: column;
    }
  }
  /* 头部 */
  .qm-header {
    height: 92rpx;
    display: flex;
    flex: none;
    align-items: center;
    background-color: var(--tem-color-white);
  }
  /* 内容区域 */
  .qm-content {
    flex: auto;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    background-color: #f2f3f5;
    padding: 16rpx 32rpx;
  }
  .qm-bottom-text {
    height: 32rpx;
    line-height: 32rpx;
    text-align: center;
    font-size: var(--tem-font-size-b14);
    color: var(--tem-text-color-placeholder);
  }
  .qm-error {
    flex: auto;
  }
  :deep(.common-refresher) {
    background-color: #f2f3f5;
  }
  :deep(.zb-dropdown-menu__title--active) {
    color: var(--tem-color-primary) !important;
  }
  :deep(.active-cell__title, .active-icon) {
    color: var(--tem-color-primary) !important;
  }
  :deep(.active-icon) {
    color: var(--tem-color-primary) !important;
  }
  :deep(.zb-dropdown-menu__bar--opened) {
    box-shadow: none;
  }
  :deep(.zb-popup > uni-view) {
    border-top: 1rpx solid #ebedf0;
  }
  :deep(.zb-dropdown-item) {
    z-index: 11;
  }
  :deep(.common-data-empty) {
    background-color: #f2f3f5;
  }
}
</style>
