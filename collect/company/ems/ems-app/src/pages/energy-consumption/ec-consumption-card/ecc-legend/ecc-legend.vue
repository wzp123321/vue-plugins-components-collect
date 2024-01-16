<template>
  <view class="ecc-legend">
    <view class="ecc-legend-list">
      <!-- 窗口区域 -->
      <view class="ecc-legend-list-container">
        <view
          class="ecc-legend-item"
          v-for="(item, index) in props.legendList"
          :key="item.legendId"
          @click="handleLegendSelect(item.selected, index)"
        >
          <view
            class="ecc-legend-icon"
            :style="{ backgroundColor: item.selected ? mapBackgroundColor(index) : EL_DEFAULT_BG_COLOR }"
          ></view>
          <view class="ecc-legend-name">{{ item.legendName }}</view>
        </view>
      </view>
      <!-- 占位-为了避免切换最后一个还展示倒数第三页的数据，用总页码乘以每个高度减去实际高度 -->
      <view class="ecc-legend-perch" :style="{ height: perchHeight }"></view>
    </view>
    <view :class="['ecc-legend-pagination', mapBtnClass()]" v-if="paginationFlag">
      <view class="ecc-legend-pagination-btn is-top" @click="handlePreviousPage">
        <icon-caret-top />
      </view>
      <view class="ecc-legend-pagination-page"> {{ currentPage }}/ {{ totalPage }} </view>
      <view class="ecc-legend-pagination-btn is-bottom" @click="handleNextPage">
        <icon-caret-bottom />
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
// 公共库
import { ref, type PropType, watch, nextTick } from 'vue';
// 类型
import type { El_ILegendInfo } from './ecc-legend.api';
// 组件
import { IconCaretBottom, IconCaretTop } from '@arco-iconbox/vue-tem';
// 常量
import { EL_DEFAULT_BG_COLOR, EL_SCAN_MAX_HEIGHT } from '../../constant/enum';

// props
const props = defineProps({
  legendList: {
    type: Array as PropType<El_ILegendInfo[]>,
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
/**
 * 图例样式
 * @returns {string}
 */
const mapBtnClass = (): string => {
  return currentPage.value === 1 ? 'first-page' : currentPage.value === totalPage.value ? 'last-page' : 'center-page';
};

/**
 * 判断是否展示分页器
 * @returns {void}
 */
const calculatePaginationFlag = (): void => {
  const totalEle = document.querySelector('.ecc-legend-list-container') as HTMLElement;
  currentPage.value = 1;
  if (totalEle) {
    const totalHeight = totalEle.clientHeight;
    paginationFlag.value = totalHeight > EL_SCAN_MAX_HEIGHT;
  } else {
    paginationFlag.value = false;
  }
};
/**
 * 计算分页
 * @returns {void}
 */
const calculatePage = (): void => {
  const totalEle = document.querySelector('.ecc-legend-list-container') as HTMLElement;
  if (totalEle) {
    const totalHeight = totalEle.clientHeight;
    totalPage.value = Math.ceil(totalHeight / EL_SCAN_MAX_HEIGHT);
    perchHeight.value = `${totalPage.value * EL_SCAN_MAX_HEIGHT - totalHeight}px`;
  } else {
    totalPage.value = 1;
  }
};
/**
 * 向下翻页
 * @returns {void}
 */
const handleNextPage = (): void => {
  if (currentPage.value < totalPage.value) {
    currentPage.value += 1;
    handleScroll();
  }
};
/**
 * 向上翻页
 * @returns {void}
 */
const handlePreviousPage = (): void => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
    handleScroll();
  }
};
/**
 * 处理滚动
 * @returns {void}
 */
const handleScroll = (): void => {
  const totalEle = document.querySelector('.ecc-legend-list') as HTMLElement;
  if (totalEle) {
    totalEle.scrollTo({
      top: (currentPage.value - 1) * EL_SCAN_MAX_HEIGHT,
      behavior: 'smooth',
    });
  }
};
/**
 * 图例背景
 * @param index
 * @returns {string}
 */
const mapBackgroundColor = (index: number): string => {
  return props.colorList[index % props.colorList.length];
};
/**
 * 点击图例
 * @param selected
 * @param index
 * @returns {void}
 */
const handleLegendSelect = (selected: boolean, index: number): void => {
  emit('legend-select', !selected, index);
};
/**
 * 监听数据变化
 */
watch(
  () => props.legendList,
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
.ecc-legend {
  display: flex;
  padding: 4rpx 0;
  gap: 32rpx;

  .ecc-legend-list {
    flex: auto;
    overflow: hidden;
    max-height: 78px;

    .ecc-legend-list-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0 32rpx;
      justify-content: center;
    }

    .ecc-legend-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      height: 26px;
      line-height: 26px;

      .ecc-legend-icon {
        width: 20rpx;
        height: 20rpx;
      }

      .ecc-legend-name {
        color: var(--te-text-color-regular);
        font-size: 24rpx;
        line-height: 26px;
        height: 26px;
        max-width: 160rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .ecc-legend-pagination {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .ecc-legend-pagination-page {
      color: var(--te-text-color-regular);
      font-size: var(--tem-font-size-s12);
    }

    .ecc-legend-pagination-btn {
      width: 58rpx;
      height: 58rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      width: 100%;
      height: 100%;
      color: #c0c4cc;
    }

    &.first-page .is-bottom svg {
      color: #303133;
    }

    &.last-page .is-top svg {
      color: #303133;
    }

    &.center-page .is-bottom svg,
    &.center-page .is-top svg {
      color: #303133;
    }
  }
}
</style>
