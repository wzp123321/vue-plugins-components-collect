<template>
  <div class="energy-consumption-budget">
    <div class="ect-main">
      <!-- 2023-1030-能耗预算和能耗预算全期表合并 -->
      <div class="ect-main-header">
        <h5>能耗预算</h5>
        <div class="ect-main-header-form">
          <MadToolbarComponent v-if="!mapIsSingle()"></MadToolbarComponent>
          <te-select v-model="searchForm.dateCode" @change="handlePeriodChange">
            <te-option
              v-for="(item, index) in hostPeriodList"
              :key="'date_' + index"
              :label="item.name"
              :value="item.code"
            ></te-option>
          </te-select>
          <te-button @click="handleSearch"><icon-refresh-right /></te-button>
        </div>
      </div>
      <!-- 能耗预算 -->
      <EbtHome v-if="mapIsSingle()" ref="ecbHomeRef"></EbtHome>
      <!-- 能耗预算全期表 -->
      <mad-table-component ref="madTableRef" v-else></mad-table-component>
    </div>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { ref, onMounted, nextTick } from 'vue';
// 组件
import EbtHome from './ecb-home/ecb-home.vue';
import MadTableComponent from './ma-annual-details/ma-ad-table/ma-ad-table.vue';
import MadToolbarComponent from './ma-annual-details/ma-ad-toolbar/ma-ad-toolbar.vue';
import { IconRefreshRight } from '@arco-iconbox/vue-te';

import { postRequest } from '@/service/request';
// api
import { Ebt_IBaseHeadQueryHostingPeriodsResponse, Ebt_ISearchVO } from './ecb-home/ecb-home.api';
// 枚举
import { ECommonPath } from '@/service/path';
// 工具方法
import { getTenant } from '@/utils';
import { cloneDeep } from 'lodash';
import { FBatchRemoveStorageData, FGetStorageData } from '@/utils/storage';

// 能耗预算表表格
const ecbHomeRef = ref();
// 能耗预算全期表组件
const madTableRef = ref();

// 托管期列表
const hostPeriodList = ref<Ebt_IBaseHeadQueryHostingPeriodsResponse[]>([]);
/**
 * 查询托管期列表
 */
const queryScopeList = async () => {
  try {
    const res = await postRequest(ECommonPath.查询托管期信息, getTenant());
    if (res && res?.data?.length) {
      hostPeriodList.value = res?.data ?? [];
      hostPeriodList.value.unshift({
        code: 0,
        name: '全周期',
        status: false,
        start: null,
        months: '',
        end: null,
      });
    } else {
      hostPeriodList.value = [];
    }
  } catch (error) {
    hostPeriodList.value = [];
  }
};

// 表单
const searchForm = ref<Ebt_ISearchVO>({
  dateCode: null,
  startTime: '',
  endTime: '',
  months: '',
});
// 当前托管期
const selectedCode = ref<number>(1);
/**
 * 判断是全期表还是单期
 */
const mapIsSingle = (): boolean => {
  return !!selectedCode.value;
};
/**
 * 切换托管期
 */
const handlePeriodChange = () => {
  if (!searchForm.value.dateCode) {
    searchForm.value.dateCode = 0;
    searchForm.value.startTime = '';
    searchForm.value.endTime = '';
    searchForm.value.months = '';
  } else {
    hostPeriodList.value?.forEach((item) => {
      if (searchForm.value.dateCode && item.code === searchForm.value.dateCode) {
        searchForm.value.startTime = mapTime(item.start.year, item.start.monthOfYear);
        searchForm.value.endTime = mapTime(item.end.year, item.end.monthOfYear);
        searchForm.value.months = item.months;
      }
    });
  }

  // 主动查询
  handleSearch();
};
const mapTime = (year: number, month: number) => {
  return `${year}-${month > 9 ? month : '0' + month}`;
};
/**
 * 查询
 */
const handleSearch = () => {
  selectedCode.value = cloneDeep(searchForm.value.dateCode as number);

  if (mapIsSingle()) {
    nextTick(() => {
      if (ecbHomeRef.value) {
        ecbHomeRef.value?.search(cloneDeep(searchForm.value));
      }
    });
  } else {
    nextTick(() => {
      if (madTableRef.value) {
        madTableRef.value?.triggerSearch(cloneDeep(searchForm.value));
      }
    });
  }
};
/**
 * 初始化
 */
onMounted(async () => {
  await queryScopeList();
  // 判断是否有缓存
  if (FGetStorageData('toc-budgetFlag')) {
    searchForm.value.dateCode = hostPeriodList.value?.[0]?.code;
    FBatchRemoveStorageData(['toc-budgetFlag']);
  } else {
    // 设置默认值-全周期
    searchForm.value.dateCode = 0;
    // 判断当前日期在不在托管期内
    const existFlag = hostPeriodList.value.some((item) => {
      return (
        item.code !== 0 &&
        new Date(item.start.millis).getTime() <= new Date().getTime() &&
        new Date(item.end.millis).getTime() >= new Date().getTime()
      );
    });
    if (existFlag) {
      // 默认选中
      hostPeriodList.value.forEach((item) => {
        if (item.status) {
          searchForm.value.dateCode = item.code;
        }
      });
    }
  }

  handlePeriodChange();
});
</script>
<style lang="less" scoped>
.energy-consumption-budget {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: var(--te-space-20);
  background-color: var(--te-bg-color);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 16px;
  align-items: stretch;

  background-color: rgba(240, 244, 249, 1);

  > div.ect-main {
    flex: auto;
    margin-top: 10px;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    background-color: #fff;

    padding: var(--te-space-20);
    min-width: 1440px;

    .ect-main-header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid rgb(220, 223, 230);

      h5 {
        color: var(--te-text-color-primary);
        font-size: var(--te-font-size-h20);
        font-weight: 600;
        line-height: 28px;
      }

      .ect-main-header-form {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
}
</style>
