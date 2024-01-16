<!--
 * @Author: yut
 * @Date: 2023-10-31 14:36:19
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-11 15:54:56
 * @Descripttion: 
-->
<template>
  <uni-popup ref="popupRef" type="bottom">
    <view class="esa-filter">
      <!-- 状态栏 -->
      <!-- 顶部导航栏 -->
      <view class="ef-header">
        <text>筛选</text>
        <icon-close class="ef-close" @click="closePopup" />
      </view>
      <scroll-view scroll-y="true" class="ef-body">
        <!-- 能耗类型 -->
        <view class="ef-body-title">
          <text>能耗类型</text>
        </view>
        <!-- 能耗类型列表 -->
        <esa-filter-type
          :type-list="energyCodeList"
          :select-code="energyCode"
          @select="selectEnergyCode"
        ></esa-filter-type>
        <!-- 定额类型 -->
        <view class="ef-body-radio">
          <text>定额类型</text>
          <view>
            <radio-group @change="radioChange">
              <label class="radio" v-for="radio in quotaTypeList"
                ><radio :value="radio.code" :checked="quotaType === radio.code" />{{ radio.label }}</label
              >
            </radio-group>
          </view>
        </view>
        <view class="ef-body-title ef-body-date">
          <text>选择日期</text>
          <tem-dateTimePicker mode="date" :value="quotaDate" :fields="fieldsVal" @change="bindDateChange">
            <view class="ef-body-date-trigger">
              <text>{{ quotaDate }}</text>
              <icon-right></icon-right>
            </view>
            <template #headerTitle>
              <text>选择日期</text>
            </template>
          </tem-dateTimePicker>
        </view>
        <view class="ef-body-bar"></view>
        <view class="ef-body-wrap">
          <view :class="['ef-body-container', isFixed ? 'is-fixed' : '']">
            <view class="ef-body-title">
              <text>分析对象</text>
            </view>
            <!-- tab -->
            <esa-filter-tab
              v-if="treeTypeList.length"
              :tree-type-list="treeTypeList"
              :select-code="treeType"
              @select="selectTreeTypeCode"
            ></esa-filter-tab>
            <!-- 搜索框 -->

            <!-- 搜索框 -->
            <uni-search-bar
              v-filterEmoji
              ref="searchBarRef"
              class="ef-body-search"
              maxlength="20"
              placeholder="搜索"
              v-model="searchLabel"
              @cancel="handleSearchCancel"
              @confirm="triggerSearch($event)"
              @focus="handleFocus"
            >
            </uni-search-bar>
            <!-- 搜索历史 -->
            <es-search-history v-if="focusFlag" :list="historyList" @triggerSearch="triggerSearch"></es-search-history>
            <!-- 搜索面包屑 -->
            <es-select-crumbs
              v-if="!searchFlag && !focusFlag && treeList.length !== 0"
              :list="searchBreadCrumbList"
              @select="handleCrumbSelect"
            ></es-select-crumbs>
          </view>
        </view>
        <!-- 树列表 -->
        <es-tree-list
          v-if="quotaTreeList.length"
          v-model="selectedId"
          :treeList="quotaTreeList"
          :searchFlag="searchFlag"
          :searchLabel="searchLabel"
          @drill="handleTreeDrill"
          @select="handleTreeSelect"
        ></es-tree-list>
        <!-- 搜索为空 -->
        <common-search-empty
          v-if="!loading && !focusFlag && !treeList.length"
          :title="
            !searchLabel
              ? `${treeType === Common_ETreeType.区域 ? '区域' : '业态'}树模型未绑定此能源类型的设备点位`
              : '搜索结果为空'
          "
          :subTitle="!searchLabel ? '' : '换个关键词试试吧'"
        ></common-search-empty>
      </scroll-view>
      <!-- 底部按钮 -->
      <view class="ef-bottom">
        <text class="ef-bottom-reset" @click="handleReset">重置</text>
        <text class="ef-bottom-submit" @click="handleSubmit">确定</text>
      </view>
    </view>
  </uni-popup>
</template>
<script lang="ts" setup>
import { useCommonEnergy } from '@/hook/energyController';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useCommonTree } from '@/hook';

// 组件
import { EsaFilterType, EsaFilterTab } from './components/index';
import EsSearchHistory from '../../energy-analysis/ea-search/es-search-history/es-search-history.vue';
import EsSelectCrumbs from '../../energy-analysis/ea-search/es-select-crumbs/es-select-crumbs.vue';
import EsTreeList from '../../energy-analysis/ea-search/es-tree-list/es-tree-list.vue';
import { IconClose, IconRight } from '@arco-iconbox/vue-tem';
import { TemDateTimePicker } from '@tiansu/ts-mobile-package';

//工具
import { FGetQueryParam, handlePageTo, mapSystemInfo, pxToRpx } from '@/utils';
import { ESA_EDateType, ESA_EFieldType, type ESA_IDetailParam } from '../energy-saving-assessment.api';
import esaService from '../energy-saving-assessment.service';
import { COMMON_DEFAULT_BREADCRUMB, quotaTypeList } from '@/config/config';
import { ESA_EQuotaType, Esa_FilterEPath, type Esa_IQueryChildTreeParams, type Esa_TreeList } from './esa-filter.api';
import { Common_EMenuId, Common_ETreeType } from '@/config/enum';
import type { Es_IBreadcrumb } from '@/pages/energy-analysis/ea-search/ea-search.api';
import { cloneDeep } from 'lodash';
import { SESSION_KEY_USER_ID } from '@/config/session-key';
import { FGetStorageData } from '@/utils/storage';
import type { Common_ITreeVO } from '@/api/model';

// 能源类型
const { energyCodeList, queryEnergyCodeList, energyCode } = useCommonEnergy();

const {
  treeList,
  treeType,
  searchLabel,
  treeTypeList,
  searchBreadCrumbList,
  historyList,
  loading,
  queryTreeTypeList,
  queryHistoryList,
  handleSearchBreadSelect,
  queryTreeList,
  getTreeNames,
} = useCommonTree();

// 搜索历史
// 是否正在搜索
const searchFlag = ref<boolean>(false);
// 输入框是否聚焦
const focusFlag = ref<boolean>(false);

//弹出层
const popupRef = ref();

// 当前节点
const selectedId = ref<number | null | undefined>(null);

//定额时间
const quotaDate = ref('');

//定额类型
const quotaType = ref(quotaTypeList[0].code);

//日期格式
const fieldsVal = ref(ESA_EFieldType.本月);

//是否吸顶
const isFixed = ref(false);

//树数据
const quotaTreeList = ref<Common_ITreeVO[]>([]);

/**
 * 计算距离顶部的距离
 */
const popupHeight = computed(() => {
  return pxToRpx(mapSystemInfo().windowHeight.toString()) - 240 + 'rpx';
});

/**
 * 关闭弹窗
 */
const closePopup = () => {
  popupRef.value?.close();
};

const originObject = reactive<ESA_IDetailParam>({
  treeId: null,
  treeType: '1',
  quotaType: ESA_EDateType.本月,
  quotaDate: esaService.getDate(),
  energyCode: '01000',
});
// const originQuotaType = ref<string>(ESA_EDateType.本月);

/**
 * 打开弹窗
 */
const openPopup = async (detailData: ESA_IDetailParam) => {
  clearData();
  console.log('%c🚀 ~ esa-filter.vue ~ 205行', 'font-size: 18px', detailData);
  energyCode.value = originObject.energyCode = detailData.energyCode;
  quotaType.value = originObject.quotaType = detailData.quotaType;
  quotaDate.value = originObject.quotaDate = detailData.quotaDate;
  selectedId.value = originObject.treeId = detailData.treeId;
  fieldsVal.value = detailData.quotaType === ESA_EDateType.本年 ? ESA_EFieldType.本年 : ESA_EFieldType.本月;
  popupRef.value?.open();
  uni.showLoading({ title: '加载中...' });
  try {
    await queryTreeTypeList();
    treeType.value = treeTypeList.value?.[0]?.code;
    await queryEnergyCodeList();
    handleTreeQuery(null);
    console.log('%c🚀 ~ esa-filter.vue ~ 216行', 'font-size: 18px', selectedId.value);
  } catch (error) {
    console.log('%c✨✨打开区域节点弹框Error✨✨', 'font-size: 24px', error);
  } finally {
    uni.hideLoading();
  }
  nextTick(() => {
    const target = document.querySelector('.ef-body-bar'); //目标元素
    const root = document.querySelector('.ef-body'); //根元素
    const ob = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 目标元素进入视窗
            console.log('目标元素进入视窗');
            isFixed.value = false;
          } else {
            // 目标元素离开视窗
            console.log('目标元素离开视窗');
            isFixed.value = true;
          }
        });
      },
      {
        root: root, // 根元素，默认是视窗   填要观察元素的父级
        rootMargin: '0px', // 根元素的边距
        threshold: 0, // 当目标元素进入视窗时触发回调
      },
    );
    if (target) {
      ob.observe(target);
    }
  });
};

/**
 * 拼接查询树节点参数
 * @param { number | null} treeId
 * @returns {Esa_IQueryChildTreeParams}
 */
const mapQueryTreeParams = (treeId: number | null): Esa_IQueryChildTreeParams => {
  const obj: Esa_IQueryChildTreeParams = {
    hospitalCodeList: [],
    wholeHospitalFlag: true,
    energyCode: energyCode.value,
    treeType: treeType.value,
    quotaType: quotaType.value,
    quotaDate: quotaDate.value,
    keyword: searchLabel.value,
    menuId: Common_EMenuId.节能考核,
    userId: FGetStorageData(SESSION_KEY_USER_ID) ? Number(FGetStorageData(SESSION_KEY_USER_ID)) : null,
  };
  if (!searchFlag.value) {
    obj.treeId = treeId === null ? 0 : treeId;
  }
  return obj;
};

/**
 * 查询
 * @param id
 */
const handleTreeQuery = (id: number | null) => {
  queryTreeList<Esa_IQueryChildTreeParams>(
    mapQueryTreeParams(id),
    Esa_FilterEPath.节能考核根据树节点ID查询子节点列表,
  ).then(() => {
    convert(treeList.value);
  });
};

/**
 * 将数据转为节能考核需要的格式
 * @param data
 */
const convert = (data: Common_ITreeVO[]) => {
  quotaTreeList.value = data.map((item: Common_ITreeVO) => {
    return {
      id: item.id,
      treeName: item.treeName,
      treeNames: item.treeNames,
      clickStatus: item.clickStatus,
      hasChild: !!item.childTree?.length,
    };
  });
};

/**
 * 确定时间
 * @param e
 */
const bindDateChange = (e: any) => {
  quotaDate.value = e.detail.value;
  handleTreeQuery(null);
};

/**
 *定额类型变化
 * @param evt
 */
const radioChange = (evt: any) => {
  quotaType.value = evt.detail.value;
  if (quotaType.value === ESA_EQuotaType.年) {
    quotaDate.value = new Date().getFullYear().toString();
    fieldsVal.value = ESA_EFieldType.本年;
  } else {
    quotaDate.value = esaService.getDate();
    fieldsVal.value = ESA_EFieldType.本月;
  }
  clearData();
  handleTreeQuery(null);
};

/**
 * 选择能源类型
 * @param code
 */
const selectEnergyCode = (code: string) => {
  energyCode.value = code;
  clearData();
  handleTreeQuery(null);
};

/**
 * 选择树类型
 * @param code
 */
const selectTreeTypeCode = (code: string) => {
  treeType.value = code;
  clearData();
  handleTreeQuery(null);
};

// 搜索栏实例
const searchBarRef = ref();
/**
 * 输入框聚焦
 * @returns {void}
 */
const handleFocus = (): void => {
  focusFlag.value = true;
  queryHistoryList(Common_EMenuId.节能考核, energyCode.value, treeType.value);
};
/**
 * 触发查询
 * @param {string} event
 * @returns {void}
 */
const triggerSearch = (event: { value: string }): void => {
  searchLabel.value = event.value;
  searchFlag.value = true;
  focusFlag.value = false;
  selectedId.value = null;
  treeList.value = [];
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
  handleTreeQuery(null);
};
/**
 * 取消搜索
 * @returns {void}
 */
const handleSearchCancel = (): void => {
  selectedId.value = null;
  clearData();
  handleTreeQuery(null);
};
/**
 * 点击面包屑
 * @param {Es_IBreadcrumb} value
 * @returns {void}
 */
const handleCrumbSelect = (value: Es_IBreadcrumb): void => {
  handleSearchBreadSelect(value?.id, value?.treeName);
  handleTreeQuery(value.id);
};

// 节点名称
let name: string = '';

/**
 * 选择树节点
 * @param {number} id
 * @param {string} treeName
 * @param {string} treeName
 * @returns {void}
 */
const handleTreeSelect = (id: number, treeName: string, treeNames: string): void => {
  name = treeName;
  console.log('%c🚀 ~ esa-filter.vue ~ 391行', 'font-size: 18px', treeName);
};
/**
 * 查询下级节点
 * @param {number} id
 * @param {string} treeName
 */
const handleTreeDrill = (id: number, treeName: string) => {
  handleSearchBreadSelect(id, treeName);
  handleTreeQuery(id);
};

/**
 * 清除数据
 */
const clearData = () => {
  searchLabel.value = '';
  searchFlag.value = false;
  focusFlag.value = false;
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
};

const emits = defineEmits(['submit']);
/**
 * 确定选择
 */
const handleSubmit = () => {
  if (!energyCode.value) {
    uni.showToast({
      title: '请选择能源类型',
      icon: 'none',
      mask: true,
    });
    return;
  }
  if (!quotaType.value) {
    uni.showToast({
      title: '请选择定额类型',
      icon: 'none',
      mask: true,
    });
    return;
  }
  if (!quotaDate.value) {
    uni.showToast({
      title: '请选择日期',
      icon: 'none',
      mask: true,
    });
    return;
  }
  if (!selectedId.value) {
    uni.showToast({
      title: '请选择树节点',
      icon: 'none',
      mask: true,
    });
    return;
  }
  console.log('%c🚀 ~ esa-filter.vue ~ 461行', 'font-size: 18px', {
    energyCode: energyCode.value,
    treeId: selectedId.value,
    quotaType: quotaType.value,
    quotaTime: quotaDate.value,
  });
  emits('submit', {
    energyCode: energyCode.value,
    treeId: selectedId.value,
    quotaType: quotaType.value,
    quotaTime: quotaDate.value,
  });
  closePopup();
};
/**
 * 重置
 */
const handleReset = () => {
  quotaType.value = originObject.quotaType;
  quotaDate.value = esaService.getDate(originObject.quotaDate);
  energyCode.value = originObject.energyCode;
  treeType.value = originObject.treeType;
  selectedId.value = originObject.treeId;
  searchBreadCrumbList.value = cloneDeep(COMMON_DEFAULT_BREADCRUMB);
  clearData();
  handleTreeQuery(null);
};

defineExpose({
  openPopup,
});
</script>

<style lang="scss" scoped>
.esa-filter {
  height: v-bind(popupHeight);
  display: flex;
  flex-direction: column;
  border-radius: 24rpx 24rpx 0rpx 0rpxpx;
  background-color: var(--tem-bg-color);
  //头部
  .ef-header {
    height: 116rpx;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin: 0 32rpx;
    flex: none;

    uni-text {
      padding: 32rpx 0;
      height: 52rpx;
      font-weight: 600;
      font-size: var(--tem-font-size-h18);
      display: inline-flex;
      align-items: center;
    }
    .ef-close {
      height: 48rpx;
      width: 48rpx;
      position: absolute;
      right: 0;
    }
  }
  // 内容区域
  .ef-body {
    padding: 16rpx 0;
    flex: auto;
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: 0;
    .ef-body-search,
    .es-search-history {
      padding: 0 32rpx;
    }
    //标题
    &-title {
      height: 44rpx;
      line-height: 44rpx;
      margin-bottom: 24rpx;
      font-size: 28rpx;
      padding: 0 32rpx;
      color: var(--tem-text-color-secondary);
    }
    //定额类型
    &-radio {
      height: 112rpx;
      margin: 0 32rpx;
      color: var(--tem-text-color-secondary);
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2rpx solid var(--tem-border-color-light);
      uni-radio-group {
        display: flex;
        gap: 48rpx;
        color: var(--tem-text-color-regular);
      }
      :deep(.uni-radio-input) {
        width: 40rpx;
        height: 40rpx;
      }
      :deep(.radio) {
        display: flex;
        align-items: center;
        gap: 16rpx;
      }
    }
    //日期
    &-date {
      height: 112rpx;
      line-height: 112rpx;
      padding: 0;
      margin: 0 32rpx 24rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1rpx solid var(--tem-border-color-light);
      &-trigger {
        display: flex;
        align-items: center;
        line-height: 44rpx;
        color: var(--tem-text-color-regular);
        font-size: 32rpx;
      }
    }
    // 搜索
    &-search {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin: 8rpx 0;
      padding: 0 32rpx;

      :deep(.uni-easyinput) {
        flex: auto;

        .uni-easyinput__content {
          border-radius: 8rpx;
          background-color: var(--tem-fill-color) !important;
        }

        .is-focused .uni-icons.content-clear-icon,
        .uni-icons.content-clear-icon::before {
          color: var(--tem-text-color-secondary) !important;
        }
      }

      > text {
        white-space: nowrap;
        font-size: var(--tem-font-size-b16);
        color: var(--tem-color-primary);
      }
    }

    //吸顶容器
    &-wrap {
      min-height: 244rpx;
    }

    .ef-body-search {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-bottom: 24rpx;

      .uni-searchbar__cancel {
        color: var(--tem-color-primary);
      }

      .uni-searchbar__box {
        justify-content: flex-start;
      }

      .uni-input-input:focus {
        caret-color: var(--tem-color-primary);
      }
    }
    :deep(.common-data-empty) {
      height: 500rpx;
    }
    :deep(.common-search-empty) {
      height: 500rpx;
    }
  }
  .is-fixed {
    width: 100%;
    position: fixed;
    left: 0;
    top: 112rpx;
    transition: none;
    z-index: 9999;
    background-color: var(--tem-bg-color);
  }

  // 底部按钮
  .ef-bottom {
    padding: 0 32rpx;
    height: 144rpx;
    flex: none;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    align-items: center;
    gap: 32rpx;

    .ef-bottom-submit,
    .ef-bottom-reset {
      width: 160rpx;
      font-weight: 600;
      font-size: var(--tem-font-size-b16);
      border-radius: 8rpx;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 80rpx;
      border: 1rpx solid var(--tem-border-color);
      background-color: var(--tem-color-white);
      color: var(--tem-text-color-regular);
    }

    .ef-bottom-submit {
      flex: auto;
      background-color: var(--tem-color-primary);
      color: var(--tem-color-white);
      border: none;
    }
  }

  .ef-body-bar {
    height: 2rpx;
  }
  :deep(.uni-searchbar__box) {
    justify-content: flex-start;
  }
}
</style>
