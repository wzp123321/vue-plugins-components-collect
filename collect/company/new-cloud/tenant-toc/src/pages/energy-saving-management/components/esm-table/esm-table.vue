<template>
  <div class="esm-table">
    <!-- 搜索栏 -->
    <div class="esm-table-search">
      <te-button type="primary" @click="addMeasure">新增</te-button>
      <te-select v-model="searchbarService.queryParamsRef" @change="searchbarService.search">
        <te-option
          v-for="(item, index) in searchbarService.periodList"
          :key="index"
          :value="item.index"
          :label="item.name"
        />
      </te-select>
      <te-button @click="searchbarService.search"><icon-refresh-right /></te-button>
    </div>

    <!-- tabs -->
    <div class="esm-table-box" v-loading="loading">
      <div v-if="!loading && esmTableDate.totalHeadList?.length > 0" class="esm-table-box-data">
        <!-- 总 -->
        <div class="esm-table-box-summary">
          <EsmSummary
            v-if="!loading && esmTableDate.totalHeadList?.length !== 0"
            :totalLineList="esmTableDate.totalLineList"
            :totalHeadList="esmTableDate.totalHeadList"
          ></EsmSummary>
        </div>

        <el-tabs v-model="activeTableType">
          <el-tab-pane :label="ESM_MeasureType.技术节能" :name="ESM_MeasureCode.技术节能" style="width: 100%">
            <!-- 技术节能表格 -->
            <div v-if="esmTableDate.lineList?.length > 0 && activeTableType === '1'">
              <EsmTTable
                :headList="esmTableDate.headList"
                :line-list="esmTableDate.lineList"
                :index="queryParams.index"
                :savingType="activeTableType"
                @search="search"
                @update="update"
              ></EsmTTable>
            </div>
            <no-data v-if="(!loading && !esmTableDate?.lineList?.length) || esmTableDate?.lineList === null"></no-data>
          </el-tab-pane>

          <el-tab-pane :label="ESM_MeasureType.管理节能" :name="ESM_MeasureCode.管理节能" style="width: 100%">
            <!-- 管理节能表格 -->
            <div v-if="esmTableDate.nextList?.length > 0 && activeTableType === '2'">
              <EsmTTable
                :headList="esmTableDate.headList"
                :line-list="esmTableDate.nextList"
                :index="queryParams.index"
                :savingType="activeTableType"
                @search="search"
                @update="update"
              ></EsmTTable>
            </div>
            <no-data v-if="(!loading && !esmTableDate?.nextList?.length) || esmTableDate?.nextList === null"></no-data>
          </el-tab-pane>
        </el-tabs>
      </div>
      <no-data v-if="!loading && esmTableDate.totalHeadList?.length === 0"></no-data>
    </div>
    <!-- 新增管理措施弹框 -->
    <EsmAdd ref="esmAddRef" @search="search" :savingType="activeTableType"></EsmAdd>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// 组件
import EsmTTable from './esm-t-table/esm-t-table.vue';
import { IconRefreshRight } from '@arco-iconbox/vue-te';
import EsmAdd from '../esm-add/esm-add.vue';
import EsmSummary from '../esm-summary/esm-summary.vue';

// 服务
import searchbarService, { Esm_IQueryParamsVO } from './esm-searchbar.service';
import EsmTableService from './esm-table.service';
// API
import { ESM_QueryListResponse } from '../../energy-saving-management.api';
import { ESM_MeasureType, ESM_MeasureCode } from '../../energy-saving-management.api';
import { getTenant } from '@/utils';
import { cloneDeep } from 'lodash';

const destroy$ = new Subject<void>();
const esmAddRef = ref();

const activeTableType = ref<string>('1');
const queryParams = ref<Esm_IQueryParamsVO>({
  index: null,
  startTime: '',
  endTime: '',
}); // 托管期入参
const loading = ref<boolean>(true);

const esmTableDate = ref<ESM_QueryListResponse>({
  headList: [],
  lineList: [],
  totalHeadList: [],
  nextList: [],
  totalLineList: [],
});
const updateTableData = ref<ESM_QueryListResponse>({
  headList: [],
  lineList: [],
  totalHeadList: [],
  nextList: [],
  totalLineList: [],
});

/**
 * 更新表格数据
 */
const update = () => {
  esmTableDate.value.lineList = cloneDeep(updateTableData.value.lineList);
};

/**
 * 获取节能管理表格数据
 */
const getTableData = async (params: Esm_IQueryParamsVO, savingType: string) => {
  try {
    loading.value = true;
    const res = await EsmTableService.queryTableData({ ...params, savingType, ...getTenant() });
    if (res?.data && res.code === 200) {
      esmTableDate.value = {
        lineList: res.data.lineList?.map((item, index) => {
          return {
            tenantId: item?.tenantId,
            savingType: item.savingType,
            energyCode: item.energyCode,
            energyName: item.energyName,
            energyUnit: item.energyUnit,
            measureId: item.measureId,
            measureName: item.measureName,
            dataList: item.dataList,
            lineTotal: item.lineTotal,
            summaryFlag: item.summaryFlag,
            totalFlag: item.totalFlag,
            remarks: item.remarks,
            savingFlag: item.savingFlag,
            rowKey: index,
          };
        }),
        headList: res.data.headList?.slice(2, res.data.headList?.length - 1),
        totalHeadList: res?.data?.totalHeadList ?? [],
        totalLineList: res?.data?.totalLineList ?? [],
        nextList: res?.data?.nextList ?? [],
      };
      updateTableData.value = cloneDeep({
        lineList: res.data.lineList?.map((item, index) => {
          return {
            savingType: item.savingType,
            energyCode: item.energyCode,
            energyName: item.energyName,
            energyUnit: item.energyUnit,
            measureId: item.measureId,
            measureName: item.measureName,
            dataList: item.dataList,
            lineTotal: item.lineTotal,
            summaryFlag: item.summaryFlag,
            totalFlag: item.totalFlag,
            remark: item.remarks,
            savingFlag: item.savingFlag,
            rowKey: index,
          };
        }),
        headList: res.data.headList?.slice(2, res.data.headList?.length - 1),
      });
    } else {
      esmTableDate.value = {
        lineList: [],
        headList: [],
        nextList: [],
        totalHeadList: [],
        totalLineList: [],
      };
      updateTableData.value = {
        lineList: [],
        headList: [],
        nextList: [],
        totalHeadList: [],
        totalLineList: [],
      };
    }
  } catch (error) {
    console.log(error);
    esmTableDate.value = {
      lineList: [],
      headList: [],
      nextList: [],
      totalHeadList: [],
      totalLineList: [],
    };
    updateTableData.value = {
      lineList: [],
      headList: [],
      nextList: [],
      totalHeadList: [],
      totalLineList: [],
    };
  } finally {
    loading.value = false;
    searchbarService.code = params.index;
  }
};
// 新增管理措施弹窗
const addMeasure = () => {
  esmAddRef.value.show();
};

// 搜索
const search = () => {
  getTableData(queryParams.value, activeTableType.value);
};

onMounted(() => {
  searchbarService.searchParams$.pipe(takeUntil(destroy$)).subscribe((v) => {
    queryParams.value.index = v.index;
    queryParams.value.startTime = v.startTime;
    queryParams.value.endTime = v.endTime;
    getTableData(queryParams.value, activeTableType.value);
  });
});
onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>

<style lang="less" scoped>
.esm-table {
  height: 100%;
  display: flex;
  flex-direction: column;

  .esm-table-search {
    display: flex;
    align-items: center;
    padding-bottom: var(--te-space-16);
    justify-content: flex-end;

    .te-select {
      width: 244px;
      margin: 0 var(--te-space-12);
    }
  }

  .esm-table-box {
    flex: 1 1 auto;

    > .tenant-nodata {
      height: 100%;
    }

    .esm-table-box-data {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-tabs__item) {
      font-weight: 700;
    }

    :deep(.el-tabs__header) {
      margin: 0 0;
    }

    .esm-table-box-summary {
      min-height: 150px;
      margin-bottom: 24px;
    }
  }
}
</style>
