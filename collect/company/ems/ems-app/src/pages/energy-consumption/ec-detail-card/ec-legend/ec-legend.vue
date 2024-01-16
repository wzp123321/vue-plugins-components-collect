<!--
 * @Author: yut
 * @Date: 2023-12-26 20:45:04
 * @LastEditors: yut
 * @LastEditTime: 2024-01-09 09:51:23
 * @Descripttion: 
-->
<template>
  <view class="ec-legend">
    <view class="ec-legend-list">
      <view
        class="ec-legend-list-container"
        :style="{
          height: perchHeight,
        }"
      >
        <view
          class="legend-item"
          v-for="(item, index) in legendData"
          :key="index"
          :class="[item.show ? '' : 'legend-item-hide']"
          @click="tapLegend(index)"
        >
          <view class="legend-item-tag" :style="mapLegendColor(index)"></view>
          <view class="legend-item-name">{{ item.name ?? '-' }}</view>
          <text class="legend-item-value">{{ item.percent ?? '-' }}</text>
        </view>
      </view>
    </view>
    <view :class="['ec-legend-pagination', mapBtnClass()]" v-if="paginationFlag">
      <view class="ec-legend-pagination-btn is-left" @click="handlePreviousPage">
        <icon-caret-top />
      </view>
      <view class="ec-legend-pagination-page"> {{ currentPage }}/ {{ totalPage }} </view>
      <view class="ec-legend-pagination-btn is-right" @click="handleNextPage">
        <icon-caret-bottom />
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { ref, type PropType, watch, nextTick } from 'vue';
import type { Ecs_IDetailItem, Ecs_ILegendDataItem } from '../ec-detail-card.api';
// 组件
import { IconCaretBottom, IconCaretTop } from '@arco-iconbox/vue-tem';
const props = defineProps({
  legendData: {
    type: Array as PropType<Ecs_IDetailItem[]>,
    default: [],
  },
  colorList: {
    type: Array as PropType<string[]>,
    default: [],
  },
});

// emit
const emit = defineEmits(['legend-select']);
// 是否展示分页器
const paginationFlag = ref<boolean>(false);
// 总页码
const totalPage = ref<number>(1);
// 当前页码
const currentPage = ref<number>(1);
// 容器高度
const perchHeight = ref<string>('auto');
// 图例样式
const mapBtnClass = () => {
  return currentPage.value === 1 ? 'first-page' : currentPage.value === totalPage.value ? 'last-page' : 'center-page';
};

/**
 * 图例背景
 * @param index
 */
const mapLegendColor = (index: number) => {
  return {
    backgroundColor: props.colorList[index % props.colorList.length],
  };
};

const EL_MAX_HEIGHT = 140;

/**
 * 判断是否展示分页器
 */
const calculatePaginationFlag = () => {
  const totalEle = document.querySelector('.ec-legend-list-container') as HTMLElement;
  const listEle = document.querySelector('.ec-legend-list') as HTMLElement;
  if (listEle) {
    listEle.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
  currentPage.value = 1;
  if (totalEle) {
    const totalHeight = 28 * props.legendData.length;
    paginationFlag.value = totalHeight > EL_MAX_HEIGHT;
  } else {
    paginationFlag.value = false;
  }
};

/**
 * 计算分页
 */
const calculatePage = () => {
  const totalEle = document.querySelector('.ec-legend-list-container') as HTMLElement;
  if (totalEle) {
    const totalHeight = 28 * props.legendData.length;
    totalPage.value = Math.ceil(totalHeight / EL_MAX_HEIGHT);
    perchHeight.value = `${totalPage.value * EL_MAX_HEIGHT}px`;
  } else {
    totalPage.value = 1;
  }
};

/**
 * 图例点击
 * @param index
 */
const tapLegend = (index: number) => {
  emit('legend-select', index);
};

/**
 * 向下翻页
 */
const handleNextPage = () => {
  if (currentPage.value < totalPage.value) {
    currentPage.value += 1;
    handleScroll();
  }
};
/**
 * 向上翻页
 */
const handlePreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    handleScroll();
  }
};

/**
 * 处理滚动
 */
const handleScroll = () => {
  const totalEle = document.querySelector('.ec-legend-list') as HTMLElement;
  if (totalEle) {
    totalEle.scrollTo({
      top: (currentPage.value - 1) * EL_MAX_HEIGHT,
      behavior: 'smooth',
    });
  }
};

/**
 * 监听数据变化
 */
watch(
  () => props.legendData,
  () => {
    nextTick(() => {
      calculatePaginationFlag();
      if (paginationFlag.value) {
        setTimeout(() => {
          calculatePage();
        }, 100);
      }
    });
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>
<style lang="scss" scoped>
.ec-legend {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  &-list {
    flex: auto;
    overflow: hidden;
    max-height: 140px;
    .legend-item {
      display: flex;
      align-items: center;
      height: 28px;
      line-height: 28px;
      gap: 4rpx;

      &-tag {
        width: 20rpx;
        height: 20rpx;
        flex: none;
      }

      &-name {
        width: 170rpx;
        flex: none;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        font-size: 24rpx;
        // font-size: var(--tem-font-size-b14);
        color: var(--tem-text-color-regular);
      }
      &-value {
        flex: auto;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        font-size: 24rpx;
        color: var(--tem-text-color-regular);
        // font-family: D-DIN;
      }
      &-hide {
        .legend-item-tag {
          background-color: #aaaaaa !important;
        }
        .legend-item-name,
        .legend-item-value {
          color: #aaaaaa;
        }
      }
    }
  }
  &-pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    // position: absolute;
    // bottom: -24rpx;
    width: 100%;
    text-align: center;
    .ec-legend-pagination-page {
      color: var(--te-text-color-regular);
      font-size: var(--tem-font-size-s12);
    }

    .ec-legend-pagination-btn {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      width: 100%;
      height: 100%;
      color: #c0c4cc;
    }

    &.first-page .is-right svg {
      color: #303133;
    }

    &.last-page .is-left svg {
      color: #303133;
    }

    &.center-page .is-right svg,
    &.center-page .is-left svg {
      color: #303133;
    }
  }
}
</style>
