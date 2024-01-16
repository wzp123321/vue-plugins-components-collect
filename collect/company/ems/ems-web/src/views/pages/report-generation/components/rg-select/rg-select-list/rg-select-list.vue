<!--
 * @Author: yut
 * @Date: 2023-12-05 17:41:02
 * @LastEditors: yut
 * @LastEditTime: 2023-12-06 17:35:10
 * @Descripttion: 
-->
<template>
  <div class="rg-select-list">
    <h5>
      <te-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全部</te-checkbox>
      <span class="rsl-num"> {{ dataSource.length ?? 0 }} </span>
    </h5>
    <!-- 搜索 -->
    <div class="rsl-search">
      <te-input v-model="unselectedText" v-inputFilter:search @input="unselectedSearch">
        <template #prefix>
          <icon-search />
        </template>
      </te-input>
    </div>
    <!-- 列表 -->
    <div class="rsl-list" v-loading="loading">
      <!-- 平铺型 -->
      <te-checkbox-group v-if="dataSource.length" v-model="checkedValues" @change="handleCheckedDeviceChange">
        <recycle-scroller
          class="virtual-list"
          :buffer="1000"
          style="height: 100%"
          :prerender="200"
          :item-size="32"
          key-field="id"
          :items="dataSource"
        >
          <template v-slot="{ item, index }">
            <te-checkbox @change="handleChecked($event, item)" :key="item.id" :label="item.value" :title="item.label">{{
              item.label
            }}</te-checkbox>
          </template>
        </recycle-scroller>
      </te-checkbox-group>
      <no-data v-else></no-data>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash';
import { PropType, nextTick, ref, watch } from 'vue';
import { RG_ITreeItem } from '../rg-select.api';
import { IconSearch, IconClose } from '@arco-iconbox/vue-te';

const props = defineProps({
  //是否加载
  loading: {
    type: Boolean,
    default: true,
  },
  //列表数据
  dataList: {
    type: Array as PropType<reportGeneration.DeviceListDataTypy[] | RG_ITreeItem[]>,
    default: () => [],
  },
});

const checkedValues = ref<string[] | number[]>([]);

/**
 * 是否多选
 */
const checkAll = ref(false);
//全选中间状态
const isIndeterminate = ref(false);

const checkedDataList = ref<reportGeneration.DeviceListDataTypy[]>([]);

//搜索到的已选择的列表（搜索时不会变更）
const checkedSearchDataList = ref<reportGeneration.DeviceListDataTypy[]>([]);

const dataSource = ref<reportGeneration.DeviceListDataTypy[]>([]); //设备数据源

const unselectedSearchList = ref<reportGeneration.DeviceListDataTypy[]>([]); //未被选中的列表

//未选中关键字
const unselectedText = ref('');

/**
 * 处理设备选择
 * @param value
 */
const handleCheckedDeviceChange = (value: number[]) => {
  const checkedCount = value.length;
  checkAll.value = checkedCount === dataSource.value.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < dataSource.value.length;
};

const emit = defineEmits(['checkChange', 'modelValChange']);

/**
 * 选择设备时
 * @param checked
 * @param item
 */
const handleChecked = (checked: boolean, item: reportGeneration.DeviceListDataTypy) => {
  nextTick(() => {
    if (!checked) {
      checkedDataList.value = checkedDataList.value.filter((it) => item.id !== it.id);
    } else {
      if (!checkedDataList.value.includes(item)) {
        checkedDataList.value = [...checkedDataList.value, item];
      }
    }
    //已选择的列表
    checkedSearchDataList.value = cloneDeep(checkedDataList.value);
    emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  });
};

/**
 * 设备列表的筛选
 * @param value
 */
const unselectedSearch = (value: string) => {
  dataSource.value = unselectedSearchList.value.filter((item) => {
    return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
  });
  // checkedValues.value = checkedDataList.value.map((ite) => ite.value);
  checkAll.value = dataSource.value.length === checkedDataList.value.length;
  isIndeterminate.value = unselectedSearchList.value.length !== checkedDataList.value.length;
};

//全选逻辑
const handleCheckAllChange = (val: boolean) => {
  isIndeterminate.value = false;
  if (val) {
    checkedDataList.value = cloneDeep(dataSource.value);
  } else {
    //全部节点的时候，置空
    checkedDataList.value = [];
  }
  checkAll.value = checkedDataList.value.length === dataSource.value.length;
  isIndeterminate.value = checkedDataList.value.length < dataSource.value.length && checkedDataList.value.length > 0;
  checkedSearchDataList.value = cloneDeep(checkedDataList.value);
  checkedValues.value = checkedDataList.value.map((ite) => ite.value);
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

/**
 * 删除已选列表
 * @param item
 */
const deleteItem = (item: reportGeneration.DeviceListDataTypy) => {
  checkedDataList.value = checkedDataList.value.filter((option) => option.id !== item.id);
  checkedSearchDataList.value = checkedSearchDataList.value.filter((option) => option.id !== item.id);
  checkedValues.value = checkedDataList.value.map((ite) => ite.value);
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

const clear = () => {
  checkedValues.value = [];
  checkedDataList.value = [];
  checkedSearchDataList.value = [];
  checkAll.value = false;
  isIndeterminate.value = false;
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

/**
 * 移除标签
 * @param v
 */
const removeTag = (val: number) => {
  checkedDataList.value = checkedDataList.value.filter((option) => option.id !== val);
  checkedSearchDataList.value = checkedSearchDataList.value.filter((option) => option.id !== val);
  checkedValues.value = checkedDataList.value.map((ite) => ite.value);
  checkAll.value = checkedDataList.value.length === dataSource.value.length;
  isIndeterminate.value = checkedDataList.value.length < dataSource.value.length && checkedDataList.value.length > 0;
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

/**
 * 恢复默认的绑定节点
 */
const initModelValue = (value: string[]) => {
  checkedValues.value = cloneDeep(value);
  checkedDataList.value = dataSource.value.filter((item) => value.includes(item.value));
  checkedSearchDataList.value = checkedDataList.value.filter((item) => (value as string[]).includes(item.value));
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

defineExpose({
  deleteItem,
  clear,
  initModelValue,
  removeTag,
});

/**
 * 监听数据源变化
 */
watch(
  () => props.dataList,
  (val: any) => {
    dataSource.value = val;
    unselectedSearchList.value = cloneDeep(val);
    if (val.length) {
      checkedValues.value = [val[0]?.value];
      checkedDataList.value = [val[0]];
      checkedSearchDataList.value = [val[0]];
      checkAll.value = checkedDataList.value.length === val.length;
      isIndeterminate.value = checkedDataList.value.length > 0 && checkedDataList.value.length < val.length;
      emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
      emit('modelValChange', checkedValues.value, true);
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="less" scoped>
.rg-select-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  h5 {
    height: 40px;
    gap: 15px;
    padding: 4px 10px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--te-fill-color-light);

    :deep(.te-checkbox__label) {
      font-weight: 600;
      font-size: var(--te-font-size-b14);
      color: var(--te-text-color-regular);
    }
  }
  .rsl-search {
    height: 64px;
    flex: none;
    padding: var(--te-space-16);
  }
  .rsl-list {
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
  .rsl-num {
    color: var(--te-text-color-secondary);
    font-size: var(--te-font-size-b12);
  }
  :deep(.te-checkbox) {
    &:hover {
      background-color: var(--te-fill-color-light);
    }
  }
}
</style>
