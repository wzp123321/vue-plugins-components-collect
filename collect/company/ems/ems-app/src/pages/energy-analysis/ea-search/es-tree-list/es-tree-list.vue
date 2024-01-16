<template>
  <radio-group class="es-tree-list" @change="handleSelect">
    <radio
      :class="['etl-item', props.searchLabel && props.searchFlag && !!item.treeNames ? 'has-tree-names' : '']"
      v-for="item in props.treeList"
      :key="item?.id"
      :value="item.id + ''"
      :disabled="item.clickStatus === Common_EClickStatus.否"
      :checked="+item.id === +props.modelValue"
    >
      <view class="etl-item-middle">
        <view :class="['etl-item-middle-name', item.clickStatus === Common_EClickStatus.否 ? 'is-disabled' : '']">
          <view v-html="mapTreeName(item.treeName)"></view>
        </view>
        <text class="etl-item-middle-parent" v-if="props.searchLabel && props.searchFlag && !!item.treeNames">
          {{ item.treeNames }}
        </text>
      </view>
      <text class="etl-item-btn" v-if="item.hasChild && !props.searchFlag" @click="triggerChildrenQuery($event, item)">
        下级
      </text>
    </radio>
  </radio-group>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue';
import type { Common_IEvent, Common_ITreeVO } from '../../../../api/model';
import { Common_EClickStatus } from '@/config/enum';
// props
const props = defineProps({
  // 树列表
  treeList: {
    type: Array as PropType<Common_ITreeVO[]>,
    default: [],
  },
  // 选中节点
  modelValue: null,
  // 搜索内容
  searchLabel: {
    type: String,
    default: '',
  },
  // 搜索中
  searchFlag: {
    type: Boolean,
    default: false,
  },
});

// emits
const emits = defineEmits(['update:modelValue', 'drill', 'select']);
/**
 * 处理节点名称渲染
 * @param {string} treeName
 * @returns {string}
 */
const mapTreeName = (treeName: string): string => {
  return !props.searchLabel || !props.searchFlag
    ? treeName
    : `${treeName.replaceAll(
        props.searchLabel,
        `<uni-text class="test" style="color: var(--tem-color-primary)">${props.searchLabel}</uni-text>`,
      )}`;
};
/**
 * 选择节点
 * @param {Common_IEvent<{value:string}>} event
 */
const handleSelect = (event: Common_IEvent<{ value: string }>) => {
  let treeName = '';
  let treeNames = '';
  for (let i = 0; i < props.treeList.length; i++) {
    if (props.treeList[i].id === Number(event.detail.value)) {
      treeName = props.treeList[i].treeName;
      treeNames = props.treeList[i].treeNames ?? '';
      break;
    }
  }
  emits('update:modelValue', event.detail.value);
  emits('select', event.detail.value, treeName, treeNames);
};
/**
 * 查询下级节点
 * @param {Event} event
 * @param {Common_ITreeVO} item
 */
const triggerChildrenQuery = (event: Event, item: Common_ITreeVO) => {
  event.stopPropagation();
  event.preventDefault();
  emits('drill', item.id, item.treeName);
};
</script>
<style lang="scss" scoped>
.es-tree-list {
  background-color: var(--tem-color-white);
  display: flex;
  flex-direction: column;
  margin: 16rpx 32rpx 0;
  flex: auto;
  overflow-y: auto;

  .test {
    color: red;
  }

  .etl-item {
    :deep(.uni-radio-wrapper) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32rpx 0;
      border-bottom: 2rpx solid var(--tem-border-color-light);

      .uni-radio-input {
        width: 42rpx;
        min-width: 42rpx;
        height: 42rpx;
        margin-right: 32rpx;
      }
    }

    &.has-tree-names {
      :deep(.uni-radio-wrapper) {
        padding: 20rpx 0;
      }
    }

    .etl-item-middle {
      display: flex;
      flex-direction: column;
      flex: auto;
      overflow: hidden;

      text {
        display: inline-block;
      }

      .etl-item-middle-name {
        color: var(--tem-text-color-regular);
        font-size: 32rpx;
        line-height: 48rpx;
        // overflow: hidden;
        // text-overflow: ellipsis;
        white-space: wrap;

        > view {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        &.is-disabled {
          color: #c0c4cc;
        }
      }

      .etl-item-middle-parent {
        color: var(--tem-text-color-placeholder);
        font-size: 24rpx;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2; /*行数*/
      }
    }

    .etl-item-btn {
      position: relative;
      white-space: nowrap;
      color: var(--tem-color-primary);
      font-size: 32rpx;
      padding-left: 32rpx;
      margin-left: 32rpx;

      &::after {
        content: '';
        width: 2rpx;
        height: 32rpx;
        background-color: var(--tem-border-color-light);
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }
    }
  }
}
</style>
