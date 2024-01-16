<!--
 * @Author: yut
 * @Date: 2023-11-02 10:22:21
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-12 14:26:27
 * @Descripttion: 
-->
<template>
  <view class="ec-detail-card">
    <!-- 标签 -->
    <view :class="[tagStickyFlag ? 'is-fixed' : '', 'edc-tag']">
      <view>
        <text
          v-for="tag in tagList"
          @click="selectTag(tag.code)"
          :key="tag.code"
          :class="edcService.tagCode === tag.code ? 'edc-tag-active' : ''"
          >{{ tag.name }}</text
        >
        <view class="edc-more-icon" @click="showMoreTag"><icon-view-list /></view>
      </view>
    </view>
    <!-- 详细内容 -->
    <view class="edc-body">
      <view class="edc-body-container">
        <view class="edc-body-header">
          <text>总览</text>
          <view @click="goToDetail">
            <text>查看详情</text>
            <icon-right />
          </view>
        </view>
        <view class="edc-body-content">
          <view class="edc-body-content-card">
            <view>
              <view>
                <text>
                  {{ '能耗值' + (detailItemInfo?.energyUnit ? '(' + detailItemInfo?.energyUnit + ')' : '') }}
                </text>
              </view>
              <view class="edc-body-content-card-value">
                <text>{{ thousandSeparation(detailItemInfo?.energyValue ?? null) }}</text>
              </view>
              <view v-if="showPercent">
                <text>同比</text>
                <view v-if="detailItemInfo?.lastYearPercent" class="edc-body-percent">
                  <view :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastYearPercent)">
                    <component :is="mapComponent(detailItemInfo?.lastYearPercent)"></component>
                  </view>
                  <text :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastYearPercent)">{{
                    (detailItemInfo?.lastYearPercent ?? '-') + '%'
                  }}</text>
                </view>
                <view v-else>-</view>
              </view>
              <view v-if="showPercent">
                <text>环比</text>
                <view v-if="detailItemInfo?.lastMonthPercent" class="edc-body-percent">
                  <view :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastMonthPercent)">
                    <component :is="mapComponent(detailItemInfo?.lastMonthPercent)"></component>
                  </view>
                  <text :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastMonthPercent)">
                    {{ (detailItemInfo?.lastMonthPercent ?? '-') + '%' }}
                  </text>
                </view>
                <view v-else>-</view>
              </view>
            </view>
            <view>
              <view><text>成本(万元)</text></view>
              <view class="edc-body-content-card-value">
                <text>{{ detailItemInfo?.costValue ?? '-' }}</text>
              </view>
              <view v-if="showPercent">
                <text>同比</text>
                <view v-if="detailItemInfo?.lastYearCostPercent" class="edc-body-percent">
                  <view :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastYearCostPercent)">
                    <component :is="mapComponent(detailItemInfo?.lastYearCostPercent)"></component>
                  </view>
                  <text :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastYearCostPercent)">
                    {{ (detailItemInfo?.lastYearCostPercent ?? '-') + '%' }}
                  </text>
                </view>
                <view v-else>-</view>
              </view>
              <view v-if="showPercent">
                <text>环比</text>
                <view v-if="detailItemInfo?.lastMonthCostPercent" class="edc-body-percent">
                  <view :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastMonthCostPercent)">
                    <component :is="mapComponent(detailItemInfo?.lastMonthCostPercent)"></component
                  ></view>
                  <text :class="'edc-body-content-' + mapClassName(detailItemInfo?.lastMonthCostPercent)">{{
                    (detailItemInfo?.lastMonthCostPercent ?? '-') + '%'
                  }}</text>
                </view>
                <view v-else>-</view>
              </view>
            </view>
          </view>
          <view class="edc-body-content-chart" v-if="detailItemInfo?.hasChildren">
            <view class="edc-body-content-chart-box">
              <qiun-data-charts
                type="ring"
                :opts="opts"
                :animation="animation"
                :chartData="chartData"
                tooltipFormat="ringTooltipFormatPercent"
              />
            </view>
            <view class="edc-body-content-chart-legend">
              <ec-legend :legendData="legendData" :colorList="colorList" @legend-select="tapLegend"></ec-legend>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 弹出层 -->
    <!-- 普通弹窗 -->
    <uni-popup ref="popupRef" type="bottom">
      <view class="edc-popup">
        <view class="edc-popup-header">
          <text>选择节点</text>
          <icon-close class="edc-close" @click="closePopup" />
        </view>
        <view class="edc-popup-content">
          <view
            v-for="tag in tagList"
            :class="edcService.tagCode === tag.code ? 'edc-tag-active' : ''"
            :key="tag.code"
            @click="selectTag(tag.code)"
          >
            <text>{{ tag.name }}</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>
<script lang="ts" setup>
import { IconRight, IconTop, IconBottom, IconClose, IconViewList } from '@arco-iconbox/vue-tem';
import { computed, onMounted, reactive, ref, type PropType, watch, onBeforeMount } from 'vue';
import edcService from './ec-detail-card.service';
import ecLegend from './ec-legend/ec-legend.vue';
import { handlePageTo, thousandSeparation } from '@/utils';
import { FGetStorageData } from '@/utils/storage';
import { SESSION_KEY_STATUS_HEIGHT } from '@/config/session-key';
import type { Ec_IConsumptionData, Ec_INodeItem, Ec_ITopPanelForm } from '../energy-consumption.api';
import { CHARTS_COLOR_GROUP_HEX } from '@/config/config';
import type { Ecs_IDetailItem, Ecs_ILegendDataItem } from './ec-detail-card.api';
import { cloneDeep } from 'lodash';
const props = defineProps({
  // 是否吸顶
  tagStickyFlag: {
    type: Boolean,
    default: false,
  },
  //院区列表
  treeList: {
    type: Array as PropType<{ itemId: string; itemName: string }[]>,
  },
  //总览信息
  treeDetail: {
    type: Object as PropType<Ec_IConsumptionData>,
  },
  //当前选择的节点
  checkedCode: {
    type: String,
    default: '',
  },
  // 表单
  topPanelForm: {
    type: Object as PropType<Ec_ITopPanelForm>,
  },
});

/**
 * 是否展示同环比
 */
const showPercent = computed(() => {
  return edcService.getDate() !== props.topPanelForm?.date;
});

watch(
  () => props.checkedCode,
  (val) => {
    edcService.tagCode = val;
  },
  { immediate: true },
);
//详情信息
const detailItemInfo = computed(() => props.treeDetail?.nodeItem);
//吸顶
const stickyHeight = computed(() => {
  const statusH = FGetStorageData(SESSION_KEY_STATUS_HEIGHT) ? Number(FGetStorageData(SESSION_KEY_STATUS_HEIGHT)) : 0;
  return `${44 + uni.upx2px(96) + statusH}px`;
});
//列表
const tagList = computed(() => edcService.convert(props.treeList ?? []));

const popupRef = ref();

/**
 * 判断状态
 * @param value
 */
const mapClassName = (value: number | string | null | undefined) => {
  const val = value ? Number(value) : 0;
  return val <= 0 ? 'success' : 'error';
};

/**
 * 判断使用组件
 * @param value
 */
const mapComponent = (value: number | string | null | undefined) => {
  const val = value ? Number(value) : 0;
  return val <= 0 ? IconBottom : IconTop;
};

//配置项
const opts = reactive({
  color: [],
  padding: [0, 0, 0, 0],
  update: true,
  enableScroll: true,
  legend: {
    show: false,
  },
  subtitle: {},
  extra: {
    ring: {
      ringWidth: 25,
      customRadius: 65,
      activeOpacity: 0.5,
      activeRadius: 10,
      offsetAngle: 0,
      labelWidth: 15,
      border: true,
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
  },
});

//配色
const colorList = ref<string[]>([]);

const chartData = ref<any>();
//图例数据
const legendData = ref<Ecs_IDetailItem[]>([]);
const animation = ref<boolean>(false);

/**
 * 获取环状图数据
 * @param data
 */
const getServerData = (data?: Ec_INodeItem[]) => {
  const cloneData = cloneDeep(data);
  const res = {
    series: [
      {
        data: (cloneData as Ecs_IDetailItem[])?.map((item) => {
          item.labelShow = false;
          item.show = true;
          item.name = item.itemName;
          item.value = Number(item.percentValue);
          return item;
        }),
      },
    ],
  };
  chartData.value = JSON.parse(JSON.stringify(res));
  legendData.value = JSON.parse(JSON.stringify(res.series[0].data));
};

/**
 * 切换图例
 * @param index
 */
const tapLegend = (index: number) => {
  //注意这里关闭了加载动画，不然点击图例会执行动画效果
  animation.value = false;
  legendData.value[index].show = !legendData.value[index].show;
  const data = {
    series: [
      {
        data: legendData.value,
      },
    ],
  };
  // 这里可以看出，只需要动态改变chartData.series.data.show（饼图类）chartData.series.show（其他图）即可动态改变图形显示与隐藏
  chartData.value = JSON.parse(JSON.stringify(data));
};

/**
 * 跳转详情
 */
const goToDetail = () => {
  handlePageTo('/pages/energy-consumption/energy-consumption', {
    treeId: edcService.tagCode,
    queryTime: props.topPanelForm?.date ?? '',
    energyCode: props.topPanelForm?.energyCode ?? '',
  });
};

/**
 *选中标签
 */
const selectTag = (code: string) => {
  edcService.tagCode = code;
  emits('change', code);
  popupRef.value?.close();
};

const emits = defineEmits(['scrollTop', 'change']);

//吸顶滚动距离
const scrollHeight = ref(0);
/**
 * 打开弹窗，滚动吸顶
 */
const showMoreTag = () => {
  popupRef.value?.open();
};

/**
 * 关闭弹窗
 */
const closePopup = () => {
  popupRef.value?.close();
};

onMounted(() => {
  //获取吸顶需要滚动的距离
  const query = uni.createSelectorQuery().in(this);
  query
    .select('.edc-body')
    .boundingClientRect((data: any) => {
      scrollHeight.value = data.top;
    })
    .exec();
});

onBeforeMount(() => {
  getServerData(props.treeDetail?.childrenItem);
  opts.color =
    (props.treeDetail?.childrenItem?.map((item, index) => {
      return CHARTS_COLOR_GROUP_HEX[index % CHARTS_COLOR_GROUP_HEX.length];
    }) as any) ?? [];
  colorList.value = [...colorList.value, ...opts.color];

  edcService.tagCode = props.checkedCode;
});

watch(
  () => props.treeDetail,
  (val) => {
    getServerData(val?.childrenItem);
    opts.color =
      (val?.childrenItem?.map((item, index) => {
        return CHARTS_COLOR_GROUP_HEX[index % CHARTS_COLOR_GROUP_HEX.length];
      }) as any) ?? [];
    colorList.value = [...colorList.value, ...opts.color];
  },
  {
    deep: true,
  },
);
</script>
<style lang="scss" scoped>
.ec-detail-card {
  width: 100%;
  padding-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  // 头部标签栏
  .edc-tag {
    height: 96rpx;
    background-color: var(--tem-color-white);
    flex: none;
    overflow: scroll;
    display: flex;
    align-items: center;
    width: 100%;

    > view {
      padding: 0 32rpx;
      gap: 16rpx;
      display: flex;
      align-items: center;
    }
    text {
      display: flex;
      align-items: center;
      white-space: nowrap;
      padding: 0 32rpx;
      font-size: var(--tem-font-size-b14);
      border-radius: 64rpx;
      height: 64rpx;
      width: fit-content;
      background-color: var(--tem-fill-color);
    }
    &-active {
      background-color: var(--tem-color-primary-light-9) !important;
      color: var(--tem-color-primary) !important;
      font-weight: 600;
    }

    .edc-more-icon {
      position: absolute;
      width: 96rpx;
      height: 96rpx;
      font-size: 48rpx;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--tem-color-white);
    }
  }
  // 头部标签吸顶
  .is-fixed {
    position: fixed;
    left: 0;
    top: v-bind(stickyHeight);
    transition: none;
    z-index: 2;
    border-bottom: 2rpx solid var(--tem-border-color);
    .edc-more-icon {
      position: fixed;
    }
  }
  // 内容区域
  .edc-body {
    flex: auto;
    overflow: hidden;
    background: linear-gradient(180deg, #ffffff 0%, #f1f2f4 100%);
    &-container {
      height: 100%;
      margin: 0 32rpx;
      border-radius: 16rpx;
      background-color: var(--tem-color-white);
    }

    // 内容区域标题
    &-header {
      height: 104rpx;
      padding: 0 32rpx;
      gap: 20rpx;
      display: flex;
      align-items: center;
      > text {
        color: var(--tem-text-color-primary);
        font-size: 32rpx;
        font-weight: 600;
        flex: auto;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      > view {
        flex: none;
        display: flex;
        align-items: center;
        width: 144rpx;
        color: var(--tem-color-primary);
        font-size: 28rpx;
        > text:nth-child(2) {
          font-size: 32rpx;
          display: flex;
          height: 32rpx;
        }
      }
    }

    // 内容区域
    &-content {
      padding: 0 32rpx;
      // 内容区域卡片
      &-card {
        // height: 220rpx;
        display: flex;
        gap: 24rpx;
        padding-bottom: 24rpx;

        .edc-body-content-card-value {
          font-family: D-DIN-DIN-Bold;
        }

        > view {
          flex: 1;
          width: 0;
          gap: 8rpx;
          padding: 16rpx 24rpx;
          border-radius: 8rpx;
          display: flex;
          flex-direction: column;
          background-color: var(--tem-fill-color);
          color: var(--tem-text-color-placeholder);
          view,
          text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          > view:nth-child(1) {
            font-size: var(--tem-font-size-b14);
          }
          > view:nth-child(2) {
            font-size: var(--tem-font-size-oh24);
            color: var(--tem-text-color-primary);
            font-family: D-DIN-DIN-Bold;
          }
          view:nth-child(3),
          view:nth-child(4) {
            font-size: 24rpx;
            display: flex;
            align-items: center;
            text:nth-child(1) {
              margin-right: 8rpx;
            }
          }
        }
      }
      &-success {
        color: var(--tem-color-success);
        display: inline-flex;
        align-items: center;
        font-size: 24rpx;
      }
      &-error {
        color: var(--tem-color-danger);
        display: inline-flex;
        align-items: center;
        font-size: 24rpx;
      }

      //环形图
      &-chart {
        min-height: 272rpx;
        max-height: 380rpx;
        padding-bottom: 24rpx;
        display: flex;
        gap: 25rpx;
        width: 100%;
        overflow: hidden;
        position: relative;
        &-box {
          flex: none;
          width: 300rpx;
        }
        // 图例
        &-legend {
          flex: auto;
          position: relative;

          // display: flex;
          // flex-direction: column;
          // justify-content: center;
          // gap: 8rpx;
          // width: 0;
        }
      }
      .edc-body-percent {
        display: flex;
        align-items: center;
      }
    }
  }
  //弹窗
  .edc-popup {
    &-header {
      height: 116rpx;
      padding: 0 32rpx;
      border-radius: 24rpx 24rpx 0rpx 0rpxpx;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background-color: var(--tem-bg-color);
      uni-text {
        padding: 32rpx 0;
        height: 52rpx;
        font-weight: 600;
        font-size: var(--tem-font-size-h18);
        display: inline-flex;
        align-items: center;
      }
      .edc-close {
        height: 48rpx;
        width: 48rpx;
        position: absolute;
        right: 32rpx;
      }
    }
    &-content {
      width: 100%;
      //min-height: 424rpx;
      max-height: 576rpx;
      padding: 0 32rpx 32rpx;
      overflow: scroll;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(218rpx, 1fr));
      background-color: var(--tem-bg-color);
      gap: 16rpx;
      > view {
        height: 80rpx;
        border-radius: 80rpx;
        padding: 0 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--tem-fill-color);
        color: var(--tem-text-color-regular);
        font-size: var(--tem-font-size-b14);
        text {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
