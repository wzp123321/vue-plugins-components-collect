<!--
 * @Author: yut
 * @Date: 2023-11-01 15:12:29
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-11 19:26:12
 * @Descripttion: 
-->
<template>
  <view class="elc-list-card">
    <view
      :class="['elc-container', !item.hasChildren ? 'no-child' : '']"
      v-for="(item, index) in cardData"
      :key="item.customId"
    >
      <!-- 解决不自动收起问题---value去掉 -->
      <uni-collapse class="elc-container-collapse" @change="openChild($event, item)">
        <uni-collapse-item :border="false" :name="item.itemId" :disabled="!item.hasChildren">
          <template #title>
            <view class="elc-coolapse-header">
              <view class="elc-coolapse-header-title">
                <text>{{ item.itemName }}</text>
              </view>
              <view class="elc-coolapse-header-des">
                <text>{{ thousandSeparation(item.energyValue) + (item.energyUnit ?? '-') }}</text>
                <text>{{
                  thousandSeparation(convertValue(item.costValue)) + convertValueUnit(item.costValue) + '元'
                }}</text>
              </view>
            </view>
          </template>
          <view class="elc-content">
            <view v-if="item.loading" class="elc-loading">加载中...</view>
            <view v-if="!item.loading" :class="['elc-content-header', mapNoChildren(item.children) ? '' : 'no-expand']">
              <text v-if="mapNoChildren(item.children)"></text>
              <text v-for="title in childrenItemHead" :key="title">{{ title }}</text>
            </view>
            <view
              class="elc-content-table"
              :class="idx === item.children?.length - 1 ? 'last-child' : ''"
              v-for="(ite, idx) in item.children"
              :key="idx"
            >
              <uni-collapse v-if="!item.loading" class="elc-wrap-collapse" @change="openChild($event, ite)">
                <uni-collapse-item
                  :border="false"
                  :disabled="!ite.hasChildren"
                  :class="[!ite.hasChildren ? 'no-children' : '', mapNoChildren(item.children) ? '' : 'no-expand']"
                >
                  <template #title>
                    <view class="elc-wrap-item">
                      <view class="elc-wrap-item-name">
                        <text>{{ ite.itemName }}</text>
                      </view>
                      <view class="elc-wrap-item-consumption">
                        <text>{{ thousandSeparation(ite.energyValue) }}</text>
                      </view>
                      <view class="elc-wrap-item-cost">
                        <text>{{
                          thousandSeparation(convertValue(ite.costValue)) + convertValueUnit(ite.costValue)
                        }}</text>
                      </view>
                    </view>
                  </template>
                  <view v-if="ite.loading" class="elc-loading">加载中...</view>
                  <view v-if="!ite.loading">
                    <view v-for="(it, i) in ite.children" :key="i">
                      <view class="elc-wrap-item child">
                        <text></text>
                        <view class="elc-wrap-item-name">
                          <text>{{ it.itemName }}</text>
                        </view>
                        <view class="elc-wrap-item-consumption">
                          <text>{{ thousandSeparation(it.energyValue) }}</text>
                        </view>
                        <view class="elc-wrap-item-cost">
                          <text>{{
                            thousandSeparation(convertValue(it.costValue)) + convertValueUnit(it.costValue)
                          }}</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </uni-collapse-item>
              </uni-collapse>
            </view>
          </view>
        </uni-collapse-item>
        <view class="elc-btn" @click="goToDetail(item)">
          <text>查看详情</text>
        </view>
      </uni-collapse>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { watch, type PropType, ref, onBeforeMount } from 'vue';
import { floatDivide, handlePageTo, thousandSeparation } from '@/utils';
import type { Ec_INodeItem, Ec_ITopPanelForm } from '../energy-consumption.api';
import { useEnergyConsumptionController } from '../hook';
import { cloneDeep } from 'lodash';
import type { ICard_DataItem } from './ec-list-card.api';
import { getRandomSixNum } from '@/utils/authorization';
const props = defineProps({
  // 详情列表
  childTreeList: {
    type: Array as PropType<Ec_INodeItem[]>,
    default: () => [],
  },
  // 表头
  childrenItemHead: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  // 表单
  topPanelForm: {
    type: Object as PropType<Ec_ITopPanelForm>,
  },
});

const { queryChildrenListById } = useEnergyConsumptionController();

const cardData = ref<ICard_DataItem[]>([]);

const value = ref();

const mapNoChildren = (children: Ec_INodeItem[]) => {
  return children.some((item) => item.hasChildren);
};

const openChild = (val: string[], item: ICard_DataItem) => {
  item.loading = true;
  if (!val.length || item.children?.length) {
    item.loading = false;
    return;
  }
  queryChildrenListById({
    treeId: item.itemId,
    queryTime: props.topPanelForm?.date ?? '',
    energyCode: props.topPanelForm?.energyCode ?? '',
  })
    .then((children) => {
      item.children = cloneDeep(children) as ICard_DataItem[];
      item.loading = false;
    })
    .finally(() => {
      item.loading = false;
    });
};

/**
 * 根据实际值转化为展示的值
 * @param val
 */
const convertValue = (val: number | null) => {
  if (val === null) {
    return null;
  }
  if (val < 10000) {
    return val;
  } else {
    return Number(floatDivide(val, 10000)?.toFixed(2));
  }
};
/**
 * 根据实际值转化单位
 * @param val
 */
const convertValueUnit = (val: number | null) => {
  return val && val > 10000 ? '万' : '';
};

onBeforeMount(() => {
  cardData.value = (cloneDeep(props.childTreeList) as ICard_DataItem[]).map((item) => {
    item.loading = false;
    // 解决不自动收起
    item.customId = item.itemId + getRandomSixNum() + getRandomSixNum() + getRandomSixNum();
    return item;
  });
});

watch(
  () => props.childTreeList,
  (val) => {
    console.log('%c🚀 ~ ec-list-card.vue ~ 147行', 'font-size: 18px', val);
    cardData.value = (cloneDeep(val) as ICard_DataItem[]).map((item) => {
      item.loading = false;
      // 解决不自动收起
      item.customId = item.itemId + getRandomSixNum() + getRandomSixNum() + getRandomSixNum();
      return item;
    });
  },
  {
    deep: true,
  },
);

const goToDetail = (item: Ec_INodeItem) => {
  handlePageTo('/pages/energy-consumption/energy-consumption', {
    treeId: item.itemId,
    queryTime: props.topPanelForm?.date ?? '',
    energyCode: props.topPanelForm?.energyCode ?? '',
  });
};
</script>
<style lang="scss" scoped>
.elc-list-card {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  .elc-btn {
    height: 44px;
    font-size: 14px;
    border-radius: 0 0 8px 8px;
    background-color: var(--tem-bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tem-color-primary);
    border-top: 1px solid var(--tem-border-color-light);
  }

  .elc-coolapse-header {
    // height: 80px;
    padding: 15px 0 15px 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 4px;

    &-title {
      height: 24px;
      display: flex;
      align-items: center;
      color: var(--tem-text-color-regular);
      font-size: var(--tem-font-size-b16);
      text {
        white-space: nowrap;
      }
      text:nth-child(1) {
        flex: auto;
        width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      text:nth-child(2) {
        display: inline-flex;
        align-items: center;
        height: 20px;
        width: 24px;
        flex: none;
        font-size: 12px;
        color: var(--tem-text-color-secondary);
      }
    }
    &-des {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      > text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      > text:nth-child(1) {
        color: var(--tem-color-warning);
        font-size: var(--tem-font-size-b14);
        font-weight: 600;
      }
      > text:nth-child(2) {
        color: var(--tem-text-color-secondary);
        font-size: var(--tem-font-size-s12);
      }
    }
  }

  .elc-content {
    width: 100%;
    padding: 0 16rpx;
    &-header {
      width: 100%;
      height: 72rpx;
      display: flex;
      align-items: center;
      border-bottom: 2rpx solid var(--tem-border-color-light);
      text {
        font-size: var(--tem-font-size-s12);
        color: var(--tem-text-color-secondary);
        line-height: 40rpx;
      }
      text:nth-child(1) {
        width: 72rpx;
        flex: none;
      }
      text:nth-child(2) {
        flex: auto;
      }
      text:nth-child(3) {
        text-align: right;
        width: 232rpx;
        flex: none;
      }
      text:nth-child(4) {
        text-align: right;
        width: 186rpx;
        flex: none;
      }
    }
    .no-expand {
      text:nth-child(1) {
        flex: auto;
      }
      text:nth-child(2) {
        width: 232rpx;
        flex: none;
        text-align: right;
      }
      text:nth-child(3) {
        text-align: right;
        width: 186rpx;
        flex: none;
      }
    }
  }

  //加载
  .elc-loading {
    height: 104rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tem-text-color-secondary);
    font-size: var(--tem-font-size-s12);
  }

  .elc-wrap-item {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    width: 100%;
    color: var(--tem-text-color-regular);
    font-size: var(--tem-font-size-b14);
    > text {
      display: flex;
      width: 72rpx;
      flex: none;
    }
    &-name {
      flex: auto;
      padding: 8rpx 0;
    }
    &-consumption {
      flex: none;
      width: 232rpx;
      text-align: right;
    }
    &-cost {
      width: 186rpx;
      flex: none;
      text-align: right;
      padding-right: 16rpx;
    }
    &.child {
      border-bottom: 1px solid var(--tem-border-color-light);
      background-color: #fafafa;
      .elc-wrap-item-name {
        padding-left: 16rpx;
      }
    }
    &:last-of-type {
      border-bottom: none !important;
    }
  }

  :deep(.elc-container-collapse.uni-collapse) {
    border-radius: 8px;
  }
  :deep(.elc-container-collapse .uni-collapse-item__title-wrap) {
    width: 0;
  }
  :deep(.no-child .uni-collapse-item__title-arrow) {
    display: none;
    pointer-events: none;
  }

  :deep(.is-open + .uni-collapse-item__wrap) {
    height: auto !important;
  }
  :deep(.elc-container-collapse .uni-collapse-item__title-arrow) {
    position: relative;
    top: -12px;
  }
  :deep(.uni-collapse-item__title.uni-collapse-item-border) {
    border-bottom: none;
  }

  :deep(.elc-wrap-collapse) {
    .uni-collapse-item__title {
      display: flex;
      flex-direction: row-reverse;
    }
    .uni-collapse-item__title-arrow {
      position: relative;
      top: 0;
      margin-right: 0;
    }
    .uni-collapse-item__title-box {
      padding: 0;
    }
    .uni-collapse-item__title-arrow {
      width: 72rpx;
    }
    .uni-collapse-item__title {
      position: relative;
      border-bottom: 1px solid var(--tem-border-color-light) !important;
    }

    .no-children {
      .uni-collapse-item__title-arrow {
        // display: none;
        visibility: hidden;
      }
    }
    .no-expand {
      .uni-collapse-item__title-arrow {
        display: none;
      }
    }
  }

  :deep(.last-child) {
    .uni-collapse-item__title {
      position: relative;
      border-bottom: none !important;
    }
  }

  // :deep(.uni-collapse-item__title.uni-collapse-item-border) {
  //   border-bottom: 2rpx solid var(--tem-border-color-light) !important;
  // }
}
</style>
