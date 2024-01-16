<template>
  <div class="breakpoint-resume">
    <page-common :title="'断点续传记录'" :showSearch="true">
      <template v-slot:pageSearch>
        <el-form :model="tabelService.formSearch" :inline="true" @submit.native.prevent>
          <el-form-item>
            <el-input
              class="adss-name-input"
              v-inputFilter:search
              v-model="tabelService.formSearch.nodeName"
              placeholder="请输入节点名称"
              maxlength="20"
              :suffix-icon="Search"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="能源类型">
            <el-select v-model="tabelService.formSearch.energyType">
              <el-option
                v-for="item in tabelService.energyList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
                :title="item.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="断点时间">
            <el-date-picker
              v-model="tabelService.formSearch.breakDate"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              range-separator="~"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="defaultTime"
            />
          </el-form-item>
          <el-form-item>
            <button primary @click="onSubmit">查询</button>
          </el-form-item>
          <el-form-item>
            <button @click="onReset">重置</button>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:pageContent>
        <div class="br-btn">
          <div class="br-title">断点续传记录列表</div>
        </div>
        <div class="br-table-container" v-loading="tabelService.loading">
          <div v-show="tabelService.loading" class="br-table-mask"></div>
          <el-table max-height="536px" :data="tabelService.dataSource">
            <el-table-column label="序号" width="100px">
              <template #default="scope">
                {{
                  (tabelService.queryParams.pageNum - 1) *
                    tabelService.queryParams.pageSize +
                  scope.$index +
                  1
                }}
              </template>
            </el-table-column>
            <el-table-column label="断点时间">
              <template #default="scope">
                <span :title="scope.row.energyDataTime || '--'">
                  {{ scope.row.energyDataTime || '--' }}</span
                >
              </template>
            </el-table-column>
            <el-table-column label="节点名称">
              <template #default="scope">
                <span :title="scope.row.treeName || '--'">
                  {{ scope.row.treeName || '--' }}</span
                >
              </template>
            </el-table-column>
            <el-table-column label="能源类型" width="100px">
              <template #default="scope">
                <span :title="scope.row.energyCodeName || '--'">
                  {{ scope.row.energyCodeName || '--' }}</span
                >
              </template>
            </el-table-column>
            <el-table-column label="能耗修复时间">
              <template #default="scope">
                <span :title="scope.row.resumeTime || '--'">
                  {{ scope.row.resumeTime || '--' }}</span
                >
              </template>
            </el-table-column>
            <el-table-column label="描述">
              <template #default="scope">
                <span :title="scope.row.content || '--'">
                  {{ scope.row.content || '--' }}</span
                >
              </template>
            </el-table-column>
          </el-table>
          <ems-pagination
            v-show="!tabelService.loading && tabelService.dataSource.length > 0"
            :current-page="tabelService.queryParams.pageNum"
            :page-sizes="pageSizes"
            @size-change="tabelService.handlePageSizeChange"
            @current-change="tabelService.handlePageChange"
            :page-size="tabelService.queryParams.pageSize"
            :total="tabelService.total"
          >
          </ems-pagination>
        </div>
      </template>
    </page-common>
  </div>
</template>

<script lang="ts" setup>
import { TableService } from './breakpoint-resume.service';
import { pageSizes } from '@/config/index';
import { Search } from '@element-plus/icons-vue';
import { formatDate } from '@/utils';
import { ref } from 'vue';

const tabelService = new TableService();
const defaultTime = ref([
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
]);

function onSubmit() {
  tabelService.query();
}
function onReset() {
  tabelService.formSearch.nodeName = '';
  tabelService.formSearch.energyType = '';
  tabelService.formSearch.breakDate = [
    `${formatDate(new Date(), 'yyyy-MM-dd')} 00:00:00`,
    formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  ];
  tabelService.query();
}
</script>

<style lang="less" scoped>
.breakpoint-resume {
  height: 100%;
  .br-table-mask {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background-color: white;
    z-index: 5;
  }
  .br-btn {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    .br-title {
      display: flex;
      align-items: flex-start;
      line-height: 18px;
      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 16px;
        margin-right: 8px;
        background-color: rgba(24, 144, 255, 1);
      }
    }
  }
  .br-table-container {
    height: calc(100% - 60px);
    position: relative;
  }
  :deep(.el-input__suffix-inner) {
    display: flex;
    align-items: center;
  }
  :deep(.el-range-editor.el-input__inner) {
    padding-right: 25px;
  }
}
</style>
