<template>
  <div class="adss-table">
    <div class="adsst-btn">
      <div class="adss-title">分摊策略</div>
      <button class="adss-add" primary @click="addStrategy()">新增</button>
    </div>
    <div class="adss-table-container" v-loading="tableService.loading">
      <div v-show="tableService.loading" class="adss-table-mask"></div>
      <el-table max-height="536px" :data="tableService.dataSource">
        <el-table-column label="序号" width="80px">
          <template #default="scope">
            {{ (tableService.queryParams.pageNum - 1) * tableService.queryParams.pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="策略名称" width="200px">
          <template #default="scope">
            <span :title="scope.row.apportionedName || '--'"> {{ scope.row.apportionedName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="能源类型" width="100px">
          <template #default="scope">
            <span :title="scope.row.energyName || '--'"> {{ scope.row.energyName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分摊源">
          <template #default="scope">
            <span :title="scope.row.apportionedSource?.replaceAll(',', '\n') || '--'" class="adss-source">
              {{ scope.row.apportionedSource || '--' }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="分摊对象">
          <template #default="scope">
            <span :title="scope.row.apportionedObjectName || '--'"> {{ scope.row.apportionedObjectName || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分摊规则">
          <template #default="scope">
            <span :title="scope.row.apportionedRule || '--'"> {{ scope.row.apportionedRule || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分摊周期">
          <template #default="scope">
            <span :title="scope.row.apportionedStartTime + '~' + (scope.row.apportionedEndTime || '至今')">
              {{ scope.row.apportionedStartTime + '~' + (scope.row.apportionedEndTime || '至今') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template #default="scope">
            <button text @click="seeDetail(scope.row)">查看</button>
            <button text @click="editRule(scope.row)">编辑</button>
            <el-popconfirm
              title="确认删除该条数据吗?"
              placement="bottom"
              confirmButtonText="确定"
              cancelButtonText="取消"
              cancelButtonType="default"
              @confirm="tableService.deleteIndicator(scope.row.id)"
            >
              <template #reference>
                <button text style="color: rgba(245, 34, 45, 1)">删除</button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <ems-pagination
        v-show="!tableService.loading && tableService.dataSource.length > 0"
        :current-page="tableService.queryParams.pageNum"
        :page-sizes="pageSizes"
        @size-change="tableService.handlePageSizeChange"
        @current-change="tableService.handlePageChange"
        :page-size="tableService.queryParams.pageSize"
        :total="tableService.total"
      >
      </ems-pagination>
    </div>
    <!-- 查看抽屉 -->
    <AdssViewDrawer ref="viewDrawerRef"></AdssViewDrawer>
    <!-- 编辑&新增抽屉 -->
    <AdssAddEditDrawer ref="addEditDrawerRef" @addEditSuccess="tableService.query()"></AdssAddEditDrawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, onMounted } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TableService } from './adss-table.service';
// 配置
import { pageSizes } from '@/config/index';
import { At_ITableItem } from './adss-table.api';
// 组件
import AdssViewDrawer from '../adss-view-drawer/adss-view-drawer.vue';
import AdssAddEditDrawer from '../adss-add-edit-drawer/adss-add-edit-drawer.vue';
// 搜索服务
import adssSearchBar from '../adss-search-bar/adss-search-bar.service';

const destroy = new Subject<void>();

const tableService = new TableService();

onMounted(() => {
  // 数据
  adssSearchBar.searchParams$.pipe(takeUntil(destroy)).subscribe((v) => {
    tableService.queryParams.pageNum = 1;
    tableService.query(v);
  });
});

/**
 *
 */
onUnmounted(() => {
  destroy.next();
  destroy.complete();
});

/**
 * 新增
 */
function addStrategy() {
  addEditDrawerRef.value && addEditDrawerRef.value?.show();
}

// 查看弹框实例
const viewDrawerRef = ref();
// 编辑&新增弹框实例
const addEditDrawerRef = ref();
// 查看详情
const seeDetail = (data: At_ITableItem) => {
  viewDrawerRef.value && viewDrawerRef.value?.show(data);
};
// 编辑
const editRule = (data: At_ITableItem) => {
  addEditDrawerRef.value && addEditDrawerRef.value?.show(data);
};
</script>

<style lang="less">
.adss-table {
  height: 100%;
  padding-top: 16px;
  .adsst-btn {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    .adss-title {
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
  .adss-table-container {
    height: calc(100% - 60px);
    position: relative;
  }
  .adss-table-mask {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background-color: white;
    z-index: 5;
  }
  .adss-source {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
