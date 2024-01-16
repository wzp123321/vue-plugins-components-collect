<template>
  <view
    :class="['energy-analysis', landscapeFlag || !mapPageNormal() ? 'is-landscape' : '']"
    :style="{
      'background-image':
        (!mapPageNormal() && !mapPageDataEmpty() && !mapPageTreeUnBindEnergy()) || landscapeFlag
          ? ''
          : mapEnergyAnalysisBgImage(panelForm.energyCode),
    }"
  >
    <z-paging ref="zPagingRef" :refresher-only="true" :lower-threshold="'300rpx'" @onRefresh="handlePullDownRefresh">
      <!-- 顶部导航栏 -->
      <template #top>
        <common-navigation-bar
          :nativeFlag="nativeFlag"
          title="能耗分析"
          :backgroundColor="navigatorStyle.backgroundColor"
          :color="navigatorStyle.color"
        >
          <template v-slot:right>
            <icon-filter
              @click="handleOpenSearch"
              v-if="mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy()"
            />
          </template>
        </common-navigation-bar>
      </template>
      <!-- 自定义下拉刷新view(如果use-custom-refresher为true且不设置下面的slot="refresher"，此时不用获取refresherStatus，会自动使用z-paging自带的下拉刷新view) -->
      <template #refresher="{ refresherStatus }">
        <common-refresher
          :refresherStatus="refresherStatus"
          :transparentFlag="!landscapeFlag || mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy()"
        ></common-refresher>
      </template>
      <!-- 节点名称 -->
      <view class="ea-panel" v-if="mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy()">
        <!-- 图标 -->
        <view class="ea-panel-icon">
          <img
            v-if="(mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy()) && !landscapeFlag"
            :src="mapEnergyAnalysisIconImage(panelForm.energyCode)"
          />
        </view>
        <view
          v-if="!mapIsLandscapeFlag()"
          :class="['ea-panel-tree', !panelForm.parentNames ? '' : 'ea-panel-has-parent']"
        >
          <view class="ea-panel-tree-name">{{ panelForm.treeName ?? '-' }}</view>
          <view class="ea-panel-tree-parent">{{ panelForm.parentNames }}</view>
        </view>
        <!-- 时间颗粒度Tab -->
        <ec-energy-tab
          v-if="!mapIsLandscapeFlag() && (mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy())"
          :tabList="timeUnitList"
          :selectedCode="panelForm.timeUnit"
          :transparentFlag="true"
          @select="handleTimeUnitChange"
        ></ec-energy-tab>
        <!-- 能源类型&时间 -->
        <view
          class="ea-panel-bottom"
          v-if="!mapIsLandscapeFlag() && (mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy())"
        >
          <text class="ea-panel-bottom-energy"> {{ panelForm.energyName }}{{ `(${panelForm.energyUnit})` }} </text>
          <tem-dateTimePicker
            mode="date"
            :value="panelForm.date"
            :fields="mapDatePickerField(panelForm.timeUnit)"
            :end="getCurrentDateStr()"
            @change="handleDateChange"
          >
            <view class="ea-panel-bottom-center">
              <text>{{ mapDate() }}</text>
              <IconDown></IconDown>
            </view>
            <template #headerTitle>
              <text>选择日期</text>
            </template>
          </tem-dateTimePicker>
        </view>
      </view>
      <!-- 内容区 -->
      <ea-scan
        v-if="!mapIsLandscapeFlag() && (mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy())"
        :totalItem="analysisDetail.totalItem"
        :tbCompare="tbCompare"
      ></ea-scan>
      <ea-charts
        v-if="mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy()"
        :landscapeFlag="landscapeFlag"
        :energy-code="panelForm.energyCode"
        :energyName="panelForm.energyName"
        :timeUnit="panelForm.timeUnit"
        :chartItem="analysisDetail.chartItem"
        :emptyFlag="mapPageDataEmpty() || mapPageTreeUnBindEnergy()"
        :tbCompare="chartTbCompare"
        :loading="loading"
        :unit="panelForm.energyUnit"
        @change="handleLandscapeFlagChange"
        @drill="handleLineChartDrill"
      ></ea-charts>
      <!-- 缺省状态 -->
      <view class="ea-error" v-if="!mapPageNormal() && !mapPageDataEmpty() && !mapPageTreeUnBindEnergy()">
        <!-- 网络异常缺省 -->
        <common-network-error v-if="mapPageNetworkError()" @refresh="handleRefresh"></common-network-error>
        <!-- 加载失败-任意接口报错都出现 -->
        <common-load-error v-if="mapPageLoadError()" @refresh="handleRefresh"></common-load-error>
        <!-- 暂无权限 -->
        <common-no-permission v-if="mapPageNoPermission()"></common-no-permission>
        <!-- 未配置树节点 -->
        <common-tree-empty v-if="mapPageNoTree()"></common-tree-empty>
        <!-- 暂无内容 -->
        <common-data-empty
          :class="{ 'ec-error-energy': mapPageEnergyEmpty() }"
          v-if="mapPageEnergyEmpty()"
          :title="errorTitle.title"
          :subTitle="errorTitle.subTitle"
        ></common-data-empty>
      </view>
    </z-paging>
    <!-- 弹出框 -->
    <EaSearchPopup ref="eaSearchPopupRef"></EaSearchPopup>
  </view>
</template>
<script lang="ts" setup>
// 公共库
import { onHide, onLoad, onShow } from '@dcloudio/uni-app';
import { computed, nextTick, reactive, ref } from 'vue';
// 工具方法
import { mapEnergyAnalysisBgImage, mapEnergyAnalysisIconImage } from './utils/index';
import {
  FGetQueryParam,
  getCurrentDateStr,
  mapDatePickerField,
  mapStatusBarHide,
  getTimeScopeByTimeUnit,
  formatDate,
  getSystemTime,
  mapAdaptiveKeyboard,
} from '../../utils/index';
// 接口
import type { Ea_IPanelForm, Ea_ISearchParams } from './energy-analysis.api';
import type { Common_ICodeName, Common_IEvent, Common_IDatePickerVO } from '../../api/model';
import type { Ec_INavigatorStyle } from '../energy-consumption/energy-consumption.api';
// 枚举
import { Common_EPageErrorType, Common_ETimeUnit, Common_ETreeType } from '../../config/enum';
// 组件
import EcEnergyTab from '../energy-consumption/ec-energy-tab/ec-energy-tab.vue';
import EaScan from './ea-scan/ea-scan.vue';
import EaCharts from './ea-charts/ea-charts.vue';
import { IconDown, IconFilter } from '@arco-iconbox/vue-tem';
import { TemDateTimePicker } from '@tiansu/ts-mobile-package';
import EaSearchPopup from './ea-search/ea-search.vue';
// hook
import { useEnergyAnalysisController, useThCompareController } from './hook/index';
import { useCommonTree, useCommonEnergy, usePageErrorController } from '../../hook/index';
// 配置
import { checkExistInList } from '../energy-consumption/utils';
// 面板数据
const panelForm = reactive<Ea_IPanelForm>({
  treeId: null,
  treeType: '',
  treeName: '',
  date: '',
  parentNames: '',
  energyCode: '',
  energyName: '',
  timeUnit: Common_ETimeUnit.日,
  energyUnit: '',
});
// 时间颗粒度数组
const timeUnitList: Common_ICodeName<string>[] = Object.entries(Common_ETimeUnit)?.map(([k, v]) => {
  return {
    code: v,
    name: k,
  };
});
// 节点选择弹框实例
const eaSearchPopupRef = ref();
/**
 * 打开弹框
 */
const handleOpenSearch = () => {
  eaSearchPopupRef.value && eaSearchPopupRef.value?.handleOpen(panelForm);
};
// 同环比
const { tbCompare, chartTbCompare, mapTbCompare } = useThCompareController();
/**
 * 切换时间颗粒度
 * @param {string} value
 * @returns {void}
 */
const handleTimeUnitChange = (value: string): void => {
  panelForm.timeUnit = value;
  queryDetail();
};
/**
 * 处理日期展示
 * @returns {string}
 */
const mapDate = (): string => {
  return formatDate(new Date(panelForm.date), mapFormat(panelForm.timeUnit));
};
/**
 * 根据颗粒度返回格式化
 * @param timeUnit
 * @returns {string}
 */
const mapFormat = (timeUnit: string): string => {
  return timeUnit === Common_ETimeUnit.年 ? 'yyyy' : timeUnit === Common_ETimeUnit.月 ? 'yyyy-MM' : 'yyyy-MM-dd';
};
/**
 * 切换日期
 * @param {Common_IEvent<Common_IDatePickerVO>} event
 * @returns {void}
 */
const handleDateChange = (event: Common_IEvent<Common_IDatePickerVO>): void => {
  panelForm.date = event.detail.value ?? '';
  queryDetail();
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
  if (mapPageNormal()) {
    queryDetail();
  }
};
// 是否横屏
const landscapeFlag = ref<boolean>(false);
/**
 * 是否是横屏模式
 * @returns {boolean}
 */
const mapIsLandscapeFlag = (): boolean => {
  return landscapeFlag.value;
};
// 导航栏样式
const navigatorStyle = reactive<Ec_INavigatorStyle>({
  backgroundColor: 'transparent',
  color: 'var(--tem-color-white)',
});
/**
 * 判断是否需要透明样式
 * @returns {void}
 */
const updateNavigatorStyle = (): void => {
  // 没有接口报错没有缺省没有断网
  const flag = (mapPageNormal() || mapPageDataEmpty() || mapPageTreeUnBindEnergy()) && !mapIsLandscapeFlag();
  navigatorStyle.backgroundColor = flag ? 'transparent' : 'var(--tem-color-white)';
  navigatorStyle.color = flag ? 'var(--tem-color-white)' : 'var(--tem-text-color-primary)';
  console.log('%c✨✨判断是否为透明✨✨', 'font-size: 24px', flag, navigatorStyle, pageStatus.value);
};
/**
 * 切换横屏
 * @param flag
 * @returns {void}
 */
const handleLandscapeFlagChange = (flag: boolean): void => {
  landscapeFlag.value = flag;
  updateNavigatorStyle();
};
/**
 * 图表钻取,处理颗粒度，时间
 * @param index
 * @returns {void}
 */
const handleLineChartDrill = (index: number, timeStamp: number): void => {
  console.log('%c✨✨图表钻取✨✨', 'font-size: 24px', index, timeStamp);
  if (panelForm.timeUnit === Common_ETimeUnit.年) {
    panelForm.timeUnit = Common_ETimeUnit.月;
  } else if (panelForm.timeUnit === Common_ETimeUnit.月) {
    panelForm.timeUnit = Common_ETimeUnit.日;
  }
  panelForm.date = formatDate(new Date(timeStamp), mapFormat(panelForm.timeUnit));
  queryDetail();
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
  mapPageNoTree,
  mapPageEnergyEmpty,
  mapPageTreeUnBindEnergy,
  mapPageDataEmpty,
  handleErrorCode,
} = usePageErrorController();
// loading
const loading = ref<boolean>(false);

const { analysisDetail, queryAnalysisInfo } = useEnergyAnalysisController();
/**
 * 刷新
 */
const handleRefresh = async () => {
  await init();
  // 初始化调用complete方法
  nextTick(() => {
    if (zPagingRef.value) {
      zPagingRef.value?.complete();
    }
  });
  if (mapPageNormal()) {
    queryDetail();
  }
};

const { treeTypeList, queryTreeTypeList, mapTreeList } = useCommonTree();
const { energyCodeList, queryEnergyCodeList } = useCommonEnergy();
/**
 * 初始化，查询节点以及节点信息
 */
const init = async () => {
  try {
    uni.showLoading({
      title: '加载中...',
    });
    // 查询系统时间
    await getSystemTime();
    // 先查树类型、能源类型
    await Promise.all([queryTreeTypeList(), queryEnergyCodeList()]);
    if (treeTypeList.value.length) {
      panelForm.treeType = treeTypeList.value?.[0]?.code ?? Common_ETreeType.区域;
    }
    if (energyCodeList.value.length && !checkExistInList(energyCodeList.value, 'code', panelForm.energyCode)) {
      panelForm.energyCode = energyCodeList.value?.[0]?.code ?? '';
      panelForm.energyName = energyCodeList.value?.[0]?.name ?? '';
      panelForm.energyUnit = energyCodeList.value?.[0]?.unit ?? '';
    }
    const treeVo = await Promise.resolve(
      mapTreeList({
        treeType: panelForm.treeType,
        energyCode: panelForm.energyCode,
      }),
    );
    console.log(treeVo);
    if (treeVo && treeVo.id) {
      panelForm.treeId = treeVo?.id;
      panelForm.treeName = treeVo?.treeName;
      setPageStatus(Common_EPageErrorType.正常加载);
    } else {
      setPageStatus(Common_EPageErrorType.配置正常但是没有数据);
      updateNavigatorStyle();
      uni.hideLoading();
    }
  } catch (error) {
    handleErrorCode((error as any).errcode);
    uni.hideLoading();
    console.log('%c✨✨初始化✨✨', 'font-size: 24px', error);
    updateNavigatorStyle();
  }
};
/**
 * 查详情
 */
const queryDetail = () => {
  uni.showLoading({
    title: '加载中...',
  });
  mapTbCompare(panelForm.timeUnit, panelForm.date);
  loading.value = true;
  const params = mapQueryParams();
  queryAnalysisInfo(params)
    .then((res) => {
      if (!analysisDetail.totalItem.energyValue) {
        setPageStatus(Common_EPageErrorType.配置正常但是没有数据);
      } else {
        setPageStatus(Common_EPageErrorType.正常加载);
      }
    })
    .catch((error) => {
      analysisDetail.totalItem.energyValue = null;
      analysisDetail.totalItem.lastMonthRatio = null;
      analysisDetail.totalItem.lastYearRatio = null;
      console.log('%c✨✨查询能耗分析报错✨✨', 'font-size: 24px', params, error);
      handleErrorCode((error as any).errcode);
    })
    .finally(() => {
      loading.value = false;
      updateNavigatorStyle();
      uni.hideLoading();
    });
};
/**
 * 返回查询入参
 * @returns {Ea_ISearchParams}
 */
const mapQueryParams = (): Ea_ISearchParams => {
  const { date, timeUnit, treeId, treeType, energyCode } = panelForm;
  return {
    timeUnit,
    treeId,
    treeType,
    energyCode,
    ...getTimeScopeByTimeUnit(timeUnit, date),
  };
};
/**
 * 地址栏是否有参数,如果地址栏没有treeId，则是调用原生方法
 */
const nativeFlag = computed(() => {
  return !FGetQueryParam('treeId');
});
/**
 * 接收地址栏传参
 * @returns {void}
 */
const mapUrlParams = (): void => {
  // 接收参数
  if (FGetQueryParam('treeId')) {
    panelForm.treeId = !!FGetQueryParam('treeId') ? +decodeURIComponent(FGetQueryParam('treeId') ?? '') : null;
    panelForm.treeName = decodeURIComponent(FGetQueryParam('treeName') ?? '');
    panelForm.treeType = decodeURIComponent(FGetQueryParam('treeType') ?? '');
    panelForm.energyCode = decodeURIComponent(FGetQueryParam('energyCode') ?? '');
    panelForm.parentNames = decodeURIComponent(FGetQueryParam('treeNames') ?? '');
    panelForm.energyName = decodeURIComponent(FGetQueryParam('energyName') ?? '');
    panelForm.energyUnit = decodeURIComponent(FGetQueryParam('energyUnit') ?? '');
    panelForm.date = decodeURIComponent(FGetQueryParam('date') ?? '');
    panelForm.timeUnit = decodeURIComponent(FGetQueryParam('timeUnit') ?? '');
  }
};
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
  landscapeFlag.value = false;

  // 地址栏传参代表节点选择后跳转，不需要初始化了
  if (!FGetQueryParam('treeId')) {
    panelForm.date = formatDate(new Date(), 'yyyy-MM-dd');
    panelForm.timeUnit = Common_ETimeUnit.日;
    await init();
  } else {
    mapUrlParams();
  }
  if (mapPageNormal()) {
    queryDetail();
  }
  // 初始化调用complete方法
  nextTick(() => {
    if (zPagingRef.value) {
      setTimeout(() => {
        zPagingRef.value?.complete();
      }, 1000);
    }
  });
});
/**
 * 页面销毁
 */
onHide(() => {
  offWatchNetworkStatus;
});
</script>
<style lang="scss" scoped>
.energy-analysis {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-size: contain;
  background-position: top center;
  background-repeat: no-repeat;
  transition: none;
  background-color: var(--tem-bg-color-page);

  :deep(.z-paging-content) {
    .uni-scroll-view-content {
      min-height: 100%;
    }

    .zp-paging-container-content {
      flex: auto;
      display: flex;
      flex-direction: column;
    }

    .common-navigation-bar {
      .uni-navbar__header-btns-right svg {
        width: 48rpx;
        height: 48rpx;
      }
    }

    .ea-panel {
      display: flex;
      flex-direction: column;

      position: relative;
      width: 100%;

      // 图标
      .ea-panel-icon {
        position: absolute;
        right: 32rpx;
        bottom: 120rpx;

        img {
          width: 214rpx;
          height: 200rpx;
        }
      }

      .ea-panel-tree {
        padding: 24rpx 32rpx 16rpx;
        color: var(--tem-color-white);
        z-index: 999;

        .ea-panel-tree-name {
          font-size: var(--tem-font-size-h20);
          font-weight: 600;
          line-height: 56rpx;
          padding: 26rpx 0;
          max-width: 452rpx;
        }

        .ea-panel-tree-parent {
          font-size: var(--tem-font-size-b14);
          color: var(--tem-color-white);
          line-height: 44rpx;
        }

        &.ea-panel-has-parent {
          .ea-panel-tree-name {
            padding: 0;
          }

          .ea-panel-tree-parent {
            margin-top: 16rpx;
          }
        }
      }

      :deep(.ec-energy-tab) {
        padding: 32rpx 0;

        .eet-item {
          width: 128rpx;
        }
      }

      .ea-panel-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24rpx 32rpx;
        margin-top: 16rpx;
        border-radius: 32rpx 32rpx 0 0;
        background: linear-gradient(89.99deg, rgba(231, 247, 255, 1) 0.01%, rgba(249, 250, 254, 1) 99.99%);
        background-image: url('../../assets/images/energy-analysis/ea-panel-bottom-bg.svg');
        background-size: cover;
        background-position: top center;
        background-repeat: no-repeat;
        transition: none;

        .ea-panel-bottom-energy {
          font-size: 32rpx;
          color: var(--tem-text-color-primary);
          font-family: PingFang SC;
          font-weight: 600;
          font-size: 32rpx;
          line-height: 48rpx;
        }

        .ea-panel-bottom-center {
          display: flex;
          align-items: center;
          font-size: 28rpx;
          color: var(--tem-text-color-regular);
          line-height: 44rpx;
          gap: 16rpx;
        }
      }
    }

    .ea-error {
      flex: auto;
    }

    &.is-landscape {
      transition: none;

      .ea-panel-tree,
      .ec-energy-tab,
      .ea-panel-bottom,
      .ea-scan {
        display: none;
      }
    }
  }
}
</style>
