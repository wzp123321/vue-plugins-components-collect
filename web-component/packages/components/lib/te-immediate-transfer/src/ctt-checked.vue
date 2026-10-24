<template>
  <div class="ctt-checked">
    <div
      class="ctt-checked-header"
      :class="{ 'ctt-checked-header-highlight': showHeadBgColor }"
    >
      <span v-html="showCheckedNum()"></span>
      <!-- <icon-delete :disabled="!checkedDataList.length" @click="clearChecked" /> -->
      <te-button
        link
        type="primary"
        :disabled="!checkedDataList.length"
        @click="clearChecked"
        >清空</te-button
      >
    </div>
    <div v-if="showSearch" class="cc-search">
      <te-input
        v-model="keyword"
        :maxlength="50"
        @input="updateDataList"
        placeholder="请输入关键字"
      >
        <template #prefix>
          <icon-search />
        </template>
      </el-input>
    </div>
    <!-- 列表 -->
    <div class="ctc-list">
      <recycle-scroller
        v-if="dataList.length"
        :buffer="1000"
        style="height: 100%"
        :prerender="40"
        :item-size="showParentTitle ? 48 : 32"
        :key-field="isTreeV2 ? defaultProps.value : defaultProps.id"
        :emit-update="true"
        :items="dataList"
      >
        <template v-slot="{ item }">
          <div
            class="ctc-list-item"
            :title="`${showParentTitle && item[defaultProps.parentTitle]}${
              item[defaultProps.label]
            }`"
            :style="{ height: showParentTitle ? '48px' : '32px' }"
          >
            <span class="ctc-list-item-main">
              <template v-if="showParentTitle">
                <span class="ctc-list-item-sub">
                  {{ item[defaultProps.parentTitle] }}
                </span>
                <br />
              </template>
              <span class="ctc-list-item-main-text">{{
                item[defaultProps.label]
              }}</span>
            </span>
            <span @click="deleteItem(item)"><icon-close /></span>
          </div>
        </template>
      </recycle-scroller>
      <span v-else class="ctc-list-empty">暂无内容</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed, ref, watch } from 'vue';
import { IconSearch, IconClose } from '@arco-iconbox/vue-te';
import { ITCheckListItem, TransferTabsItem } from './constants';
import { cloneDeep } from 'lodash';
import { ElInput, ElButton } from 'element-plus';
//虚拟列表
// vue virtual scroller
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'; // 引入虚拟列表的 css
import { RecycleScroller } from 'vue-virtual-scroller'; // 引入虚拟列表

const props = defineProps({
  //列表数据
  checkedDataList: {
    type: Array as PropType<ITCheckListItem[]>,
    default: () => [],
  },
  showHeadBgColor: {
    type: Boolean,
    default: true,
  },
  defaultProps: {
    // 配置选项
    type: Object,
    default: {
      children: 'children',
      label: 'label',
      id: 'id',
      value: 'id',
      parentTitle: 'parentTitle',
    },
  },
  // 待选区tabs选项集合
  tabs: {
    type: Array as PropType<TransferTabsItem[]> | null,
    default: null,
  },
  // 最多可选数量
  maxLength: {
    type: Number,
  },
  showSearch: {
    type: Boolean,
    default: true,
  },
  // 待选树是否采用虚拟树
  isTreeV2: {
    type: Boolean,
    default: false,
  },
  // 是否展示副标题
  showParentTitle: {
    type: Boolean,
    default: false,
  },
  // maxLength: {
  //   // 树节点数
  //   type: Number,
  // },
});

//已选择的数据列表
const dataList = ref<ITCheckListItem[]>([]);

//已选择的数据列表--模糊搜索
const checkedSearchDataList = computed(() => cloneDeep(props.checkedDataList));
//搜索关键词
const keyword = ref('');

const emit = defineEmits(['delete', 'clear']);

/**
 * 删除
 * @param item
 */
const deleteItem = (item: ITCheckListItem) => {
  emit('delete', item);
};

/**
 * 清空
 */
const clearChecked = () => {
  if (props.checkedDataList.length > 0) {
    emit('clear');
  }
};

/**
 * 已选显示
 */
const showCheckedNum = () => {
  if (props.maxLength) {
    return `已选(${
      props.checkedDataList.length ?? 0
    }<span style="font-size: 12px;color: var(--te-text-color-placeholder)">/${
      props.maxLength
    }</span>)`;
  }
  return `已选(${props.checkedDataList.length ?? 0})`;
};

const clearInput = () => {
  keyword.value = '';
};
defineExpose({
  clearInput,
});

/**
 * 更新最终展示的已选列表
 */
const updateDataList = () => {
  dataList.value = props.checkedDataList.filter((item) => {
    return keyword.value.trim().length <= 0
      ? true
      : item[props.defaultProps.label]
          .toLowerCase()
          .indexOf(keyword.value.trim().toLowerCase()) > -1;
  });
};
/**
 * 监听已选择的列表的变化
 */
watch(
  () => props.checkedDataList,
  (val) => {
    updateDataList();
  },
  { deep: true },
);
</script>
<style lang="less" scoped>
.ctt-checked {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .cc-search {
    // height: 64px;
    flex: none;
    padding: var(--te-space-16) var(--te-space-16) 0 var(--te-space-16);
    box-sizing: border-box;
    .te-input__wrapper {
      box-shadow: 0 0 0 1px var(--te-input-border-color, var(--te-border-color)) !important;
    }
  }

  .ctt-checked-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    gap: 15px;
    padding: 4px 10px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;

    > span {
      font-weight: 600;
      font-size: var(--te-font-size-b14);
      color: var(--te-text-color-regular);
    }

    > svg {
      cursor: pointer;

      &[disabled='true'] {
        color: var(--te-disabled-text-color);
        cursor: not-allowed !important;
      }
    }
  }
  .ctt-checked-header-highlight {
    background-color: var(--te-fill-color-light);
  }

  .cc-search {
    :deep(.te-input__wrapper) {
      box-shadow: 0 0 0 1px var(--te-input-border-color, var(--te-border-color)) !important;
    }
  }

  .ctc-list {
    flex: auto;
    height: 0;
    display: flex;
    justify-content: center;
    margin-top: var(--te-space-8);
    .vue-recycle-scroller {
      display: flex;
      width: 100%;
    }
    &-item {
      padding: 3px 16px;
      display: flex;
      align-items: center;
      cursor: pointer;
      &:hover {
        background-color: var(--te-fill-color-light);
        span:nth-child(2) {
          opacity: 1;
        }
      }
      &:hover {
        font-weight: 600;
      }
      .ctc-list-item-main,
      .ctc-list-item-sub {
        flex: auto;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 0;
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-regular);
      }
      .ctc-list-item-sub {
        color: var(--te-text-color-secondary, #0000008c);
        font-size: 12px;
      }
      span:nth-child(2) {
        width: 16px;
        height: 16px;
        flex: none;
        font-size: 16px;
        opacity: 0;
      }
    }
    &-empty {
      color: var(--te-text-color-secondary);
      font-size: var(--te-font-size-b14);
      margin-top: 8px;
    }
  }
}
</style>
