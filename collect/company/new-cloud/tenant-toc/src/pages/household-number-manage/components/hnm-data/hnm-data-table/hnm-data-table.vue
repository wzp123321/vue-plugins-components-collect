<!--
 * @Author: yut
 * @Date: 2023-08-11 16:52:02
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 16:16:55
 * @Descripttion: 
-->
<template>
  <div class="hnm-data-table" v-loading="heTable.loading">
    <te-table v-if="!heTable.loading" :data="heTable.dataSource">
      <te-table-column type="index" label="序号" width="60" align="center">
        <template #default="scope">
          <span>{{ scope.$index + (heTable.pageForm.pageNum - 1) * heTable.pageForm.pageSize + 1 }} </span>
        </template>
      </te-table-column>
      <te-table-column prop="accountNumber" align="center" label="户号" show-overflow-tooltip />
      <te-table-column prop="energyName" align="center" width="100" label="能源类型" show-overflow-tooltip />
      <te-table-column prop="treeName" align="center" label="关联节点" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.treeName ? scope.row.treeName : '--' }}
        </template>
      </te-table-column>
      <te-table-column prop="month" align="center" width="60" label="月份" />
      <te-table-column prop="amount" align="center" label="用量" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.amount ? scope.row.amount : '--' }}
        </template>
      </te-table-column>
      <te-table-column prop="energyUnit" align="center" width="80" label="用量单位" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.energyUnit ? scope.row.energyUnit : '--' }}
        </template>
      </te-table-column>
      <te-table-column prop="actualPayment" align="center" label="实际缴费（元）" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.actualPayment ? scope.row.actualPayment : '--' }}
        </template>
      </te-table-column>
      <te-table-column prop="actualPrice" align="center" width="120" label="实际单价" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.actualPrice ? scope.row.actualPrice : '--' }}
        </template>
      </te-table-column>
      <te-table-column width="120" align="center" label="实际单价单位" show-overflow-tooltip>
        <template #default="scope"> 元/{{ scope.row.energyUnit }} </template>
      </te-table-column>
      <te-table-column label="账期" align="center" show-overflow-tooltip>
        <template #default="scope">
          {{
            scope.row.billStartTime && scope.row.billEndTime
              ? scope.row.billStartTime + '~' + scope.row.billEndTime
              : '--'
          }}
        </template>
      </te-table-column>
      <te-table-column width="160" label="操作" align="center">
        <template #default="scope">
          <te-button type="primary" link @click="onEditor(scope.row)">编辑</te-button>
          <te-button type="primary" link @click="heTable.showFilePreview(scope.row.fileVOList)">查看附件</te-button>
        </template>
      </te-table-column>
    </te-table>
    <te-pagination
      v-show="heTable.total > 0 && !heTable.loading"
      @size-change="heTable.onPageSizeChange"
      @current-change="heTable.onPageChange"
      :current-page="heTable.pageForm.pageNum"
      :page-sizes="heTable.pageSizeList"
      :page-size="heTable.pageForm.pageSize"
      layout="total, prev, pager, next, sizes, jumper"
      :total="heTable.total"
    ></te-pagination>
  </div>
</template>
<script lang="ts" setup>
import heTable from '../services/hnm-data-table.service';
import heForm from '../services/hnm-data-form.service';

// 编辑
const onEditor = (item: NHouseholdNumber.AccountNumberInfo) => {
  heForm.resetFormInEditor(heTable.searchYear, item);
  heForm.show();
};
</script>
<style lang="less" scoped>
.hnm-data-table {
  width: 100%;
  height: 100%;
}
</style>
