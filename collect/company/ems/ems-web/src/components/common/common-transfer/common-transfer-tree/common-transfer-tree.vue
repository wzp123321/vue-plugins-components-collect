<template>
  <div class="common-transfer-tree">
    <h5>
      <te-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">{{
        '全选' + '(' + nodeNum + ')'
      }}</te-checkbox>

      <te-dropdown @command="command">
        <span class="te-dropdown-link">
          {{ strictly ? '任选' : '联选' }}
          <icon-down />
        </span>
        <template #dropdown>
          <te-dropdown-menu>
            <te-dropdown-item :command="Common_EStrictlyStatus.联选">联选</te-dropdown-item>
            <te-dropdown-item :command="Common_EStrictlyStatus.任选">任选</te-dropdown-item>
          </te-dropdown-menu>
        </template>
      </te-dropdown>
    </h5>
    <div class="common-transfer-search">
      <te-input v-model="keyword" v-inputFilter:search placeholder="请输入关键字">
        <template #prefix>
          <icon-search />
        </template>
      </te-input>
    </div>
    <!-- 列表 -->
    <div class="common-transfer-list" v-loading="loading">
      <te-tree
        ref="treeRef"
        :data="dataList"
        :show-checkbox="true"
        :highlight-current="true"
        :check-on-click-node="true"
        :node-key="nodeKey"
        :expand-on-click-node="false"
        :check-strictly="strictly"
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
import { IconSearch, IconDown } from '@arco-iconbox/vue-te';
import { Common_ITreeItem, Common_EStrictlyStatus } from '../common-transfer.api';
import { cloneDeep } from 'lodash';
import message from '@/utils/message';

const props = defineProps({
  //是否加载
  loading: {
    type: Boolean,
    default: true,
  },
  //列表数据
  dataList: {
    type: Array as PropType<Common_ITreeItem[]>,
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
  nodeNum: {
    // 树节点数
    type: Number,
    default: 0,
  },
  maxLength: {
    // 树节点数
    type: Number,
  },
  //双向绑定已选数据
  modelValue: {
    type: Array as PropType<(number | string)[]>,
  },
});

/**
 * 是否多选
 */
const checkAll = ref(false);

//是否联选
const strictly = ref(true);
//全选中间状态
const isIndeterminate = ref(false);

//搜索关键词
const keyword = ref();

//当前选中的节点
const checkedValues = ref<number[]>([]);

//树
const treeRef = ref();

//已选择的列表
const checkedDataList = ref<Common_ITreeItem[]>([]);

//一维的列表
const treeList = ref<Common_ITreeItem[]>([]);

//事件
const emit = defineEmits(['checkChange']);

//切换选择方式
const command = (item: string) => {
  strictly.value = item === Common_EStrictlyStatus.任选;
  nextTick(() => {
    // treeRef.value.setCheckedKeys(checkedValues.value);
    if (
      Object.prototype.toString.call(props.maxLength) === '[object Number]' &&
      props.maxLength &&
      treeRef.value?.getCheckedNodes().length > props.maxLength
    ) {
      treeRef.value.setCheckedKeys(checkedValues.value);
      message.error(`节点最多可选择${props.maxLength}个`);
      return;
    }
    // checkedDataList.value = treeRef.value?.getCheckedNodes() ?? [];
    // emit('checkChange', checkedDataList.value);
  });
};

//全选逻辑
const handleCheckAllChange = (val: boolean) => {
  isIndeterminate.value = false;
  if (val) {
    //全选节点
    if (
      Object.prototype.toString.call(props.maxLength) === '[object Number]' &&
      props.maxLength &&
      props.nodeNum > props.maxLength
    ) {
      treeRef.value.setCheckedKeys(checkedValues.value, false);
      message.error(`节点最多可选择${props.maxLength}个`);
      return;
    }
    treeRef.value?.setCheckedNodes(treeList.value);
    checkedDataList.value = treeRef.value?.getCheckedNodes() ?? [];
    checkedValues.value = treeRef.value?.getCheckedKeys();
  } else {
    //全部节点的时候，置空
    checkedValues.value = [];
    checkedDataList.value = [];
    treeRef.value?.setCheckedKeys([]);
  }
  emit('checkChange', checkedDataList.value);
};

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
 * 监听查询输入
 */
watch(
  () => keyword.value,
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
  return !keyword.value ? label : label.replaceAll(keyword.value, `<em>${keyword.value}</em>`);
};

/**
 * 树节点check事件
 * @param data
 * @param evt
 */
const onCheck = (data: any, evt: any) => {
  const { checkedNodes, checkedKeys } = evt;
  if (
    Object.prototype.toString.call(props.maxLength) === '[object Number]' &&
    props.maxLength &&
    checkedKeys.length > props.maxLength
  ) {
    treeRef.value.setCheckedKeys(checkedValues.value, false);
    message.error(`节点最多可选择${props.maxLength}个`);
    return;
  }
  checkedDataList.value = checkedNodes;
  checkedValues.value = checkedKeys;
  emit('checkChange', checkedDataList.value);
  //全选状态
  checkAll.value = checkedDataList.value.length === props.nodeNum;
  // 中间状态
  isIndeterminate.value = checkedDataList.value?.length > 0 && checkedDataList.value?.length < props.nodeNum;
};

/**
 * 删除
 * @param item
 */
const deleteItem = (item: Common_ITreeItem) => {
  checkedDataList.value = checkedDataList.value.filter((option) => option.id !== item.id);
  checkedValues.value = checkedDataList.value.map((ite) => ite.id);
  treeRef.value?.setCheckedKeys(checkedValues.value);

  const count = checkedDataList.value.length;
  checkAll.value = count === props.nodeNum;
  isIndeterminate.value = count > 0 && count < props.nodeNum;
  emit('checkChange', checkedDataList.value);
};

/**
 * 移除选中的tag
 * @param val
 */
const removeTag = (val: number | string) => {
  checkedDataList.value = checkedDataList.value.filter((option) => option.id !== val);
  checkedValues.value = checkedDataList.value.map((ite) => ite.id);
  treeRef.value?.setCheckedKeys(checkedValues.value);

  const count = checkedDataList.value.length;
  checkAll.value = count === props.nodeNum;
  isIndeterminate.value = count > 0 && count < props.nodeNum;
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
  treeRef.value.setCheckedKeys([]);
  emit('checkChange', checkedDataList.value);
};

/**
 * 恢复默认的绑定节点
 */
const initModelValue = (value: number[]) => {
  strictly.value = true;
  checkedValues.value = cloneDeep(value);
  nextTick(() => {
    treeRef.value?.setCheckedKeys(value);
    checkedDataList.value = treeRef.value?.getCheckedNodes() ?? [];
    emit('checkChange', checkedDataList.value);
  });
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
  (val: Common_ITreeItem[]) => {
    nextTick(() => {
      //存在反显列表
      if (props.modelValue?.length) {
        checkedValues.value = props.modelValue as number[];
        treeRef.value?.setCheckedKeys(props.modelValue as number[]);
      } else {
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
      }
      treeList.value = convertTreeData(cloneDeep(val));
      checkedDataList.value = treeRef.value?.getCheckedNodes();
      checkAll.value = checkedDataList.value.length !== 0 && checkedDataList.value.length === props.nodeNum;
      isIndeterminate.value = checkedDataList.value.length > 0 && checkedDataList.value.length < props.nodeNum;
      emit('checkChange', checkedDataList.value, true);
    });
  },
  {
    immediate: true,
  },
);
</script>
<style lang="less" scoped>
.common-transfer-tree {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .common-transfer-list {
    flex: auto;
    height: 0;
    overflow-x: overlay;
  }
}
</style>
