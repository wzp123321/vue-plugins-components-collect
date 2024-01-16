<!--
 * @Author: yut
 * @Date: 2024-01-02 09:57:30
 * @LastEditors: yut
 * @LastEditTime: 2024-01-05 15:00:27
 * @Descripttion: 
-->
<template>
  <div class="common-transfer">
    <te-popover
      trigger="click"
      popper-class="common-transfer-popover"
      placement="bottom-start"
      :show-arrow="false"
      :width="668"
      :visible="popoverVisible"
      :teleported="false"
      @hide="hideSelect"
    >
      <template #reference>
        <te-select-v2
          ref="selectRef"
          v-model="checkedValue"
          :options="selectOptions"
          placeholder="请选择"
          style="width: 100%"
          multiple
          :clearable="clearable"
          collapse-tags
          :max-collapse-tags="maxTags"
          :suffix-icon="IconDown"
          @clear="clearChecked"
          @remove-tag="removeTag"
          popper-class="common-transfer-select"
          @visible-change="visibleChange"
        />
      </template>
      <div class="common-transfer-container">
        <te-tabs v-model="treeType" @tab-change="handleClick">
          <!-- 树状需要展示 -->
          <te-tab-pane
            v-for="tab in tabDataList"
            v-if="type === Common_ETransferType.树状"
            :key="tab.value"
            :label="tab.label"
            :name="tab.value"
          >
          </te-tab-pane>
          <div class="ct-content">
            <section>
              <!-- 左侧未选全部列表 -->
              <div class="ct-content-left">
                <component
                  v-if="type === Common_ETransferType.列表"
                  :is="CommonTransferList"
                  :loading="loading"
                  :data-list="dataList as Common_IListDataType[]"
                  :nodeNum="nodeNum"
                  @check-change="listCheckChange"
                  ref="transferListRef"
                ></component>

                <component
                  v-if="type === Common_ETransferType.树状"
                  :is="CommonTransferTree"
                  :loading="loading"
                  :data-list="dataList as Common_ITreeItem[]"
                  :modelValue="modelValue"
                  :nodeNum="nodeNum"
                  :maxLength="maxLength"
                  :nodeKey="nodeKey"
                  :expanedKeys="expanedKeys"
                  :defaultExpandAll="defaultExpandAll"
                  :defaultProps="defaultProps"
                  @check-change="treeCheckChange"
                  ref="transferTreeRef"
                ></component>
              </div>
              <!-- 右侧已选列表 -->
              <div class="ct-content-right">
                <CommonTransferChecked
                  :checkedDataList="checkedDataList"
                  @delete="deleteItem"
                  @clear="clear"
                ></CommonTransferChecked>
              </div>
            </section>
            <section>
              <te-button @click="close">取消</te-button>
              <te-button type="primary" @click="submit">确定</te-button>
            </section>
          </div>
        </te-tabs>
      </div>
    </te-popover>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, nextTick, ref, watch } from 'vue';
import {
  Common_ERadioData,
  Common_ETransferType,
  Common_ICheckListItem,
  Common_IListDataType,
  Common_ITreeItem,
} from './common-transfer.api';

//组件
import CommonTransferList from './common-transfer-list/common-transfer-list.vue';
import CommonTransferTree from './common-transfer-tree/common-transfer-tree.vue';
import CommonTransferChecked from './common-transfer-checked/common-transfer-checked.vue';
import { IconDown } from '@arco-iconbox/vue-te';

const props = defineProps({
  //类型
  type: {
    type: String,
    default: Common_ETransferType.列表,
  },
  //是否加载
  loading: {
    type: Boolean,
    default: true,
  },
  //是否能清除
  clearable: {
    type: Boolean,
    default: true,
  },
  // 树节点数
  nodeNum: {
    type: Number,
    default: 0,
  },
  // 树节点数
  maxLength: {
    type: Number,
  },
  // 标签数
  maxTags: {
    type: Number,
    default: 2,
  },
  //列表数据
  dataList: {
    type: Array as PropType<Common_ITreeItem[] | Common_IListDataType[]>,
    default: () => [],
  },
  //双向绑定已选数据
  modelValue: {
    type: Array as PropType<(number | string)[]>,
    default: () => [],
  },
  //当前树类型
  radioValue: {
    type: Number,
    default: Common_ERadioData.区域,
  },
  // 默认展开节点集合
  expanedKeys: {
    type: Array as PropType<number[]>,
    default: [],
  },

  // 数据源中每条数据唯一标识key
  nodeKey: {
    type: String,
    default: 'id',
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
  //树类型列表
  tabDataList: {
    type: Array as PropType<{ label: string; value: number }[]>,
  },
});

//弹出框
const popoverVisible = ref(false);

//选中的列表或节点
const checkedValue = ref<(string | number)[]>([]);

//多选option
const selectOptions = ref<any[]>([]);

//已选择的设备列表
const checkedDataList = ref<Common_ICheckListItem[]>([]);

//左侧未选择的列表ref
const transferListRef = ref();
const transferTreeRef = ref();

//下拉ref
const selectRef = ref();

//树类型
const treeType = ref<number>(Common_ERadioData.区域); //当前树类型

const emit = defineEmits(['updateTreeType', 'tabChange', 'update:modelValue','changeValidate']);

/**
 * 关闭popover后
 */
const hideSelect = () => {
  transferListRef.value?.initModelValue(checkedValue.value);
  transferTreeRef.value?.initModelValue(checkedValue.value);
};

/**
 * 清空已选
 */
const clearChecked = () => {
  transferTreeRef.value?.clear();
  transferListRef.value?.clear();
};

/**
 * 移除选中的tag
 * @param val
 */
const removeTag = (val: number | string) => {
  transferListRef.value?.removeTag(val);
  transferTreeRef?.value.removeTag(val);
  nextTick(() => {
    checkedValue.value = checkedDataList.value.map((ite) => ite.value);
    emit('update:modelValue', checkedValue.value);
    selectOptions.value = checkedDataList.value;
    emit('changeValidate');
  });
};

/**
 * 删除
 * @param item
 */
const deleteItem = (item: Common_ICheckListItem) => {
  transferTreeRef.value?.deleteItem(item);
  transferListRef.value?.deleteItem(item);
};

/**
 * 清空
 */
const clear = () => {
  transferListRef.value?.clear();
  transferTreeRef.value?.clear();
};

/**
 * 打开popover
 */
const visibleChange = (v: boolean) => {
  if (v) popoverVisible.value = v;
  nextTick(() => {
    if (transferTreeRef.value) {
      transferTreeRef.value.checkAll = props.modelValue?.length !== 0 && props.modelValue?.length === props.nodeNum;
      transferTreeRef.value.isIndeterminate = props.modelValue?.length > 0 && props.modelValue?.length < props.nodeNum;
    }
    if (transferListRef.value) {
      transferListRef.value.checkAll = props.modelValue?.length !== 0 && props.modelValue?.length === props.nodeNum;
      transferListRef.value.isIndeterminate = props.modelValue?.length > 0 && props.modelValue?.length < props.nodeNum;
    }
  });
};

/**
 * 切换树类型
 * @param tab
 * @param event
 */
const handleClick = (name: number) => {
  emit('updateTreeType', name);
  emit('tabChange');
};

/**
 * 选中事件
 * @param value
 * @param val
 */
const listCheckChange = (value: Common_IListDataType[], flag?: boolean) => {
  nextTick(() => {
    checkedDataList.value = value.map((item) => {
      return {
        label: item.label,
        value: item.value,
        id: item.id,
      };
    });
    if (flag) {
      checkedValue.value = checkedDataList.value.map((ite) => ite.value);
      emit('update:modelValue', checkedValue.value);
      selectOptions.value = checkedDataList.value;
    }
  });
};
/**
 * 选中事件
 * @param value
 * @param val
 */
const treeCheckChange = (value: Common_ITreeItem[], flag?: boolean) => {
  nextTick(() => {
    checkedDataList.value = value.map((item) => {
      return {
        label: item.treeName,
        value: item.id,
        id: item.id,
      };
    });
    if (flag) {
      checkedValue.value = checkedDataList.value.map((ite) => ite.value);
      emit('update:modelValue', checkedValue.value);
      selectOptions.value = checkedDataList.value;
    }
  });
};

/**
 * 提交
 */
const submit = () => {
  close();
  checkedValue.value = checkedDataList.value.map((ite) => ite.value);
  emit('update:modelValue', checkedValue.value);
  selectOptions.value = checkedDataList.value;
};

/**
 * 取消
 */
const close = () => {
  popoverVisible.value = false;
};

defineExpose({
  close,
});

/**
 * 监听tab值变化
 */
watch(
  () => props.radioValue,
  (val) => {
    treeType.value = val ?? Common_ERadioData.区域;
  },
);
</script>

<style lang="less" scoped>
.common-transfer {
  width: 100%;
  height: 100%;

  .ct-content {
    height: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    //选择区域
    > section:nth-child(1) {
      display: flex;
      flex: auto;
      border-radius: 4px;
      border: 1px solid var(--te-border-color-light);
    }
    //页脚区域
    > section:nth-child(2) {
      height: 52px;
      line-height: 52px;
      text-align: right;
      flex: none;
    }

    //左侧未选择区域
    &-left,
    &-right {
      flex: 1;
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
    }
    //右侧已选择区域
    &-right {
      border-left: 1px solid var(--te-border-color-light);
    }

    :deep(h5) {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--te-space-16);
      background-color: var(--te-fill-color-light);
      font-weight: 600;
      font-size: var(--te-font-size-b14);
      color: var(--te-text-color-regular);
      .te-checkbox {
        height: 40px;
      }
      .te-checkbox__label {
        font-weight: 600;
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-regular);
      }
    }
  }
  :deep(.common-transfer-search) {
    height: 64px;
    flex: none;
    padding: var(--te-space-16);
    .te-input__wrapper {
      box-shadow: 0 0 0 1px var(--te-input-border-color, var(--te-border-color)) !important;
    }
  }
  :deep(.vue-recycle-scroller__item-view) {
    &.hover {
      background-color: var(--te-fill-color-light);
    }
    .te-checkbox {
      padding: 0 16px;
      width: 100%;
    }

    .te-checkbox__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  :deep(.custom-tree-node > em) {
    font-style: normal !important;
    color: var(--iot-color-active) !important;
  }
  :deep(.te-tag__content) {
    display: flex;
    align-items: center;
  }
}
</style>

<style lang="less">
.common-transfer-select {
  display: none;
}
</style>
