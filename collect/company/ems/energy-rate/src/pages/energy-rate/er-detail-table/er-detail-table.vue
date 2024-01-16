<!--
 * @Author: yut
 * @Date: 2023-07-28 16:53:32
 * @LastEditors: yut
 * @LastEditTime: 2023-08-31 19:28:43
 * @Descripttion: 
-->
<template>
  <div class="er-detail-table" v-loading="energyRateService.loading">
    <te-table
      v-if="!energyRateService.loading"
      :data="energyRateService.tableData"
      style="width: 100%; text-align: center"
    >
      <te-table-column type="index" label="序号" width="80" align="center">
        <template #default="scope">
          <span>{{ scope.$index + (energyRateService.pageIndex - 1) * energyRateService.pageSize + 1 }} </span>
        </template>
      </te-table-column>
      <te-table-column prop="energyCodeName" label="能源类型" min-width="95" align="center"> </te-table-column>
      <te-table-column prop="energyUnit" label="单位" align="center">
        <template #default="scope">
          <p v-html="scope.row.energyUnit"></p>
        </template>
      </te-table-column>
      <te-table-column prop="templateTypeText" label="模板类型" min-width="95" align="center"> </te-table-column>
      <te-table-column prop="sharp" label="尖（元）" min-width="100" align="center">
        <template #default="scope">
          <div class="text">{{ thousandSeparation(scope.row.sharp) }}</div>
        </template>
      </te-table-column>
      <te-table-column prop="peak" label="峰（元）" min-width="100" align="center">
        <template #default="scope">
          <div class="text">{{ thousandSeparation(scope.row.peak) }}</div>
        </template>
      </te-table-column>
      <te-table-column prop="flat" label="平（元）" min-width="100" align="center">
        <template #default="scope">
          <div class="text">{{ thousandSeparation(scope.row.flat) }}</div>
        </template>
      </te-table-column>
      <te-table-column prop="valley" label="谷（元）" min-width="100" align="center">
        <template #default="scope">
          <div class="text">{{ thousandSeparation(scope.row.valley) }}</div>
        </template>
      </te-table-column>
      <te-table-column prop="parity" label="平价（元）" min-width="100" align="center">
        <template #default="scope">
          <div class="text">{{ thousandSeparation(scope.row.parity) }}</div>
        </template>
      </te-table-column>
      <te-table-column label="生效时间" min-width="110" show-overflow-tooltip align="center">
        <template #default="scope">
          {{
            scope.row?.expirationTime == null
              ? scope.row?.effectiveTime + '~' + '至今'
              : scope.row?.effectiveTime + '~' + scope.row?.expirationTime
          }}
        </template>
      </te-table-column>
      <te-table-column label="操作" align="center">
        <template #default="scope">
          <span class="edit" @click="editTemplate(scope.row)">修改</span>
        </template>
      </te-table-column>
    </te-table>
    <te-pagination
      v-if="energyRateService.total > 0 && !energyRateService.loading"
      v-model:currentPage="energyRateService.pageIndex"
      :page-sizes="PAGES"
      :page-size="energyRateService.pageSize"
      layout="total, prev, pager, next, sizes, jumper"
      :total="energyRateService.total"
      @size-change="energyRateService.handleSizeChange"
      @current-change="energyRateService.handleCurrentChange"
    >
    </te-pagination>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import { thousandSeparation } from '../../../utils';
import energyRateService from '../energy-rate.service';
import { PAGES } from '../../../config';

import { EEditType, ER_IRateTemplateList } from '../energy-rate.api';

onMounted(() => {
  energyRateService.getTemplateListData();
});

/**
 * 编辑修改模板
 * @param row
 */
const editTemplate = (row: ER_IRateTemplateList) => {
  energyRateService.editData = {
    energyCode: row.energyCode,
    id: row.id,
    templateType: row.templateType,
    effectiveTime: row.effectiveTime ?? null,
    expirationTime: row.expirationTime ?? null,
    parity: row.parity !== null ? row.parity.toString() : null,
    sharp: row.sharp !== null ? row.sharp.toString() : null,
    peak: row.peak !== null ? row.peak.toString() : null,
    flat: row.flat !== null ? row.flat.toString() : null,
    valley: row.valley !== null ? row.valley.toString() : null,
  };
  energyRateService.visible = true;
  energyRateService.editType = EEditType.修改;
};
</script>
<style lang="less" scoped>
.er-detail-table {
  width: 100%;
  height: 100%;
  .edit {
    color: var(--te-color-primary);
    cursor: pointer;
  }
}
</style>
