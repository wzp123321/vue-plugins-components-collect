<!--
 * @Author: yut
 * @Date: 2023-09-21 15:31:53
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 16:50:44
 * @Descripttion: 
-->
<template>
  <div class="pb-project-basic-data">
    <te-table
      :data="pbService.dataSource?.baseData?.moduleVOList"
      :cell-class-name="cellClassName"
      size="large"
      v-if="pbService.dataSource?.baseData?.moduleVOList.length"
    >
      <te-table-column
        align="center"
        show-overflow-tooltip
        :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_INDEX_MIN_WIDTH"
        :label="pbService.fixedTitleList[0]?.name"
        :prop="pbService.fixedTitleList[0]?.code"
        fixed="left"
      />
      <te-table-column
        align="left"
        show-overflow-tooltip
        :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_CATEGORY_MIN_WIDTH"
        :label="pbService.fixedTitleList[1]?.name"
        :prop="pbService.fixedTitleList[1]?.code"
        fixed="left"
      />
      <te-table-column
        align="right"
        show-overflow-tooltip
        :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_TOTAL_MIN_WIDTH"
        :label="pbService.fixedTitleList[2]?.name"
        :prop="pbService.fixedTitleList[2]?.code"
        fixed="left"
      >
        <template #default="scope">
          <te-tooltip
            placement="top"
            trigger="hover"
            v-if="scope.row.predictTotalCost"
            :content="
              scope.row.rateFlag
                ? convertToPercentage(scope.row.predictTotalCost)
                : thousandSeparation(scope.row.predictTotalCost, 2)
            "
          >
            <span>
              {{
                scope.row.rateFlag
                  ? convertToPercentage(scope.row.predictTotalCost)
                  : thousandSeparation(scope.row.predictTotalCost, 2)
              }}
            </span>
          </te-tooltip>
          <span v-else>
            {{
              scope.row.rateFlag
                ? convertToPercentage(scope.row.predictTotalCost)
                : thousandSeparation(scope.row.predictTotalCost, 2)
            }}
          </span>
        </template>
      </te-table-column>
      <te-table-column
        v-for="(it, index) in pbService.titleList"
        :key="index"
        align="right"
        show-overflow-tooltip
        :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_DATA_MIN_WIDTH"
        :label="it.name"
        :prop="it.code"
      >
        <template #default="scope">
          <te-input
            v-if="pbService.mapIsEditing(scope.row, pbService.dataSource?.baseData.moduleIndex, scope.$index)"
            v-inputFilter:number="{ integral: 10, decimal: 2 }"
            v-model="scope.row.values[it.code].predictCostAfterTax"
          />
          <te-tooltip
            placement="top"
            trigger="hover"
            v-if="
              !pbService.mapIsEditing(scope.row, pbService.dataSource?.baseData.moduleIndex, scope.$index) &&
              pbService.mapIsShow(scope.row.values[it.code]?.predictCostAfterTax)
            "
            :content="
              scope.row.rateFlag
                ? convertToPercentage(scope.row.values[it.code]?.predictCostAfterTax)
                : thousandSeparation(scope.row.values[it.code]?.predictCostAfterTax, 2)
            "
          >
            <span>
              {{
                scope.row.rateFlag
                  ? convertToPercentage(scope.row.values[it.code]?.predictCostAfterTax)
                  : thousandSeparation(scope.row.values[it.code]?.predictCostAfterTax, 2)
              }}
            </span>
          </te-tooltip>
          <span
            v-if="
              !pbService.mapIsEditing(scope.row, pbService.dataSource?.baseData.moduleIndex, scope.$index) &&
              !pbService.mapIsShow(scope.row.values[it.code]?.predictCostAfterTax)
            "
          >
            {{
              scope.row.rateFlag
                ? convertToPercentage(scope.row.values[it.code]?.predictCostAfterTax)
                : thousandSeparation(scope.row.values[it.code]?.predictCostAfterTax, 2)
            }}
          </span>
        </template>
      </te-table-column>

      <te-table-column label="操作" :width="PB_TABLE_COLUMN_MIN_WIDTH.PB_OPERATE_MIN_WIDTH" align="left" fixed="right">
        <!-- 2023-12-19把只有编辑功能才展示这一列的限制移除，所有表格都展示 -->
        <!-- v-if="pbService.dataSource?.baseData?.hasOperateBtn" -->
        <template #default="scope">
          <template
            v-if="
              scope.row.editableFlag &&
              pbService.mapIsEditing(scope.row, pbService.dataSource?.baseData.moduleIndex, scope.$index)
            "
          >
            <te-button type="primary" link @click="save(scope.row, pbService.dataSource?.baseData.type)"
              >保存</te-button
            >
            <te-button type="primary" link @click="pbService.cancelEdit(scope.row)">取消</te-button>
          </template>
          <template
            v-if="
              scope.row.editableFlag &&
              !pbService.mapIsEditing(scope.row, pbService.dataSource?.baseData.moduleIndex, scope.$index)
            "
          >
            <te-button
              type="primary"
              link
              @click="pbService.editTdData(scope.row, pbService.dataSource?.baseData.moduleIndex, scope.$index)"
              :disabled="pbService.mapEditDisabled(pbService.dataSource?.baseData.moduleIndex, scope.$index)"
              >编辑</te-button
            >
          </template>
          <span v-if="!scope.row.editableFlag">-</span>
        </template>
      </te-table-column>
    </te-table>
    <no-data v-else></no-data>
  </div>
</template>
<script lang="ts" setup>
import { TeTable, TeTableColumn, TeInput, TeButton, TeTooltip } from '@tiansu/element-plus';
import pbService from '../../project-budget.service';
import { PB_ITableDataItem, PB_TABLE_COLUMN_MIN_WIDTH } from '../../project-budget.api';
import { thousandSeparation, convertToPercentage } from '@/utils';

/**
 * 保存
 * @param type 数据类型
 * @param row 行数据
 */
const save = (row: PB_ITableDataItem, type: string) => {
  const element = document.getElementById('project-budget');
  const height = element?.scrollTop ?? 0;
  pbService.save(row, type);
  pbService.height = height;
};

/**
 * 特殊单元格样式
 */
const cellClassName = ({ row, column, rowIndex, columnIndex }: any) => {
  if (Number(row.values[column.property]?.predictCostAfterTax) < 0) {
    return 'pb-waring-cell';
  } else if (column.property === 'predictTotalCost' && row.predictTotalCost && Number(row.predictTotalCost) < 0) {
    return 'pb-waring-cell';
  } else {
    return '';
  }
};
</script>
<style lang="less" scoped>
.pb-project-basic-data {
  padding-top: 24px;
}
</style>
