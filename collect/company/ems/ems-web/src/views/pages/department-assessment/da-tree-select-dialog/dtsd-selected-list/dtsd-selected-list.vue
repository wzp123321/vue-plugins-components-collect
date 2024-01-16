<template>
  <div class="dtsd-selected-list">
    <te-input type="text" placeholder="请输入关键词" v-model="filterText" />
    <!-- 选中列表 -->
    <ul class="dsl-list" v-if="mapSelectedListShow()">
      <li v-for="(item, index) in currentList" :key="item.id" class="flex-row-justify-center">
        <span class="name" :title="item.name">{{ item.name }}</span>
        <icon-delete title="删除" @click="handleItemRemove(item.id)" />
      </li>
    </ul>
    <!-- 缺省 -->
    <div class="dsl-empty" v-show="!mapSelectedListShow()">
      <span>暂无数据</span>
    </div>
    <div class="dsl-clear">
      <te-button @click="handleClear()" :disabled="mapClearBtnDisabled()">清空</te-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType, ref, toRef, watch } from 'vue';
import { TeInput, TeButton } from '@tiansu/element-plus';
import { IconDelete } from '@arco-iconbox/vue-te';
import { Common_IIdName } from '../../../../../services/common/common-api';
import { cloneDeep } from 'lodash';

const props = defineProps({
  list: {
    type: Array as PropType<Common_IIdName<number>[]>,
    default: [],
  },
});
const emits = defineEmits(['clear', 'removeItem']);

// 过滤文本
const filterText = ref<string>('');
// 当前展示的列表
const currentList = toRef<Common_IIdName<number>[]>(props.list);
/**
 * 是否展示选中节点
 * @returns {boolean}
 */
const mapSelectedListShow = (): boolean => {
  return currentList.value?.length !== 0;
};
/**
 * 清空按钮是否禁用
 * @returns {boolean}
 */
const mapClearBtnDisabled = (): boolean => {
  return props.list?.length === 0;
};
/**
 * 清空选择
 */
const handleClear = () => {
  emits('clear');
};
/**
 * 单个删除
 * @param {number} id
 */
const handleItemRemove = (id: number) => {
  emits('removeItem', id);
};
/**
 * 监听数据
 */
watch(
  () => props.list,
  (val: Common_IIdName<number>[]) => {
    currentList.value = cloneDeep(val);
  },
);
/**
 * 监听文本变化
 */
watch(
  () => filterText.value,
  (val: string) => {
    currentList.value = (props.list as Common_IIdName<number>[])?.filter((item) => {
      return item?.name?.includes(val);
    });
  },
);
</script>
<style lang="less" scoped>
.dtsd-selected-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  > .te-input {
    padding: 16px;
    width: 100%;
  }

  > .dsl-empty {
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--te-text-color-secondary);
    font-size: var(--te-font-size-base);
  }

  .dsl-list {
    flex: 1 1 0%;
    overflow-y: auto;

    li {
      color: var(--te-text-color-regular);
      font-weight: 500;
      font-size: var(--te-font-size-b14);
      line-height: 22px;
      padding: 5px 16px;
      transition: all 233ms;

      span {
        display: inline-block;
        flex: 1 1 0%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    svg {
      cursor: pointer;
      display: none;
    }

    li:hover {
      background: var(--te-fill-color-light);
      transition: all 233ms;

      svg {
        display: inline-block;
      }
    }
  }

  .dsl-clear {
    border-top: 1px solid var(--te-border-color-light);
    padding: 8px 16px;
    text-align: right;
  }
}
</style>
