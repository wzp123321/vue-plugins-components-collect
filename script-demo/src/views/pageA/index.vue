<template>
  <div class="page-a">
    <te-tablebar
      placeholder="老人姓名/档案号"
      v-model="queryParams.searchValue"
      :hiddenMoreSearch="false"
      @onReset="reset"
      @onQuery="queryAll"
      @onRefresh="refresh"
      @input="queryAll"
      maxlength="200"
      show-word-limit
    >
      <template #header>
        <section class="header-opterate">
          <te-button type="primary" @click="create">新增</te-button>
          <import-button
            v-auth="'seniorProfile.import'"
            importUrl="/sec/excel/importData"
            :templateCode="IMPORT_TEMP_CODE"
            :import-param="{
              type: IMPORT_TEMP_CODE,
            }"
            templateFileName="xxxx"
            @success="query"
          ></import-button>
          <export-button
            v-auth="'seniorProfile.export'"
            :selectedCount="2"
            :params="{}"
            :allCount="totalAll"
            fileName="老人档案"
          ></export-button>
        </section>
      </template>
      <template #suffix>
        <ColSettingBtn
          class="btn"
          v-model="tableColumnData"
          :save-param="TABLE_PARAMS"
          :save-api="updateTableColumns"
        >
        </ColSettingBtn>
      </template>
      <template #searchList>
        <te-row :gutter="8" class="row-container">
          <te-col :span="8">
            <div class="common-searchbox">
              <span class="common-label">性别</span>
              <te-input
                v-model="queryParams.gender"
                placeholder="请输入"
                class="search-select"
              ></te-input>
            </div>
          </te-col>
          <te-col :span="8">
            <div class="common-searchbox">
              <span class="common-label">入住状态</span>
              <te-input
                v-model="queryParams.bedOccupancyStatus"
                placeholder="请输入"
                class="search-select"
              ></te-input>
            </div>
          </te-col>
          <te-col :span="8">
            <div class="common-searchbox">
              <span class="common-label">创建人</span>
              <te-input
                v-model="queryParams.createBy"
                placeholder="请输入"
                class="search-select"
              ></te-input>
            </div>
          </te-col>
          <te-col :span="8">
            <div class="common-searchbox">
              <span class="common-label">创建时间</span>
              <te-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                class="search-date-picker"
                @change="handleDateRangeChange"
              ></te-date-picker>
            </div>
          </te-col>
        </te-row>
      </template>
      <template #footer>
        <div class="footer"></div>
      </template>
    </te-tablebar>

    <te-module-table
      ref="tableRef"
      is-flex
      :request-api="getList"
      :allCount="totalAll"
      :initParam="queryParams"
      :request-column-api="getTableColumns"
      :columnCallback="requestColumnCallBack"
      :data-callback="requestDataCallBack"
      :initColumnParam="TABLE_PARAMS"
      showOperationColumn
      :showIndexColumn="true"
      :showSelectColumn="true"
      @selection-change="handleSelectionChanged"
    >
      <template #operation="{ row }">
        <TeTableButtonGroup
          @operate="operateRow"
          :row="row"
          :tableButton="operateBtns"
        ></TeTableButtonGroup>
      </template>
    </te-module-table>
  </div>
</template>
<script lang="ts" setup>
import {
  TeTableButtonGroup,
  TeModuleTable,
  ColSettingBtn,
} from '@tiansu/ts-web-package';
import { SEARCH_PARAMS, TABLE_PARAMS, IMPORT_TEMP_CODE } from './constant.ts';
import { getTableColumns, updateTableColumns } from '@/apis/common';
import { getList } from '@/apis/pageA/index.ts';
import useOperateBtns from './hooks/useBtnHandles.ts';
import { RowType } from '@/apis/pageA/index.api.ts';
import { useTable } from '@/hooks/useTable.ts';
import ImportButton from '@/components/importButton/index.vue';
import ExportButton from '@/components/exportButton/index.vue';
import { reactive, ref, watch } from 'vue';

const {
  totalAll,
  tableColumnData,
  requestColumnCallBack,
  handleSelectionChanged,
  requestDataCallBack,
  tableRef,
  queryAll,
  refresh,
  queryParams,
  reset,
  query,
} = useTable<RowType, typeof SEARCH_PARAMS>(SEARCH_PARAMS);
const { operateBtns, operateRow, create } = useOperateBtns(tableRef);
const data = reactive({
  a: 1,
});
console.log(data);

setTimeout(() => {
  data.a = 1000;
  console.log(data);
}, 1000);
// 日期范围选择器
const dateRange = ref<[string, string] | undefined>(undefined);
// 处理日期范围变化
const handleDateRangeChange = (val: [string, string] | null) => {
  if (val && val.length === 2) {
    queryParams.value.startCreateTime = val[0] || '';
    queryParams.value.endCreateTime = val[1] || '';
    dateRange.value = val;
  } else {
    queryParams.value.startCreateTime = '';
    queryParams.value.endCreateTime = '';
    dateRange.value = undefined;
  }
};
// 监听查询参数变化，同步日期范围选择器
watch(
  () => [queryParams.value.startCreateTime, queryParams.value.endCreateTime],
  ([start, end]) => {
    if (start && end) {
      dateRange.value = [start, end];
    } else {
      dateRange.value = undefined;
    }
  },
);
</script>
<style lang="scss" scoped>
.pageA-container {
  .header-opterate {
    display: flex;
    gap: 12px;
  }
  .footer {
    height: 8px;
  }
}

.row-container {
  padding: 0 24px;
  margin: -12px 0;
  .common-searchbox {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 12px 0;
    .common-label {
      margin-right: 12px;
      font-size: 14px;
      text-align: right;
      width: 100px;
      flex-shrink: 0; /* 禁止收缩 */
      flex-grow: 0; /* 禁止放大 */
    }

    .search-select,
    .search-date-picker {
      width: 100%;
      min-width: 120px;
    }
  }
}
</style>
