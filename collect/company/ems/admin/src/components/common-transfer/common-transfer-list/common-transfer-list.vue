<!--
 * @Author: yut
 * @Date: 2024-01-02 11:19:47
 * @LastEditors: yut
 * @LastEditTime: 2024-01-15 09:50:13
 * @Descripttion: 
-->
<template>
  <div class="common-transfer-list">
    <h5>
      <te-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">{{
        '全选' + '(' + nodeNum + ')'
      }}</te-checkbox>
    </h5>
    <div class="common-transfer-search">
      <te-input v-model="keyword" v-inputFilter:search @input="search" placeholder="请输入关键字">
        <template #prefix>
          <icon-search />
        </template>
      </te-input>
    </div>
    <div class="common-transfer-list-container" v-loading="loading">
      <!-- 平铺型 -->
      <te-checkbox-group v-if="dataSource.length" v-model="checkedValues" @change="handleCheckedChange">
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
import { PropType, nextTick, ref, watch } from 'vue';
import { IconSearch, IconClose } from '@arco-iconbox/vue-te';
import { Common_ICheckListItem, Common_IListDataType } from '../common-transfer.api';
import { cloneDeep } from 'lodash';

const props = defineProps({
  //是否加载
  loading: {
    type: Boolean,
    default: true,
  },
  //列表数据
  dataList: {
    type: Array as PropType<Common_IListDataType[]>,
    default: () => [],
  },
  nodeNum: {
    // 树节点数
    type: Number,
    default: 0,
  },
  // 标签数
  maxTags: {
    type: Number,
    default: 2,
  },
});

/**
 * 是否多选
 */
const checkAll = ref(false);
//全选中间状态
const isIndeterminate = ref(false);

//搜索关键词
const keyword = ref();

//数据源
const dataSource = ref<Common_IListDataType[]>([]);

//模糊搜索的列表
const unselectedSearchList = ref<Common_IListDataType[]>([]);

//模糊搜索的已选列表
const checkedSearchDataList = ref<Common_IListDataType[]>([]);

//已选择的列表
const checkedDataList = ref<Common_IListDataType[]>([]);

//当前选中的数据
const checkedValues = ref<string[] | number[]>([]);

//事件
const emit = defineEmits(['checkChange']);

//全选逻辑
const handleCheckAllChange = (val: boolean) => {
  isIndeterminate.value = false;
  if (val) {
    checkedDataList.value = cloneDeep(dataSource.value);
  } else {
    //全部节点的时候，置空
    checkedDataList.value = [];
  }
  checkedValues.value = checkedDataList.value.map((ite) => ite.value);
  emit('checkChange', checkedDataList.value);
};

/**
 * 处理设备选择
 * @param value
 */
const handleCheckedChange = (value: number[]) => {
  const checkedCount = value.length;
  checkAll.value = checkedCount === dataSource.value.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < dataSource.value.length;
};

/**
 * 选择时
 * @param checked
 * @param item
 */
const handleChecked = (checked: boolean, item: Common_IListDataType) => {
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
    emit('checkChange', checkedDataList.value);
  });
};

/**
 * 搜索
 */
const search = (value: string) => {
  dataSource.value = unselectedSearchList.value.filter((item) => {
    return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
  });
};

/**
 * 删除
 * @param item
 */
const deleteItem = (item: Common_ICheckListItem) => {
  checkedDataList.value = checkedDataList.value.filter((option) => option.id !== item.id);
  checkedValues.value = checkedDataList.value.map((ite) => ite.value);

  const count = checkedDataList.value.length;
  checkAll.value = count === dataSource.value.length;
  isIndeterminate.value = count > 0 && count < dataSource.value.length;
  emit('checkChange', checkedDataList.value);
};

/**
 * 移除选中的tag
 * @param val
 */
const removeTag = (val: number | string) => {
  checkedDataList.value = checkedDataList.value.filter((option) => option.value !== val);
  checkedValues.value = checkedDataList.value.map((ite) => ite.value);

  const count = checkedDataList.value.length;
  checkAll.value = count === dataSource.value.length;
  isIndeterminate.value = count > 0 && count < dataSource.value.length;
  emit('checkChange', checkedDataList.value);
};

/**
 * 清空
 */
const clear = () => {
  checkAll.value = false;
  isIndeterminate.value = false;

  checkedDataList.value = [];
  checkedValues.value = [];
  emit('checkChange', checkedDataList.value);
};

/**
 * 恢复默认的绑定节点
 */
const initModelValue = (value: string[]) => {
  checkedValues.value = cloneDeep(value);
  checkedDataList.value = dataSource.value.filter((item) => value.includes(item.value));
  emit('checkChange', checkedDataList.value);
};

defineExpose({
  deleteItem,
  clear,
  initModelValue,
  removeTag,
  checkAll,
  isIndeterminate,
});

/**
 * 监听数据源变化
 */
watch(
  () => props.dataList,
  (val: Common_IListDataType[]) => {
    dataSource.value = cloneDeep(val);
    unselectedSearchList.value = cloneDeep(val);
    if (val.length) {
      checkedValues.value = [val[0]?.value];
      checkedDataList.value = [val[0]];
      //多选状态
      checkAll.value = checkedValues.value.length === val.length;
      isIndeterminate.value = checkedDataList.value.length > 0 && checkedDataList.value.length < val.length;
    } else {
      checkedValues.value = [];
      checkedDataList.value = [];

      checkAll.value = false;
      isIndeterminate.value = false;
    }
    //check事件变化
    emit('checkChange', checkedDataList.value, true);
  },
  {
    immediate: true,
  },
);
</script>
<style lang="less" scoped>
.common-transfer-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  &-container {
    flex: auto;
    height: 0;
  }
  :deep(.te-checkbox-group) {
    height: 100%;
  }
}
</style>
