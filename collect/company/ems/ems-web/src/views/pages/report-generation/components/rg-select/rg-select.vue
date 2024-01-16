<!--
 * @Author: yut
 * @Date: 2023-11-30 09:53:37
 * @LastEditors: yut
 * @LastEditTime: 2023-12-28 16:31:32
 * @Descripttion: 
-->

<template>
  <div class="rg-select">
    <te-popover
      trigger="click"
      popper-class="rg-select-popover"
      placement="bottom-start"
      :show-arrow="false"
      :width="668"
      :visible="popoverVisible"
      :teleported="false"
      @hide="hideSelect"
    >
      <template #reference>
        <te-select-v2
          v-model="modelValue"
          :options="selectOptions"
          placeholder="请选择"
          style="width: 100%"
          multiple
          clearable
          collapse-tags
          @clear="clearChecked"
          @remove-tag="removeTag"
          popper-class="rs-select"
          @visible-change="visibleChange"
        />
      </template>
      <div class="rs-wrap">
        <te-tabs v-model="treeType" class="demo-tabs" @tab-change="handleClick">
          <te-tab-pane
            v-for="tab in tabDataList"
            v-if="selectType === RG_ESelectType.树状"
            :key="tab.value"
            :label="tab.label"
            :name="tab.value"
          >
          </te-tab-pane>
          <div class="rs-wrap-content">
            <section>
              <!-- 左侧未选全部列表 -->
              <div class="rs-wrap-content-left">
                <rg-select-list
                  v-if="selectType === RG_ESelectType.平铺"
                  ref="rslistRef"
                  :data-list="dataList"
                  :loading="loading"
                  @check-change="checkChange"
                  @model-val-change="modelValChange"
                ></rg-select-list>
                <rg-select-tree
                  v-if="selectType === RG_ESelectType.树状"
                  ref="rstreeRef"
                  :data-list="dataList"
                  :loading="loading"
                  :defaultProps="defaultProps"
                  :expanedKeys="expanedKeys"
                  :treeNumber="treeNumber"
                  @check-change="checkChange"
                  @model-val-change="modelValChange"
                ></rg-select-tree>
              </div>
              <!-- 右侧已选列表 -->
              <div class="rs-wrap-content-right">
                <h5>
                  <span class="rs-wrap-content-title">已选</span>
                  <span class="rs-wrap-content-num"> {{ checkedSearchDataList?.length ?? 0 }}</span>
                </h5>
                <!-- 搜索 -->
                <div class="rs-wrap-content-search">
                  <te-input v-model="selectedText" v-inputFilter:search @input="selectSearch">
                    <template #prefix>
                      <icon-search />
                    </template>
                  </te-input>
                </div>
                <!-- 列表 -->
                <div class="rs-wrap-content-list">
                  <recycle-scroller
                    v-if="checkedDataList.length"
                    :buffer="1000"
                    style="height: 100%"
                    :prerender="200"
                    :item-size="32"
                    key-field="id"
                    :emit-update="true"
                    :items="checkedDataList"
                  >
                    <template v-slot="{ item, index }">
                      <div class="rs-wrap-content-list-item" :title="item.label">
                        <span>{{ item.label }}</span>
                        <span @click="deleteItem(item)"><icon-close /></span>
                      </div>
                    </template>
                  </recycle-scroller>
                  <no-data v-else></no-data>
                </div>
                <!-- 清空 -->
                <div class="rs-wrap-content-clear">
                  <te-button :disabled="!checkedDataList.length" @click="clearChecked">清空</te-button>
                </div>
              </div>
            </section>
            <section>
              <te-button @click="cancel">取消</te-button>
              <te-button type="primary" :disabled="!checkedDataList.length" @click="submit">确定</te-button>
            </section>
          </div>
        </te-tabs>
      </div>
    </te-popover>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, nextTick, onMounted, ref, toRef, watch } from 'vue';
import { RG_ESelectType, RG_ITreeItem, RadioDataObject } from './rg-select.api';

import { IconSearch, IconClose } from '@arco-iconbox/vue-te';
import { cloneDeep } from 'lodash';
import rgSelectList from './rg-select-list/rg-select-list.vue';
import rgSelectTree from './rg-select-tree/rg-select-tree.vue';
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
  // 树状选择还是平铺选择
  selectType: {
    type: String as PropType<RG_ESelectType>,
    default: 'flat',
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
//弹出框
const popoverVisible = ref(false);

//选中的设备或节点
const modelValue = ref<string[] | number[]>([]);

//tab列表
const tabDataList = computed(
  (): Array<{ label: string; value: RadioDataObject }> =>
    Object.entries(RadioDataObject)
      .filter(([k, v]) => typeof v === 'number')
      .map(([k, v]) => ({ label: k, value: v as RadioDataObject })),
);

//已选择的设备列表
const checkedDataList = ref<reportGeneration.DeviceListDataTypy[]>([]);
//搜索到的已选择的列表（搜索时不会变更）
const checkedSearchDataList = ref<reportGeneration.DeviceListDataTypy[]>([]);

const treeType = ref(RadioDataObject.区域); //当前树类型

//多选option
const selectOptions = ref<any[]>([]);

/**
 * 打开popover
 */
const visibleChange = (v: boolean) => {
  if (v) popoverVisible.value = true;
};

/**
 * 选中事件
 * @param value
 * @param val
 */
const checkChange = (value: any, val: any) => {
  checkedDataList.value = value;
  checkedSearchDataList.value = val;
};

/**
 * 双向绑定数据变化
 * @param value
 * @param flag
 */
const modelValChange = (value: any, flag?: boolean) => {
  if (flag) {
    modelValue.value = value;
    emit('update:modelValue', modelValue.value);
    selectOptions.value = checkedDataList.value;
  }
};

/**
 * 已选择的列表筛选
 */
const selectedText = ref('');
const selectSearch = (value: string) => {
  checkedDataList.value = checkedSearchDataList.value.filter((item) => {
    return item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
  });
};

const emit = defineEmits(['updateTreeType', 'tabChange', 'update:modelValue']);
/**
 * 切换树类型
 * @param tab
 * @param event
 */
const handleClick = (name: number) => {
  emit('updateTreeType', name);
  emit('tabChange');
};
//设备列表
const rslistRef = ref();
// 树状列表
const rstreeRef = ref();

/**
 * 删除已选列表
 * @param item
 */
const deleteItem = (item: reportGeneration.DeviceListDataTypy) => {
  switch (props.selectType) {
    case RG_ESelectType.平铺:
      rslistRef.value?.deleteItem(item);
      break;
    case RG_ESelectType.树状:
      rstreeRef.value?.deleteItem(item);
      break;
    default:
      break;
  }
};

/**
 * 移除选中的tag
 * @param val
 */
const removeTag = (val: number | string) => {
  switch (props.selectType) {
    case RG_ESelectType.平铺:
      rslistRef.value?.removeTag(val);
      break;
    case RG_ESelectType.树状:
      rstreeRef.value?.removeTag(val);
      break;
    default:
      break;
  }
};

/**
 * 清空已选
 */
const clearChecked = () => {
  if (props.selectType === RG_ESelectType.树状) {
    rstreeRef.value?.clear();
  } else {
    rslistRef.value?.clear();
  }
};

/**
 * 提交
 */
const submit = () => {
  switch (props.selectType) {
    case RG_ESelectType.平铺:
      modelValue.value = checkedDataList.value.map((it) => it.value);
      selectOptions.value = cloneDeep(props.dataList);
      break;
    case RG_ESelectType.树状:
      modelValue.value = checkedDataList.value.map((it) => it.value);
      selectOptions.value = cloneDeep(checkedDataList.value);
      break;
    default:
      break;
  }
  emit('update:modelValue', modelValue.value);
  popoverVisible.value = false;
};

/**
 * 取消
 */
const cancel = () => {
  popoverVisible.value = false;
};

defineExpose({
  cancel,
});

/**
 * 关闭popover后
 */
const hideSelect = () => {
  switch (props.selectType) {
    case RG_ESelectType.平铺:
      rslistRef.value?.initModelValue(modelValue.value);
      break;
    case RG_ESelectType.树状:
      rstreeRef.value?.initModelValue(modelValue.value);
      break;
    default:
      break;
  }
};

/**
 * 监听tab值变化
 */
watch(
  () => props.radioValue,
  (val) => {
    treeType.value = val;
  },
);
</script>
<style lang="less" scoped>
.rg-select {
  width: 100%;
  height: 100%;
  .rs-wrap-content {
    height: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    > section:nth-child(1) {
      display: flex;
      flex: auto;
      border-radius: 4px;
      border: 1px solid var(--te-border-color-light);
    }
    > section:nth-child(2) {
      height: 52px;
      line-height: 52px;
      text-align: right;
      flex: none;
    }
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
    &-title {
      font-weight: 600;
      font-size: var(--te-font-size-b14);
      color: var(--te-text-color-regular);
    }
    &-num {
      color: var(--te-text-color-secondary);
      font-size: var(--te-font-size-b12);
    }
    &-right {
      border-left: 1px solid var(--te-border-color-light);
    }

    &-search {
      height: 64px;
      flex: none;
      padding: var(--te-space-16);
    }
    &-clear {
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
  // 列表区域
  .rs-wrap-content-list {
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
  :deep(.custom-tree-node > em) {
    font-style: normal !important;
    color: var(--iot-color-active) !important;
  }
  :deep(.te-checkbox-group) {
    height: 100%;
  }
  :deep(.vue-recycle-scroller__item-view) {
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
}
</style>

<style lang="less">
.rg-select-popover {
  z-index: 9999 !important;
}
.rs-select {
  display: none;
}
</style>
