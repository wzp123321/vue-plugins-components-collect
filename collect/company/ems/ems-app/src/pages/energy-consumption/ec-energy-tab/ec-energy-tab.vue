<template>
  <scroll-view
    scroll-x
    :class="[
      'ec-energy-tab',
      props.energyStickyFlag ? 'is-sticky' : '',
      !props.energyStickyFlag && props.transparentFlag ? 'is-transparent' : '',
    ]"
    :style="{ top: props.energyStickyFlag ? mapTop() : '' }"
    :scroll-left="scrollLeftDistance"
  >
    <view
      :class="[energyCode === item.code ? 'eet-item-selected' : '', 'eet-item']"
      :style="{ height, lineHeight: height }"
      v-for="(item, index) in props.tabList"
      :key="item.code"
      @click="handleSelect(item.code, index)"
    >
      {{ item.name }}
    </view>
  </scroll-view>
</template>
<script lang="ts" setup>
// 公共库
import { ref, watch } from 'vue';
import type { PropType } from 'vue';
// 接口
import type { Common_ICodeName } from '../../../api/model';
// 工具方法
import { FGetStorageData } from '@/utils/storage';
// 配置
import { SESSION_KEY_STATUS_HEIGHT } from '@/config/session-key';
// props
const props = defineProps({
  // 能源类型列表
  tabList: {
    type: Array as PropType<Common_ICodeName<string>[]>,
    default: [],
  },
  // 是否透明
  transparentFlag: {
    type: Boolean,
    default: false,
  },
  // 当前能源类型
  selectedCode: {
    type: String,
    default: '',
  },
  // 是否吸顶
  energyStickyFlag: {
    type: Boolean,
    default: false,
  },
  // 高度
  height: {
    type: String,
    default: '96rpx',
  },
});
// emits
const emits = defineEmits(['select']);
/**
 * 吸顶高度
 * @returns {string}
 */
const mapTop = (): string => {
  // 44-导航栏高度  FGetStorageData(SESSION_KEY_STATUS_HEIGHT)-状态栏高度
  const statusH = FGetStorageData(SESSION_KEY_STATUS_HEIGHT) ? Number(FGetStorageData(SESSION_KEY_STATUS_HEIGHT)) : 0;
  return `${44 + statusH}px`;
};
// 当前能源类型
const energyCode = ref<string>(props.selectedCode);
// 横向滚动位置
const scrollLeftDistance = ref<number>(0);
/**
 * 切换能源类型
 * @param {string} code
 * @returns {void}
 */
const handleSelect = (code: string, index: number): void => {
  energyCode.value = code;
  emits('select', code);

  const scrollWidth = document.querySelector('.ec-energy-tab')
    ? (document.querySelector('.ec-energy-tab') as Element).clientWidth
    : 0;
  // 获取dom宽度
  const itemWidth = uni.upx2px(150);
  const totalWidth = (index + 1) * itemWidth;

  if (totalWidth > scrollWidth) {
    scrollLeftDistance.value = totalWidth - scrollWidth + (index !== props.tabList?.length - 1 ? -uni.upx2px(150) : 0);
  } else {
    scrollLeftDistance.value = 0;
  }
};
/**
 * 监听数据变化
 */
watch(
  () => props.selectedCode,
  (newVal) => {
    energyCode.value = newVal;
  },
);
</script>
<style lang="scss" scoped>
.ec-energy-tab {
  width: 100%;
  position: relative;
  opacity: 1;
  box-sizing: border-box;
  background-color: var(--tem-color-white);

  :deep(.uni-scroll-view) {
    .uni-scroll-view-content {
      display: flex;
      align-items: center;
    }
  }

  .eet-item {
    position: relative;
    font-size: var(--tem-font-size-b16);
    color: var(--tem-text-color-primary);
    font-size: 32rpx;
    line-height: 48rpx;
    width: 150rpx;
    min-width: 150rpx;
    text-align: center;
    transition: none;

    &.eet-item-selected {
      font-weight: 600;
      color: var(--tem-color-primary);

      &::before {
        content: '';
        width: 32rpx;
        height: 6rpx;
        border-radius: 1998rpx;
        background-color: var(--tem-color-primary);

        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        transition: none;
      }
    }
  }

  &.is-transparent {
    background-color: transparent;

    .eet-item {
      color: var(--tem-color-white);

      &.eet-item-selected {
        &::before {
          background: var(--tem-color-white);
        }
      }
    }
  }

  &.is-sticky {
    position: fixed;
    left: 0;
    // top: 88rpx;
    // top: 44px;
    transition: none;
    z-index: 2;
    background-color: var(--tem-color-white);
  }
}
</style>
