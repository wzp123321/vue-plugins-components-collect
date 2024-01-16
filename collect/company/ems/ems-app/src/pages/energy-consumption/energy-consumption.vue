<template>
  <view
    class="energy-consumption"
    :style="{
      backgroundImage:
        topLevelFlag && (mapPageNormal() || mapPageDataEmpty())
          ? mapBackgroundImageByEnergyCode(topPanelForm.energyCode, energyStickyFlag)
          : '',
    }"
  >
    <!-- 背景图 -->
    <z-paging
      ref="zPagingRef"
      :refresher-enabled="true"
      :loading-more-enabled="true"
      to-bottom-loading-more-enabled
      :hide-empty-view="!mapPageNormal()"
      :lower-threshold="'300rpx'"
      @onRefresh="handlePullDownRefresh"
      @scroll="handleScroll"
      @scrolltolower="handleScrollToLower"
    >
      <!-- 顶部导航栏,状态栏参考uv-status-bar -->
      <template #top>
        <common-navigation-bar
          :nativeFlag="nativeFlag"
          title="能耗纵览"
          :backgroundColor="navigatorStyle.backgroundColor"
          :color="navigatorStyle.color"
        ></common-navigation-bar>
      </template>
      <!-- 自定义下拉刷新view(如果use-custom-refresher为true且不设置下面的slot="refresher"，此时不用获取refresherStatus，会自动使用z-paging自带的下拉刷新view) -->
      <template #refresher="{ refresherStatus }">
        <common-refresher :refresherStatus="refresherStatus" :transparentFlag="topLevelFlag"></common-refresher>
      </template>
      <view
        class="ec-panel"
        v-if="
          mapPageNormal() ||
          mapPageEnergyEmpty() ||
          mapPageTreeUnBindEnergy() ||
          mapPageDataEmpty() ||
          mapPageNoRelationDevice()
        "
      >
        <!-- 节点&时间 -->
        <ec-tree-date
          :topPanelForm="topPanelForm"
          :transparentFlag="topLevelFlag && !mapPageEnergyEmpty() && !mapPageTreeUnBindEnergy()"
          @date-change="handleDateChange"
          @open-search-popup="openPopup"
        ></ec-tree-date>
        <!-- 能源类型 -->
        <ec-energy-tab
          v-if="!mapPageEnergyEmpty()"
          :tabList="energyCodeList"
          :transparentFlag="topLevelFlag && !mapPageEnergyEmpty() && !mapPageTreeUnBindEnergy()"
          :energyStickyFlag="energyStickyFlag"
          :selectedCode="topPanelForm.energyCode"
          @select="handleEnergyCodeChange"
        ></ec-energy-tab>
      </view>
      <!-- 纵览卡片 -->
      <ec-consumption-card
        v-if="mapPageNormal() || mapPageTreeUnBindEnergy() || mapPageDataEmpty() || mapPageNoRelationDevice()"
        :consumptionData="scanNodeInfo"
        :energyCode="topPanelForm.energyCode"
        :topLevelFlag="topLevelFlag"
      ></ec-consumption-card>
      <!-- 详情卡片 -->
      <ec-detail-card
        v-if="mapPageNormal() && childNodeList.length > 0"
        :tagStickyFlag="tagStickyFlag"
        :treeList="childNodeList"
        :treeDetail="childNodeDetail"
        :checkedCode="topPanelForm.childTreeId"
        :topPanelForm="topPanelForm"
        @change="handleChildTreeSelect"
      ></ec-detail-card>
      <!-- 列表卡片-当前节点有子节点时展示 -->
      <ec-list-card
        :topPanelForm="topPanelForm"
        :childTreeList="childNodeDetail.childrenItem"
        :childrenItemHead="childNodeDetail.childrenItemHead"
        v-if="mapPageNormal() && childNodeDetail.nodeItem.hasChildren && childNodeList.length > 0"
      ></ec-list-card>
      <!-- 设备列表 -->
      <ec-device-card
        :childTreeList="scanNodeInfo.childrenItem"
        :childrenItemHead="scanNodeInfo.childrenItemHead"
        v-if="mapPageNormal() && mapDeviceListShow() && scanNodeInfo.childrenItem.length > 0"
      ></ec-device-card>
      <!-- 页面非正常状态都展示 -->
      <view class="ec-error" v-if="!mapPageNormal()">
        <!-- 网络异常缺省 -->
        <common-network-error v-if="mapPageNetworkError()" @refresh="handleRefresh"></common-network-error>
        <!-- 加载失败-任意接口报错都出现 -->
        <common-load-error v-if="mapPageLoadError()" @refresh="handleRefresh"></common-load-error>
        <!-- 暂无权限 -->
        <common-no-permission v-if="mapPageNoPermission()"></common-no-permission>
        <!-- 未配置树节点 -->
        <common-tree-empty v-if="mapPageAreaTreeEmpty()"></common-tree-empty>
        <!-- 暂无内容 -->
        <common-data-empty
          :class="{ 'ec-error-energy': mapPageEnergyEmpty() }"
          v-if="mapPageEnergyEmpty() || mapPageTreeUnBindEnergy() || mapPageDataEmpty() || mapPageNoRelationDevice()"
          :title="errorTitle.title"
          :subTitle="errorTitle.subTitle"
        ></common-data-empty>
      </view>
      <!-- 自定义滑动到底部"没有更多数据"状态的view -->
      <template #empty>
        <view>我也是有底线的~</view>
      </template>
    </z-paging>
    <!-- 筛选 -->
    <ec-search ref="ecsSearchRef"></ec-search>
  </view>
</template>

<script setup lang="ts">
// 公共库
import { ref, reactive, nextTick, onBeforeMount, computed } from 'vue';
import { onHide, onLoad, onShow } from '@dcloudio/uni-app';
// 组件
import EcConsumptionCard from './ec-consumption-card/ec-consumption-card.vue';
import EcEnergyTab from './ec-energy-tab/ec-energy-tab.vue';
import EcTreeDate from './ec-tree-date/ec-tree-date.vue';
import EcListCard from './ec-list-card/ec-list-card.vue';
import EcDetailCard from './ec-detail-card/ec-detail-card.vue';
import EcDeviceCard from './ec-device-card/ec-device-card.vue';
import EcSearch from './ec-search/ec-search.vue';
// 工具方法
import { FGetQueryParam, formatDate, getSystemTime, mapAdaptiveKeyboard, mapStatusBarHide } from '../../utils/index';
import { checkExistInList, mapBackgroundImageByEnergyCode } from './utils';
import { cloneDeep, throttle } from 'lodash';
// 接口
import type { Ec_ITopPanelForm, Ec_INavigatorStyle, Ec_IQueryParams } from './energy-consumption.api';
// 钩子函数
import { useCommonEnergy, usePageErrorController } from '../../hook';
import { useEnergyConsumptionController } from './hook/index';
import type { Common_IScrollEventDetail, Common_IEvent } from '@/api/model';
import { Common_EEnergyCode, Common_EPageErrorType } from '@/config/enum';
import { initialRes } from './constant/enum';

// 表单
const topPanelForm = reactive<Ec_ITopPanelForm>({
  treeId: '',
  treeName: '',
  parentNames: '',
  date: '',
  energyCode: '',
  childTreeId: '',
});
/**
 * 切换日期
 * @param {string} value
 * @returns {void}
 */
const handleDateChange = (value: string): void => {
  if (!loading.value) {
    topPanelForm.date = value;
    handleAllDataQuery();
  }
};

// 筛选弹框实例
const ecsSearchRef = ref();
/**
 * 打开筛选弹窗
 */
const openPopup = () => {
  if (!loading.value) {
    ecsSearchRef.value?.openPopup(topPanelForm);
  }
};

/**
 * 切换能源类型
 * @param {string} code
 * @returns {void}
 */
const handleEnergyCodeChange = (code: string): void => {
  if (!loading.value) {
    topPanelForm.energyCode = code;
    handleAllDataQuery();
  }
};
/**
 * 切换子节点
 * @param code
 * @returns {void}
 */
const handleChildTreeSelect = (code: string): void => {
  topPanelForm.childTreeId = code;
  handleChildDataQuery();
};
/**
 * 全量查询数据
 * @returns {Promise<void>}
 */
const handleAllDataQuery = async (): Promise<void> => {
  uni.showLoading({
    title: '加载中...',
  });
  if (!loading.value) {
    loading.value = true;
    try {
      const promiseArr = [
        queryChildNodeList(topPanelForm.treeId, topPanelForm.energyCode),
        queryNodeSelfData(mapQueryParams()),
      ];
      await Promise.all(promiseArr);
      topPanelForm.treeId = scanNodeInfo.nodeItem.itemId ?? null;
      topPanelForm.treeName = scanNodeInfo.nodeItem.itemName ?? '';
      topPanelForm.parentNames = scanNodeInfo.nodeItem.parentItemName;
      if (childNodeList.value.length) {
        topPanelForm.childTreeId = childNodeList.value[0].itemId;
        await queryChildrenDetailById(mapQueryParams(topPanelForm.childTreeId));
      }
      // 是末级节点且没有子节点
      if (!scanNodeInfo.nodeItem.hasChildren && scanNodeInfo.childrenItem.length === 0) {
        setPageStatus(Common_EPageErrorType.没有关联设备);
      } else if (!scanNodeInfo.nodeItem.energyValue) {
        setPageStatus(Common_EPageErrorType.配置正常但是没有数据);
      } else {
        setPageStatus(Common_EPageErrorType.正常加载);
      }
    } catch (error) {
      handleErrorCode((error as any).errcode);

      console.log('%c✨✨查询全量数据报错✨✨', 'font-size: 24px', error);
      // 重置数据
      scanNodeInfo.childrenItem = cloneDeep(initialRes.childrenItem);
      scanNodeInfo.childrenItemHead = cloneDeep(initialRes.childrenItemHead);
      scanNodeInfo.nodeItem = cloneDeep(initialRes.nodeItem);
      childNodeDetail.childrenItem = cloneDeep(initialRes.childrenItem);
      childNodeDetail.childrenItemHead = cloneDeep(initialRes.childrenItemHead);
      childNodeDetail.nodeItem = cloneDeep(initialRes.nodeItem);
    } finally {
      uni.hideLoading();
      updateNavigatorStyle();
      loading.value = false;
    }
  }
};
/**
 * 查询子节点数据
 * @returns {Promise<void>}
 */
const handleChildDataQuery = async (): Promise<void> => {
  uni.showLoading({
    title: '加载中...',
  });
  if (!loading.value) {
    loading.value = true;
    try {
      const promiseArr = [queryChildrenDetailById(mapQueryParams(topPanelForm.childTreeId))];
      await Promise.all(promiseArr);
      setPageStatus(Common_EPageErrorType.正常加载);
    } catch (error) {
      console.log('%c✨✨查询子节点数据报错✨✨', 'font-size: 24px', error);
      handleErrorCode((error as any).errcode);

      childNodeDetail.childrenItem = cloneDeep(initialRes.childrenItem);
      childNodeDetail.childrenItemHead = cloneDeep(initialRes.childrenItemHead);
      childNodeDetail.nodeItem = cloneDeep(initialRes.nodeItem);
    } finally {
      uni.hideLoading();
      loading.value = false;
      updateNavigatorStyle();
    }
  }
};
/**
 * 返回查询入参
 * @returns {Ec_IQueryParams}
 */
const mapQueryParams = (treeId: string = topPanelForm.treeId): Ec_IQueryParams => {
  return {
    treeId,
    queryTime: topPanelForm.date,
    energyCode: topPanelForm.energyCode,
  };
};

/**
 * 异常状态
 */
const {
  pageStatus,
  errorTitle,
  onWatchNetworkStatus,
  offWatchNetworkStatus,
  setPageStatus,
  mapPageNormal,
  mapPageNetworkError,
  mapPageLoadError,
  mapPageNoPermission,
  mapPageAreaTreeEmpty,
  mapPageEnergyEmpty,
  mapPageTreeUnBindEnergy,
  mapPageDataEmpty,
  mapPageNoRelationDevice,
  handleErrorCode,
} = usePageErrorController();
// loading
const loading = ref<boolean>(false);

const {
  scanNodeInfo,
  childNodeList,
  childNodeDetail,

  queryNodeSelfData,
  queryChildNodeList,
  queryChildrenDetailById,
} = useEnergyConsumptionController();
/**
 * 是否展示设备列表,子节点Tab列表为空
 * @returns {boolean}
 */
const mapDeviceListShow = (): boolean => {
  return childNodeList.value.length === 0 && topPanelForm.energyCode !== Common_EEnergyCode.总能耗 && !loading.value;
};
/**
 * 刷新
 * @returns { Promise<void>}
 */
const handleRefresh = async (): Promise<void> => {
  // 初始化能源类型
  await init();
  if (energyCodeList.value.length) {
    topPanelForm.energyCode = energyCodeList.value?.[0]?.code;
    // 判断是否是顶级节点
    checkTopLevel();
    // 查询数据
    handleAllDataQuery();
    // 初始化调用complete方法
    nextTick(() => {
      if (zPagingRef.value) {
        setTimeout(() => {
          zPagingRef.value?.complete();
        }, 1000);
      }
    });
  } else {
    uni.hideLoading();
    loading.value = false;
    updateNavigatorStyle();
  }
};
// 能源类型
const { energyCodeList, queryEnergyCodeList } = useCommonEnergy();
/**
 * 初始化,查询能源类型列表
 * @returns {Promise<void>}
 */
const init = async (): Promise<void> => {
  uni.showLoading({
    title: '加载中...',
  });
  await getSystemTime();
  try {
    const promiseArr: [Promise<void>] = [queryEnergyCodeList()];
    await Promise.all(promiseArr);
  } catch (error) {
    uni.hideLoading();
    energyCodeList.value = [];
    console.log('%c✨✨查询能源类型列表✨✨', 'font-size: 24px', error);
    setPageStatus(Common_EPageErrorType.加载失败);
  }
};

// 下拉刷新组件实例
const zPagingRef = ref();
/**
 * 下拉刷新
 * @returns {Promise<void>}
 */
const handlePullDownRefresh = async (): Promise<void> => {
  console.log('%c✨✨触发下拉刷新✨✨', 'font-size: 24px');
  if (zPagingRef.value) {
    setTimeout(() => {
      zPagingRef.value?.complete();
    }, 1000);
  }
  await init();
  if (!checkExistInList(energyCodeList.value, 'code', topPanelForm.energyCode)) {
    topPanelForm.energyCode = energyCodeList.value?.[0]?.code;
  }

  handleAllDataQuery();
};
/**
 * 监听滚动
 * @param {Common_IEvent<Common_IScrollEventDetail>} e
 * @returns {void}
 */
const handleScroll = throttle((e: Common_IEvent<Common_IScrollEventDetail>): void => {
  // 滚动距离
  const top = e.detail.scrollTop;
  // dom距离顶部距离
  const targetEle = document.querySelector('.ec-energy-tab') as HTMLElement;
  //标签头部距离顶部距离
  const tagEle = document.querySelector('.edc-body') as HTMLElement;
  // tab与顶部的距离
  const offsetTop = (document.querySelector('.etd-tree-date') as HTMLElement).clientHeight;
  console.log('%c✨✨页面滚动✨✨', 'font-size: 24px', e, top, offsetTop, tagEle.offsetTop);
  if (targetEle) {
    energyStickyFlag.value = top >= offsetTop;
    // 如果是顶级节点才需要判断
    if (topLevelFlag.value) {
      // 如果能源类型吸顶
      updateNavigatorStyle();
    }
  }
  if (tagEle) {
    const tagOffsetTop = tagEle.offsetTop;
    tagStickyFlag.value = top > tagOffsetTop - 48 - 44;
  }
}, 233);
/**
 * 监听是否滚动到底部
 * 0-默认状态 1.加载中 2.没有更多数据 3.加载失败
 * @param {string} e
 * @returns {void}
 */
const handleScrollToLower = (e: string): void => {
  // console.log('%c✨✨触底✨✨', 'font-size: 24px', e);
};
/**
 * 地址栏是否有参数,如果地址栏没有treeId，则是调用原生方法
 */
const nativeFlag = computed(() => {
  return !FGetQueryParam('treeId');
});
// 是否是顶级节点-通过判断地址栏有没有传参，主要是控制顶部是否有背景图，部分模块背景色等
const topLevelFlag = ref<boolean>(true);
// 能源类型是否吸顶
const energyStickyFlag = ref<boolean>(false);
// 详情标签是否吸顶
const tagStickyFlag = ref<boolean>(false);
// 导航栏样式
const navigatorStyle = reactive<Ec_INavigatorStyle>({
  backgroundColor: 'transparent',
  color: 'var(--tem-color-white)',
});
/**
 * 校验是否是顶级节点
 * @returns {void}
 */
const checkTopLevel = (): void => {
  // 地址栏没有treeId
  topLevelFlag.value = !FGetQueryParam('treeId');
  // 接收参数
  if (!!FGetQueryParam('treeId')) {
    topPanelForm.treeId = decodeURIComponent(FGetQueryParam('treeId') ?? '');
    topPanelForm.treeName = decodeURIComponent(FGetQueryParam('treeName') ?? '');
    topPanelForm.energyCode = decodeURIComponent(FGetQueryParam('energyCode') ?? '');
    topLevelFlag.value = !!FGetQueryParam('topLevel') && FGetQueryParam('topLevel') === 'true';
  }
};
/**
 * 判断是否需要透明样式
 * @returns {void}
 */
const updateNavigatorStyle = (): void => {
  // 非吸顶状态且是顶级节点且没有接口报错没有缺省没有断网
  const flag = topLevelFlag.value && !energyStickyFlag.value && (mapPageNormal() || mapPageDataEmpty());
  console.log(
    '%c✨✨判断是否为透明✨✨',
    'font-size: 24px',
    topLevelFlag.value,
    energyStickyFlag.value,
    mapPageDataEmpty(),
    mapPageNormal(),
    flag,
    pageStatus.value,
  );
  navigatorStyle.backgroundColor = flag ? 'transparent' : 'var(--tem-color-white)';
  navigatorStyle.color = flag ? 'var(--tem-color-white)' : 'var(--tem-text-color-primary)';
};

/**
 * 页面加载成功前
 */
onBeforeMount(() => {
  // 判断是否是顶级节点
  checkTopLevel();
  updateNavigatorStyle();
});
onShow(() => {
  // 隐藏状态栏
  mapStatusBarHide();
  // 适配原生键盘
  mapAdaptiveKeyboard();
  // 监听网络状态
  onWatchNetworkStatus(() => {
    updateNavigatorStyle();
  });
});
/**
 * 页面加载
 */
onLoad(async () => {
  // 初始化正常状态
  setPageStatus(Common_EPageErrorType.正常加载);
  topPanelForm.date = formatDate(new Date(), 'yyyy-MM');
  // 初始化能源类型
  await init();
  if (energyCodeList.value.length > 0) {
    topPanelForm.energyCode = energyCodeList.value?.[0]?.code;
    // 判断是否是顶级节点
    checkTopLevel();
    // 查询数据
    handleAllDataQuery();
    // 初始化调用complete方法
    nextTick(() => {
      if (zPagingRef.value) {
        setTimeout(() => {
          zPagingRef.value?.complete();
        }, 1000);
      }
    });
  } else {
    // 如果没有加载失败，则是能源类型为空
    if (!mapPageLoadError()) {
      setPageStatus(Common_EPageErrorType.没有配置能耗类型列表);
    }
    uni.hideLoading();
    updateNavigatorStyle();
  }
});
onHide(() => {
  offWatchNetworkStatus();
});
</script>

<style lang="scss" scoped>
.energy-consumption {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-size: contain;
  background-position: top center;
  background-repeat: no-repeat;
  background-color: var(--tem-bg-color-page);
  transition: all 233ms;

  :deep(.z-paging-content) {
    .ec-panel {
      position: relative;
      width: 100%;
    }

    .ec-error {
      flex: auto;

      .ec-error-energy {
        background-color: transparent;
      }
    }

    .uni-scroll-view-content {
      min-height: 100%;
    }

    .zp-empty-view {
      flex: 0;
      padding: 16rpx 0;
      font-size: var(--tem-font-size-s12);
      color: var(--tem-text-color-secondary);
    }

    .zp-paging-container-content {
      flex: auto;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
