<template>
  <div class="ea-office-energy-detail" v-loading="detailService.loading">
    <div class="eoed-tool-bar flex-row-justify-center">
      <module-subhead :title="'能耗明细'"> </module-subhead>
      <button
        class="eoed-button"
        primary
        v-if="detailService.dataSource.length > 0 && !detailService.loading"
        @click="detailService.exportDetail"
      >
        {{ exportTableLoading ? '正在导出' : '导出' }}
      </button>
    </div>

    <el-table
      v-if="detailService.dataSource.length > 0 && !detailService.loading"
      :data="detailService.dataSource"
      style="width: 100%"
      :height="mapTableHeight()"
    >
      <el-table-column label="序号" :width="60">
        <template #default="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="时间" prop="time"> </el-table-column>
      <el-table-column :label="`能耗值(${detailService.unit})`" prop="value">
        <template #default="scope">
          <div :title="scope.row.value">
            {{ thousandSeparation(scope.row.value) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="`同比能耗(${detailService.unit})`">
        <template #default="scope">
          <div :title="thousandSeparation(scope.row.lastYearValue)">
            {{ thousandSeparation(scope.row.lastYearValue) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="同比值">
        <template #default="scope">
          <div :title="scope.row.lastYearRatio !== null ? `${scope.row.lastYearRatio}%` : '--'">
            {{ scope.row.lastYearRatio !== null ? `${scope.row.lastYearRatio}%` : '--' }}
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="`环比能耗(${detailService.unit})`">
        <template #default="scope">
          <div :title="thousandSeparation(scope.row.lastMonthValue)">
            {{ thousandSeparation(scope.row.lastMonthValue) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="环比值" prop="lastMonthRatio">
        <template #default="scope">
          <div :title="scope.row.lastMonthRatio !== null ? `${scope.row.lastMonthRatio}%` : '--'">
            {{ scope.row.lastMonthRatio !== null ? `${scope.row.lastMonthRatio}%` : '--' }}
          </div>
        </template>
      </el-table-column>
    </el-table>
    <no-data v-if="detailService.dataSource.length === 0 && !detailService.loading"></no-data>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { ref, onUnmounted, onMounted } from 'vue';
// 工具方法
import { useCommonController } from '@/utils/use-common-controller';
import { OfficeDetailService, TableParams } from './ea-office-energy-detail.service';
import { thousandSeparation } from '@/utils';
import { COMMON_TABLE_CELL_HEIGHT, COMMON_TABLE_HEADER_HEIGHT } from '@/services/common/common-api';
// 事件监听
const { emitter } = useCommonController();
// 数据服务
const detailService = new OfficeDetailService();
// 导出loading
const exportTableLoading = ref(false);
/**
 * 生成表格高度
 */
const mapTableHeight = () => {
  return Math.min(detailService.dataSource?.length, 6) * COMMON_TABLE_CELL_HEIGHT + COMMON_TABLE_HEADER_HEIGHT;
};
/**
 * 表格列宽
 * @param index
 */
const mapColumnWidth = (index: number) => {
  return index === 0 ? '100' : 'auto';
};
/**
 * 处理单元格文本
 * @param label
 * @param index
 */
const mapTdLabel = (label: string, index: number) => {
  return index < 2 || label?.includes('%') || label === null || label === ''
    ? label ?? '--'
    : thousandSeparation(Number(label));
};
/**
 * 初始化
 */
onMounted(() => {
  emitter.on('search-office-global', (searchParam: TableParams) => {
    detailService.tableParams.startTime = searchParam.startTime.split(' ')[0];
    detailService.tableParams.endTime = searchParam.endTime.split(' ')[0];
    detailService.tableParams.energyCode = searchParam.energyCode;
    detailService.tableParams.treeId = searchParam.treeId;
    detailService.query();
  });
});
/**
 * 组件销毁
 */
onUnmounted(() => {
  emitter.off('search-office-global');
});
</script>
<style lang="less" scoped>
.ea-office-energy-detail {
  width: 100%;
  position: relative;
  min-height: 164px;

  .eoed-tool-bar {
    padding-bottom: 12px;
  }
}
</style>
