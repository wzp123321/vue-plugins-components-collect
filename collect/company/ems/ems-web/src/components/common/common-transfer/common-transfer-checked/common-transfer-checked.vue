<template>
  <div class="common-transfer-checked">
    <h5>
      {{ showCheckedNum() }}
    </h5>
    <div class="common-transfer-search">
      <te-input v-model="keyword" v-inputFilter:search @input="search" placeholder="请输入关键字">
        <template #prefix>
          <icon-search />
        </template>
      </te-input>
    </div>
    <!-- 列表 -->
    <div class="ctc-list">
      <recycle-scroller
        v-if="dataList.length"
        :buffer="1000"
        style="height: 100%"
        :prerender="200"
        :item-size="32"
        key-field="id"
        :emit-update="true"
        :items="dataList"
      >
        <template v-slot="{ item, index }">
          <div class="ctc-list-item" :title="item.label">
            <span>{{ item.label }}</span>
            <span @click="deleteItem(item)"><icon-close /></span>
          </div>
        </template>
      </recycle-scroller>
      <no-data v-else></no-data>
    </div>
    <!-- 清空 -->
    <div class="ctc-clear">
      <te-button :disabled="!checkedDataList.length" @click="clearChecked">清空</te-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, ref, watch } from 'vue';
import { IconSearch, IconClose } from '@arco-iconbox/vue-te';
import { Common_ICheckListItem, Common_IListDataType, Common_ITreeItem } from '../common-transfer.api';
import { cloneDeep } from 'lodash';

const props = defineProps({
  //列表数据
  checkedDataList: {
    type: Array as PropType<Common_ICheckListItem[]>,
    default: () => [],
  },
  maxLength: {
    // 树节点数
    type: Number,
  },
});

//已选择的数据列表
const dataList = ref<Common_ICheckListItem[]>([]);

//已选择的数据列表--模糊搜索
const checkedSearchDataList = computed(() => cloneDeep(props.checkedDataList));
//搜索关键词
const keyword = ref();

const emit = defineEmits(['delete', 'clear']);

/**
 * 搜索
 */
const search = (value: string) => {
  dataList.value = checkedSearchDataList.value.filter((item) => {
    return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
  });
};

/**
 * 删除
 * @param item
 */
const deleteItem = (item: Common_ICheckListItem) => {
  emit('delete', item);
};

/**
 * 清空
 */
const clearChecked = () => {
  emit('clear');
};

/**
 * 已选显示
 */
const showCheckedNum = () => {
  let checkedStr = '';
  if (props.maxLength) {
    checkedStr = `已选(${props.checkedDataList.length ?? 0}/${props.maxLength})`;
  } else {
    checkedStr = `已选(${props.checkedDataList.length ?? 0})`;
  }
  return checkedStr;
};

/**
 * 监听已选择的列表的变化
 */
watch(
  () => props.checkedDataList,
  (val) => {
    dataList.value = val;
  },
);
</script>
<style lang="less" scoped>
.common-transfer-checked {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .ctc-list {
    flex: auto;
    height: 0;
    &-item {
      height: 32px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      cursor: pointer;
      &:hover {
        background-color: var(--te-fill-color-light);
        span:nth-child(2) {
          opacity: 1;
        }
      }
      span:nth-child(1) {
        flex: auto;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 0;
        font-weight: 600;
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-regular);
      }
      span:nth-child(2) {
        width: 16px;
        height: 16px;
        flex: none;
        font-size: 16px;
        opacity: 0;
      }
    }
  }
  .ctc-clear {
    flex: none;
    height: 40px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid var(--te-border-color-light);
    button {
      width: 48px;
      height: 24px;
      line-height: 24px;
    }
    .is-disabled {
      cursor: not-allowed !important;
    }
  }
}
</style>
