<!--
 * @Author: yut
 * @Date: 2023-12-05 17:41:24
 * @LastEditors: yut
 * @LastEditTime: 2023-12-28 16:16:03
 * @Descripttion: 
-->
<template>
  <div class="rg-select-tree">
    <h5>
      <te-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全部</te-checkbox>
      <span class="rst-num"> {{ treeNumber ?? 0 }} </span>
    </h5>
    <!-- 搜索 -->
    <div class="rst-search">
      <te-input v-model="unselectedText" v-inputFilter:search>
        <template #prefix>
          <icon-search />
        </template>
      </te-input>
    </div>
    <!-- 列表 -->
    <div class="rst-list">
      <te-tree
        ref="treeRef"
        :data="dataList"
        :show-checkbox="multiple"
        :highlight-current="true"
        :check-on-click-node="true"
        :node-key="nodeKey"
        :expand-on-click-node="false"
        :check-strictly="true"
        :default-expanded-keys="expanedKeys"
        :default-expand-all="defaultExpandAll"
        :filter-node-method="filterTreeNodeList"
        :props="defaultProps"
        @check="onCheck"
      >
        <template #default="{ node, data }">
          <span
            class="custom-tree-node"
            :title="data[defaultProps.label]"
            v-html="formatTreeLabel(data[defaultProps.label])"
          >
          </span>
        </template>
        <template #empty>
          <no-data></no-data>
        </template>
      </te-tree>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, nextTick, ref, watch } from 'vue';
import { cloneDeep } from 'lodash';
import { IconSearch, IconClose } from '@arco-iconbox/vue-te';

import { RG_ITreeItem, RadioDataObject } from '../rg-select.api';
const props = defineProps({
  //当前树类型
  radioValue: {
    type: Number,
    default: Number as PropType<RadioDataObject>,
  },
  //是否多选
  multiple: {
    type: Boolean,
    default: true,
  },
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
  defaultProps: {
    // 配置选项
    type: Object,
    default: {
      children: 'children',
      label: 'label',
    },
  },
  // 默认展开全部
  defaultExpandAll: {
    type: Boolean,
    default: false,
  },
  expanedKeys: {
    // 默认展开节点集合
    type: Array as PropType<number[]>,
    default: [],
  },
  nodeKey: {
    // 数据源中每条数据唯一标识key
    type: String,
    default: 'id',
  },
  modelValue: {
    // 默认勾选
    type: Array as PropType<number[] | string[]>,
    default: [],
  },
  treeNumber: {
    // 树节点数
    type: Number,
    default: 0,
  },
});

const checkedValues = ref<string[] | number[]>([]);

const treeRef = ref();

/**
 * 是否多选
 */
const checkAll = ref(false);
//全选中间状态
const isIndeterminate = ref(false);

const checkedDataList = ref<reportGeneration.DeviceListDataTypy[]>([]);

//搜索到的已选择的列表（搜索时不会变更）
const checkedSearchDataList = ref<reportGeneration.DeviceListDataTypy[]>([]);

const treeList = ref<reportGeneration.DeviceListDataTypy[]>([]); //一维的列表

//未选中关键字
const unselectedText = ref('');

const emit = defineEmits(['checkChange', 'modelValChange']);

/**
 * 监听查询输入
 */
watch(
  () => unselectedText.value,
  (val: any) => {
    treeRef.value?.filter(val);
  },
);

/**
 * 树节点查询筛选
 */
const filterTreeNodeList = (value: any, data: any) => {
  if (!value) return true;
  return data.hasOwnProperty(props.defaultProps.label) ? data[props.defaultProps.label].indexOf(value) !== -1 : true;
};

// 根据过滤文本处理树节点文本
const formatTreeLabel = (label: string) => {
  return !unselectedText.value ? label : label.replaceAll(unselectedText.value, `<em>${unselectedText.value}</em>`);
};

/**
 * 树节点check事件
 * @param data
 * @param evt
 */
const onCheck = (data: GlobalModule.CommonObject, evt: any) => {
  const { checkedNodes, checkedKeys } = evt;
  checkedDataList.value = checkedNodes.map((item: any) => {
    return {
      id: item.id,
      value: item.id,
      label: item.treeName,
    };
  });
  checkedValues.value = checkedKeys;
  checkedSearchDataList.value = cloneDeep(checkedDataList.value);
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
  //全选状态
  checkAll.value = checkedDataList.value.length === props.treeNumber;
  // 中间状态
  isIndeterminate.value = checkedDataList.value?.length > 0 && checkedDataList.value?.length < props.treeNumber;
};

//全选逻辑
const handleCheckAllChange = (val: boolean) => {
  isIndeterminate.value = false;
  if (val) {
    //全选节点
    treeRef.value?.setCheckedNodes(treeList.value);
    checkedDataList.value = treeRef.value?.getCheckedNodes()?.map((item: any) => {
      return {
        id: item.id,
        value: item.id,
        label: item.treeName,
      };
    });
    checkedValues.value = treeRef.value?.getCheckedKeys();
    checkedSearchDataList.value = cloneDeep(checkedDataList.value);
  } else {
    //全部节点的时候，置空
    treeRef.value?.setCheckedKeys([]);
    checkedValues.value = [];
    checkedSearchDataList.value = [];
    checkedDataList.value = [];
  }
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

/**
 * 移除标签
 * @param v
 */
const removeTag = (v: number) => {
  treeRef.value?.setCheckedKeys((checkedValues.value as number[]).filter((it) => it !== v));
  checkedDataList.value = checkedDataList.value.filter((option) => option.id !== v);
  checkedSearchDataList.value = checkedSearchDataList.value.filter((option) => option.id !== v);
  checkAll.value = checkedDataList.value.length === props.treeNumber;
  isIndeterminate.value = checkedDataList.value.length < props.treeNumber && checkedDataList.value.length > 0;
  checkedValues.value = treeRef.value?.getCheckedKeys();
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

/**
 * 清空
 */
const clear = () => {
  checkedValues.value = [];
  checkedDataList.value = [];
  checkedSearchDataList.value = [];
  checkAll.value = false;
  treeRef.value.setCheckedKeys([]);
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
  treeRef.value?.setCheckedKeys(checkedValues.value);
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

/**
 * 恢复默认的绑定节点
 */
const initModelValue = (val: string[]) => {
  checkedValues.value = cloneDeep(val);
  treeRef.value?.setCheckedKeys(val);
  checkedDataList.value = treeRef.value?.getCheckedNodes().map((item: any) => {
    return {
      id: item.id,
      value: item.id,
      label: item.treeName,
    };
  });
  checkedSearchDataList.value = cloneDeep(checkedDataList.value);
  //全选状态
  checkAll.value = checkedDataList.value.length === props.treeNumber;
  // 中间状态
  isIndeterminate.value = checkedDataList.value?.length > 0 && checkedDataList.value?.length < props.treeNumber;
  emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
  emit('modelValChange', checkedValues.value);
};

defineExpose({
  deleteItem,
  clear,
  initModelValue,
  removeTag,
});
// tree 结构转化成一维数组
const convertTreeData = (menuOptions: any) => {
  for (let i = 0; i < menuOptions.length; i++) {
    if (menuOptions[i].childTree != undefined) {
      const temp = menuOptions[i].childTree;
      delete menuOptions[i].childTree;
      menuOptions = menuOptions.concat(temp);
    }
  }
  return menuOptions;
};

/**
 * 监听数据源变化
 */
watch(
  () => props.dataList,
  (val: any) => {
    //总节点数目存在不需要重新计算
    nextTick(() => {
      //存在默认展开节点
      if (props.expanedKeys.length) {
        checkedValues.value = [props.expanedKeys[0]];
        treeRef.value?.setCheckedKeys([props.expanedKeys[0]]);
      } else if (val.length) {
        checkedValues.value = [val[0]?.id];
        treeRef.value?.setCheckedKeys([val[0]?.id]);
      } else {
        checkedValues.value = [];
        treeRef.value?.setCheckedKeys([]);
      }
      if (!treeList.value.length) {
        treeList.value = convertTreeData(val);
      }
      checkAll.value = checkedDataList.value.length === props.treeNumber;
      isIndeterminate.value = checkedDataList.value.length > 0 && checkedDataList.value.length < props.treeNumber;
      checkedDataList.value = treeRef.value?.getCheckedNodes()?.map((item: any) => {
        return {
          id: item.id,
          value: item.id,
          label: item.treeName,
        };
      });
      checkedSearchDataList.value = cloneDeep(checkedDataList.value);
      console.log('%c🚀 ~ rg-select-tree.vue ~ 325行', 'font-size: 18px', checkedValues.value);
      emit('checkChange', checkedDataList.value, checkedSearchDataList.value);
      emit('modelValChange', checkedValues.value, true);
    });
  },
  {
    immediate: true,
  },
);
</script>

<style lang="less" scoped>
.rg-select-tree {
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
  .rst-search {
    height: 64px;
    flex: none;
    padding: var(--te-space-16);
  }
  .rst-list {
    flex: auto;
    height: 0;
    overflow-x: overlay;
  }

  .rst-num {
    color: var(--te-text-color-secondary);
    font-size: var(--te-font-size-b12);
  }
}
</style>
