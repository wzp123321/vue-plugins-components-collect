<template>
  <view
    class="energy-saving-assessment"
    :style="{
      'background-image':
        mapPageNormal() && !esaService.loadError
          ? esaService.mapBackgroundImageByEnergyCode(esaService.detailInfo?.waringCode ?? '').bgImage
          : '',
    }"
  >
    <view class="esa-container">
      <z-paging
        :auto="false"
        ref="zPagingRef"
        :refresher-only="true"
        :lower-threshold="'300rpx'"
        @onRefresh="handlePullDownRefresh"
      >
        <!-- 顶部导航栏 -->
        <template #top>
          <common-navigation-bar
            title="节能考核"
            :nativeFlag="false"
            :statusBar="true"
            :backgroundColor="navigatorStyle.backgroundColor"
            :color="navigatorStyle.color"
          >
            <template v-slot:right>
              <icon-filter v-if="mapPageNormal() && !esaService.loadError" @click="openEsaFilter" />
            </template>
          </common-navigation-bar>
        </template>
        <!-- 自定义下拉刷新view(如果use-custom-refresher为true且不设置下面的slot="refresher"，此时不用获取refresherStatus，会自动使用z-paging自带的下拉刷新view) -->
        <template #refresher="{ refresherStatus }">
          <common-refresher
            :refresherStatus="refresherStatus"
            :transparentFlag="mapPageNormal() && !esaService.loadError"
          ></common-refresher>
        </template>

        <!-- 头部栏 -->
        <view class="esa-header" v-if="mapPageNormal() && !esaService.loadError">
          <view class="esa-header-left">
            <text>{{ esaService.detailInfo?.treeName }}</text>
            <text v-if="esaService.detailInfo?.treePath">{{ '(' + esaService.detailInfo?.treePath + ')' }}</text>
          </view>
          <view
            class="esa-header-right"
            :style="{
              'background-image':
                esaService.mapBackgroundImageByEnergyCode(esaService.detailInfo?.waringCode ?? '').tabImage ?? '',
            }"
          ></view>
        </view>
        <!-- 内容区域 -->
        <view class="esa-content" v-if="mapPageNormal() && !esaService.loadError">
          <view class="esa-content-chart">
            <view>
              <view class="esa-content-chart-item">
                <text>{{
                  mapTitleText(esaService.detailInfo?.energyName ?? '', esaService.detailInfo?.unit ?? '')
                }}</text>
                <text>{{ thousandSeparation(esaService.detailInfo?.energyValue ?? null) }}</text>
              </view>
              <view class="esa-content-chart-picker">
                <view @click="showDatePopup">
                  <view>{{ esaService.date }}</view>
                  <view class="esa-content-chart-picker-icon"><icon-down /></view>
                </view>
              </view>
            </view>
            <!-- 图表区域 -->
            <view class="esa-content-chart-wrap" v-if="esaService.detailInfo?.percentValue">
              <qiun-data-charts type="arcbar" :opts="opts" :update="true" :chartData="chartData" />
              <view v-if="!!chartData" class="esa-content-chart-data">
                <text>{{ percentVal }}</text>
                <text>定额使用情况</text>
              </view>
            </view>
            <view v-else class="esa-no-data">暂无数据</view>
          </view>
          <!-- 列表区域 -->
          <view class="esa-content-list">
            <view
              v-if="esaService.detailInfo?.suggest"
              class="esa-content-list-header"
              :style="{
                'background-image':
                  esaService.mapBackgroundImageByEnergyCode(esaService.detailInfo?.waringCode ?? '').headImage ?? '',
              }"
            >
              <text :style="tipTxtStyle.colorStyle">{{ esaService.detailInfo?.suggest ?? '' }}</text>
            </view>
            <view class="esa-content-list-container">
              <view class="esa-content-list-item">
                <text>
                  {{ mapTitleText('定额总量', esaService.detailInfo?.unit ?? '') }}
                </text>
                <text>{{ thousandSeparation(esaService.detailInfo?.quotaValue ?? null) }}</text>
              </view>
              <view class="esa-content-list-item">
                <text>
                  {{ mapTitleText('能耗累计', esaService.detailInfo?.unit ?? '') }}
                </text>
                <text>{{ thousandSeparation(esaService.detailInfo?.energyValue ?? null) }}</text>
              </view>
              <view
                class="esa-content-list-item"
                v-if="esaService.detailInfo?.energyCode !== Common_EEnergyCode.总能耗"
              >
                <text>{{
                  esaService.detailInfo?.waringCode === ESA_EStatus.超支 ? '超出成本(元)' : '节约成本(元)'
                }}</text>
                <text :class="esaService.detailInfo?.waringCode === ESA_EStatus.超支 ? 'esa-error-value' : ''">{{
                  thousandSeparation(esaService.detailInfo?.savingCost ?? null)
                }}</text>
              </view>
              <view class="esa-content-list-item">
                <text>{{
                  esaService.detailInfo?.waringCode === ESA_EStatus.超支
                    ? mapTitleText('超出能耗量', esaService.detailInfo?.unit ?? '')
                    : mapTitleText('节能量', esaService.detailInfo?.unit ?? '')
                }}</text>
                <text :class="esaService.detailInfo?.waringCode === ESA_EStatus.超支 ? 'esa-error-value' : ''">{{
                  thousandSeparation(esaService.detailInfo?.savingValue ?? null)
                }}</text>
              </view>
            </view>
          </view>
        </view>
        <!-- 缺省状态 -->
        <view class="esa-error" v-if="!mapPageNormal()">
          <!-- 网络异常缺省 -->
          <common-network-error v-if="mapPageNetworkError()" @refresh="handleRefresh"></common-network-error>
          <!-- 加载失败-任意接口报错都出现 -->
          <common-load-error v-if="esaService.loadError" @refresh="handleRefresh"></common-load-error>
          <!-- 暂无权限 -->
          <common-no-permission v-if="mapPageNoPermission()"></common-no-permission>
        </view>
      </z-paging>
      <!-- 时间 -->
      <view>
        <!-- 普通弹窗 -->
        <uni-popup ref="popupRef" type="bottom">
          <view class="esa-popup">
            <view class="esa-popup-header">
              <text>日期范围</text>
              <icon-close class="esa-close" @click="closePopup" />
            </view>
            <view class="esa-popup-radio">
              <text>维度</text>
              <view>
                <radio-group @change="radioChange">
                  <label class="radio"
                    ><radio value="month" :checked="esaService.fieldType === ESA_EFieldType.本月" />月</label
                  >
                  <label class="radio"
                    ><radio value="year" :checked="esaService.fieldType === ESA_EFieldType.本年" />年</label
                  >
                </radio-group>
              </view>
            </view>
            <view class="esa-popup-date">
              <text>选择日期</text>
              <tem-dateTimePicker mode="date" :value="date" :fields="esaService.fieldType" @change="bindDateChange">
                <view class="ea-panel-bottom-center">
                  <text>{{ date }}</text>
                  <IconDown></IconDown>
                </view>
                <template #headerTitle>
                  <text>选择日期</text>
                </template>
              </tem-dateTimePicker>
            </view>
            <view class="esa-popup-btn">
              <text @click="reset">重置</text>
              <text @click="confirm">确定</text>
            </view>
          </view>
        </uni-popup>
      </view>
      <!-- 筛选 -->
      <esa-filter ref="esaFilter" @submit="handleSubmit"></esa-filter>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';
import esaService from './energy-saving-assessment.service';
import {
  ESA_EDateType,
  ESA_EFieldType,
  ESA_EStatus,
  type ESA_IDetailParam,
  type ESA_INavigatorStyle,
  type ESA_ISearchParam,
} from './energy-saving-assessment.api';
import { IconFilter, IconDown, IconClose, IconRight } from '@arco-iconbox/vue-tem';
import { onHide, onLoad, onShow } from '@dcloudio/uni-app';
import {
  floatMultiply,
  getSystemTime,
  handlePageTo,
  mapAdaptiveKeyboard,
  mapStatusBarHide,
  thousandSeparation,
} from '@/utils';
import { TemDateTimePicker } from '@tiansu/ts-mobile-package';
import EsaFilter from './esa-filter/esa-filter.vue';
import { Common_EEnergyCode, Common_EPageErrorType } from '@/config/enum';
import { mapStatusColor } from '../quota-management/utils';
import { usePageErrorController } from '../../hook/index';

const {
  onWatchNetworkStatus,
  offWatchNetworkStatus,
  setPageStatus,
  mapPageNormal,
  mapPageNetworkError,
  mapPageNoPermission,
} = usePageErrorController();

const date = ref(esaService.getDate());
const percentVal = computed(() => {
  return esaService.detailInfo?.percentValue ? floatMultiply(esaService.detailInfo?.percentValue, 100) + '%' : '-';
});

/**
 * 返回标题
 * @param txt
 * @param unit
 */
const mapTitleText = (txt: string, unit: string) => {
  return unit ? `${txt}(${esaService.detailInfo?.unit ?? ''})` : `${txt}`;
};

/**
 * 刷新
 */
const handleRefresh = () => {
  updateNavigatorStyle();
  getServerData();
};

const navigatorStyle = reactive<ESA_INavigatorStyle>({
  backgroundColor: 'transparent',
  color: 'var(--tem-color-white)',
});

/**
 * 判断是否需要透明样式
 * @returns {void}
 */
const updateNavigatorStyle = (): void => {
  // 没有接口报错没有缺省没有断网
  const flag = mapPageNormal();
  navigatorStyle.backgroundColor = flag ? 'transparent' : 'var(--tem-color-white)';
  console.log('%c🚀 ~ energy-saving-assessment.vue ~ 267行', 'font-size: 18px', navigatorStyle);
  navigatorStyle.color = flag ? 'var(--tem-color-white)' : 'var(--tem-text-color-primary)';
};

const detailData = reactive<ESA_IDetailParam>({
  treeId: null,
  treeType: '1',
  quotaType: ESA_EDateType.本月,
  quotaDate: esaService.getDate(),
  energyCode: '01000',
});

// 下拉刷新组件实例
const zPagingRef = ref();
/**
 * 下拉刷新
 * @returns {void}
 */
const handlePullDownRefresh = async () => {
  if (zPagingRef.value) {
    await getServerData();
    zPagingRef.value?.complete();
  }
};

/**
 * 处理筛选
 */
const handleSubmit = (data: ESA_ISearchParam) => {
  console.log('%c🚀 ~ energy-saving-assessment.vue ~ 293行', 'font-size: 18px', data);
  esaService.searchParam.energyCode = data.energyCode;
  esaService.searchParam.quotaTime = data.quotaTime;
  esaService.searchParam.quotaType = data.quotaType;
  esaService.searchParam.treeId = data.treeId;

  detailData.energyCode = data.energyCode;
  detailData.quotaType = data.quotaType;
  detailData.quotaDate = data.quotaTime;
  detailData.treeId = Number(data.treeId);

  date.value = data.quotaTime;
  esaService.date = data.quotaTime;
  esaService.fieldType = data.quotaType === ESA_EDateType.本月 ? ESA_EFieldType.本月 : ESA_EFieldType.本年;
  getServerData();
};

const esaFilter = ref();
const openEsaFilter = () => {
  esaFilter.value?.openPopup(detailData);
};

const opts = reactive({
  title: {
    name: '',
    fontSize: 32,
    color: '#303133',
  },
  subtitle: {
    name: '',
    fontSize: 16,
    color: '#909399',
    offsetY: 32,
  },
  extra: {
    arcbar: {
      type: 'default',
      width: 8,
      backgroundColor: '#e6e8eb',
      gap: 2,
    },
  },
});
const chartData = ref<any>();
const getServerData = async () => {
  try {
    uni.showLoading({
      title: '加载中...',
    });
    await esaService.getDetailData();
    if (esaService.detailInfo) {
      setPageStatus(Common_EPageErrorType.正常加载);
    } else {
      setPageStatus(Common_EPageErrorType.加载失败);
    }
    let res = {
      series: [
        {
          color: mapStatusColor(esaService.detailInfo?.waringCode ?? ''),
          data: esaService.detailInfo?.percentValue
            ? esaService.detailInfo?.percentValue >= 1
              ? 1
              : esaService.detailInfo?.percentValue
            : 0,
        },
      ],
    };
    chartData.value = JSON.parse(JSON.stringify(res));
    updateNavigatorStyle();
  } catch (error) {
    updateNavigatorStyle();
  } finally {
    uni.hideLoading();
  }
};

/**
 * 确定时间
 * @param e
 */
const bindDateChange = (e: any) => {
  date.value = e.detail.value;
};

const popupRef = ref();

/**
 * 打开弹出层
 */
const showDatePopup = () => {
  popupRef.value?.open();
  date.value = esaService.date;
  esaService.fieldType = detailData?.quotaType === ESA_EDateType.本年 ? ESA_EFieldType.本年 : ESA_EFieldType.本月;
};

/**
 * 关闭弹出层
 */
const closePopup = () => {
  popupRef.value?.close();
};

/**
 * 确定
 */
const confirm = () => {
  esaService.date = date.value;
  esaService.searchParam.quotaTime = date.value;
  esaService.searchParam.quotaType =
    esaService.fieldType === ESA_EFieldType.本年 ? ESA_EDateType.本年 : ESA_EDateType.本月;
  detailData.quotaDate = date.value;
  detailData.quotaType = esaService.fieldType === ESA_EFieldType.本月 ? ESA_EDateType.本月 : ESA_EDateType.本年;
  popupRef.value?.close();
  getServerData();
};

/**
 * 重置
 */
const reset = () => {
  esaService.fieldType = detailData?.quotaType === ESA_EDateType.本年 ? ESA_EFieldType.本年 : ESA_EFieldType.本月;
  date.value = esaService.getDate(detailData?.quotaType);
  // date.value = esaService.date;
  // esaService.fieldType = detailData?.quotaType === ESA_EDateType.本年 ? ESA_EFieldType.本年 : ESA_EFieldType.本月;
};
/**
 *维度变化
 * @param evt
 */
const radioChange = (evt: any) => {
  esaService.fieldType = evt.detail.value;
  if (esaService.fieldType === ESA_EFieldType.本年) {
    date.value = new Date().getFullYear().toString();
  } else {
    date.value = esaService.getDate();
  }
};

/**
 * 根据状态显示对应的提示语
 */
const tipTxtStyle = computed(() => {
  let str,
    color = '';
  switch (esaService.detailInfo?.waringCode) {
    case ESA_EStatus.盈余:
      color = 'var(--tem-color-success)';
      break;
    case ESA_EStatus.警告:
      color = 'var(--tem-color-warning)';
      break;
    case ESA_EStatus.超支:
      color = 'var(--tem-color-danger)';
      break;
    default:
      break;
  }
  return {
    colorStyle: {
      color: color,
    },
  };
});

/**
 * 页面加载
 */
onShow(async () => {
  // 隐藏状态栏
  mapStatusBarHide();
  // 适配原生键盘
  mapAdaptiveKeyboard();
  onWatchNetworkStatus(() => {
    updateNavigatorStyle();
  });
});

onLoad(async (options) => {
  await getSystemTime();

  detailData.energyCode = esaService.searchParam.energyCode = options?.energyCode;
  detailData.quotaDate = esaService.searchParam.quotaTime = esaService.getDate(options?.quotaType);
  detailData.quotaType = esaService.searchParam.quotaType = options?.quotaType;
  detailData.treeId = esaService.searchParam.treeId = options?.treeId;
  esaService.date = esaService.getDate(options?.quotaType);
  getServerData();
  onWatchNetworkStatus(() => {
    updateNavigatorStyle();
  });
});

onHide(() => {
  offWatchNetworkStatus;
});
</script>
<style lang="scss" scoped>
.energy-saving-assessment {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  // 2024-0111-修改
  background-size: auto;
  background-position: top center;
  background-repeat: no-repeat;
  background-color: #f2f3f5;

  :deep(.uni-navbar__header-btns-right) {
    font-size: 48rpx;
  }
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

  .esa-container {
    position: relative;
    flex: auto;
    width: 100%;
    display: flex;
    flex-direction: column;

    transition: none;
  }
  //头部
  .esa-header {
    min-height: 156rpx;
    padding: 24rpx 32rpx 16rpx;
    flex: none;
    display: flex;
    gap: 20rpx;
    align-items: center;
    box-sizing: border-box;
    &-left {
      height: 100%;
      flex: auto;
      width: 0;
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      color: var(--tem-color-white);
      uni-text:nth-child(1) {
        white-space: wrap;
        font-size: var(--tem-font-size-h20);
        font-weight: 600;
      }
      uni-text:nth-child(2) {
        // height: 44rpx;
        // line-height: 44rpx;
        font-size: var(--tem-font-size-b14);
        // white-space:;
        opacity: 0.8;
      }
    }
    &-right {
      height: 108rpx;
      width: 128rpx;
      margin-right: 20rpx;
      background-repeat: no-repeat;
      background-size: 100%;
      flex: none;
    }
  }
  // 内容区域
  .esa-content {
    flex: auto;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    padding: 16rpx 32rpx;
    // 图表区域
    &-chart {
      height: 564rpx;
      border-radius: 16rpx;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(100rpx);
      box-sizing: border-box;
      background: linear-gradient(180deg, #ffffff33 0%, #ffffff80 50.52%, #ffffff 100%);
      box-shadow: 8rpx 0px 40rpx #00000008;
      padding: 24rpx 32rpx;
      box-sizing: border-box;
      > uni-view:nth-child(1) {
        height: 100rpx;
        box-sizing: border-box;
        flex: none;
        display: flex;
        gap: 20rpx;
      }
      > uni-view:nth-child(2) {
        flex: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 416rpx;
      }
      &-item {
        display: flex;
        flex-direction: column;
        flex: auto;
        width: 0;
        gap: 8rpx;
        uni-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        > uni-text:nth-child(1) {
          display: inline-block;
          height: 44rpx;
          line-height: 44rpx;
          color: var(--tem-text-color-regular);
          font-size: var(--tem-font-size-b14);
        }
        > uni-text:nth-child(2) {
          display: inline-block;
          height: 48rpx;
          line-height: 48rpx;
          color: var(--tem-text-color-primary);
          font-size: var(--tem-font-size-oh24);
          font-family: D-DIN;
        }
      }
      &-picker {
        font-size: 28rpx;
        flex: none;
        position: relative;
        > uni-view {
          display: flex;
          align-items: center;
          gap: 16rpx;
        }
      }

      //图表容器
      &-wrap {
        position: relative;
      }
      //图表标题
      &-data {
        width: 224rpx;
        height: 112rpx;
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        right: 0;
        top: 0;
        bottom: 0;
        left: 0;
        margin: auto;
        text:nth-child(1) {
          font-family: D-DIN;
          color: var(--te-text-color-primary);
          font-size: var(--tem-font-size-oh32);
          font-weight: 600;
        }
        text:nth-child(2) {
          font-family: D-DIN;
          color: var(--tem-text-color-secondary);
          font-size: var(--tem-font-size-b16);
        }
      }
    }
    // 列表区域
    &-list {
      // height: 592rpx;
      border-radius: 16rpx;
      background-color: var(--tem-bg-color);
      display: flex;
      flex-direction: column;
      &-header {
        height: 144rpx;
        border-radius: 16rpx 16rpx 0 0;
        flex: none;
        padding-left: 32rpx;
        background-repeat: no-repeat;
        background-size: 100%;
        :deep(> text) {
          display: inline-flex;
          font-size: var(--tem-font-size-b14);
          height: 88rpx;
          width: 80%;
          align-items: center;
          margin: 36rpx 0 20rpx 0;
          color: var(--tem-color-success);
        }
      }
      &-container {
        height: 448rpx;
        display: flex;
        flex-direction: column;
        flex: auto;
      }
      &-item {
        flex: 1;
        padding: 0 32rpx;
        border-bottom: 1rpx solid var(--tem-border-color-light);
        display: flex;
        align-items: center;
        justify-content: space-between;
        > uni-text {
          color: var(--tem-text-color-regular);
          font-size: var(--tem-font-size-b16);
        }
      }
      .esa-error-value {
        color: var(--tem-color-danger);
      }
    }
  }

  //默认错误样式
  .esa-error {
    flex: auto;
  }
  .esa-no-data {
    font-size: var(--tem-font-size-b14);
    color: var(--tem-text-color-secondary);
  }

  //弹出层
  .esa-popup {
    border-radius: 24rpx 24rpx 0px 0px;
    background: var(--tem-bg-color);
    padding: 0 32rpx;
    &-header {
      height: 116rpx;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      uni-text {
        padding: 32rpx 0;
        height: 52rpx;
        font-weight: 600;
        font-size: var(--tem-font-size-h18);
        display: inline-flex;
        align-items: center;
      }
      .esa-close {
        height: 48rpx;
        width: 48rpx;
        position: absolute;
        right: 0;
      }
    }
    &-radio,
    &-date {
      height: 112rpx;
      font-size: var(--tem-font-size-b16);
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2rpx solid var(--tem-border-color-light);
      uni-radio-group {
        display: flex;
        gap: 48rpx;
      }
      :deep(.uni-radio-input) {
        width: 40rpx;
        height: 40rpx;
      }
      :deep(.radio) {
        display: flex;
        align-items: center;
      }
    }
    &-date {
      :deep(uni-picker > div:last-child) {
        display: flex;
        align-items: center;
        uni-view:nth-child(1) {
          font-size: var(--tem-font-size-b16);
        }
      }
      .esa-popup-icon {
        width: 48rpx;
        height: 48rpx;
        font-size: 48rpx;
        display: flex;
        align-items: center;
      }
    }
    &-btn {
      height: 160rpx;
      gap: 32rpx;
      padding: 32rpx 0;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      > uni-text {
        flex: 1;
        height: 100%;
        font-weight: 600;
        border-radius: 8rpx;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: var(--tem-font-size-b16);
      }
      > uni-text:nth-child(1) {
        color: var(--tem-text-color-regular);
        border: 2rpx solid var(--tem-border-color);
      }
      > uni-text:nth-child(2) {
        background-color: var(--tem-color-primary);
        color: var(--tem-color-white);
      }
    }
  }
}
</style>
