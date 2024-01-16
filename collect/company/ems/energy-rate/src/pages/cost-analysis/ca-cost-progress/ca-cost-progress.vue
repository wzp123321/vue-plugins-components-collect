<template>
  <div class="ca-cost-progress">
    <div class="ccp-container">
      <div class="ccp-data">
        <div
          class="ccp-item"
          v-for="(item, index) in costList"
          :key="index"
          :style="{ width: `${item.rate}%`, backgroundColor: item.color }"
          @mouseenter.stop="onItemMouseEnter(index)"
        ></div>
      </div>
      <div class="ccp-tooltip" v-show="item.show" v-for="(item, index) in tooltipList" :key="index">
        <div class="ccp-tooltip-arrow" :style="{ left: `${item.arrowLeft}px` }">
          <em :style="{ 'border-top-color': item.color }"></em>
          <span></span>
        </div>
        <span class="ccp-tooltip-body" :style="{ left: `${item.bodyLeft}px`, borderColor: item.color }">{{
          item.tooltipLabel
        }}</span>
      </div>
    </div>
    <ul class="ccp-legend">
      <li v-for="item in legendList" :key="item.energyCode">
        <em :style="{ backgroundColor: item.color }"></em>
        <span>{{ item.energyName }}</span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { PropType, onMounted, ref } from 'vue';
import { cloneDeep } from 'lodash';
import { mapTextWidth, thousandSeparation } from '../../../utils/index';

import { CA_IStripDataVO, mapEnergyColor } from '../cost-analysis.api';
import { CCP_IRateVO, CCP_ILegendVO } from './ca-cost-progress.api';

const props = defineProps({
  total: {
    type: Number,
    default: 0,
  },
  dataSource: {
    type: Array as PropType<CA_IStripDataVO[]>,
    default: [],
  },
});
// 成本列表
const costList = ref<CCP_IRateVO[]>([]);
// tooltip列表
const tooltipList = ref<CCP_IRateVO[]>([]);
// 图例列表
const legendList = ref<CCP_ILegendVO[]>([]);
/**
 * item鼠标移入
 * @param index
 */
const onItemMouseEnter = (index: number) => {
  // 重置状态
  tooltipList.value = tooltipList.value.map((item) => {
    return {
      ...item,
      show: false,
    };
  });
  tooltipList.value[index].show = true;
};
/**
 *生成成本列表
 */
const mapCostList = () => {
  let clone_data = cloneDeep(props.dataSource);
  // 进行排序
  clone_data = clone_data.sort((a: CA_IStripDataVO, b: CA_IStripDataVO) => {
    return (b.totalCost as number) - (a.totalCost as number);
  });

  let total_rate = 0;
  costList.value = props.dataSource.map((item, index) => {
    // 容器层宽度
    const container_width = document.querySelector('.ca-cost-progress')?.scrollWidth as number;
    // tooltip文本
    const energy_label = item.energyName.indexOf('其他') !== -1 ? '其他' : item.energyName;
    const tooltipLabel = `${energy_label}：${thousandSeparation(item.tenThousandCost)}${item.unit}`;
    // tooltip文本宽度= 文本宽度+padding+border
    const tooltip_abel_width = mapTextWidth(tooltipLabel, '14px', '500') + 10 * 2 + 1 * 2;
    // 颜色
    const color = mapEnergyColor(item.energyCode);
    // 占比
    const rate = ((item.totalCost as number) / props.total) * 100;
    // 前面累加的占比
    total_rate += rate;
    // 当前item的left百分比
    const current_left = total_rate - rate / 2;
    // 当前item中间位置的距离
    const current_left_PX = (container_width * current_left) / 100;
    // 内容区的left
    let bodyLeft = current_left_PX - tooltip_abel_width / 2;
    // 尖角的left
    const arrowLeft = current_left_PX;

    // 如果当前tooltip的位置+半个自身宽度超出屏幕
    if (arrowLeft + tooltip_abel_width / 2 >= container_width) {
      bodyLeft = container_width - tooltip_abel_width + 12;
    }

    return {
      ...item,
      rate,
      tooltipLabel,
      show: index === 0,
      color,
      bodyLeft,
      arrowLeft,
    };
  });
  tooltipList.value = cloneDeep(costList.value);
};
/**
 * 生成图例列表
 */
const mapLegendList = () => {
  legendList.value = props.dataSource.map((item) => {
    const color = mapEnergyColor(item.energyCode);
    return {
      ...item,
      color,
    };
  });
};
// 初始化
onMounted(() => {
  mapCostList();
  mapLegendList();
});
</script>
<style lang="less" scoped>
.ca-cost-progress {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  position: relative;
  height: 100%;
  margin: 0 24px;
  font-size: 14px;

  .ccp-container {
    position: relative;
    width: 100%;
    .ccp-data {
      display: flex;
      position: relative;
      width: 100%;
      height: 16px;
      margin-top: 10px;
      border-radius: 32px;
      background-color: #ccc;
      cursor: pointer;
      overflow: hidden;
    }

    .ccp-item {
      height: 24px;
      animation: width 500ms;
    }

    .ccp-tooltip {
      .ccp-tooltip-body {
        position: absolute;
        bottom: 30px;
        left: 50%;

        padding: 5px 10px;
        border: 1px solid #06a5ff;
        border-radius: 5px;
        background-color: #e5edfa;
        font-size: 14px;
        white-space: nowrap;
      }

      .ccp-tooltip-arrow {
        position: absolute;
        width: 16px;
        height: 16px;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2;
      }

      .ccp-tooltip-arrow * {
        display: block;
        border-width: 8px;
        position: absolute;
        border-style: solid dashed dashed dashed;
        font-size: 0;
        line-height: 0;
      }

      .ccp-tooltip-arrow em {
        border-color: #06a5ff transparent transparent;
      }

      .ccp-tooltip-arrow span {
        border-color: #ebf3ff transparent transparent;
        top: -1px;
      }
    }
  }
  .ccp-legend {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    gap: 16px;

    li {
      list-style: none;

      em {
        display: inline-block;
        width: 20px;
        margin-right: 5px;
        height: 10px;
      }

      span {
        color: var(--te-text-color-regular);
        font-size: var(--te-font-size-b14);
      }
    }
  }
  @keyframes width {
    from {
      width: 0;
    }
  }
}
</style>
