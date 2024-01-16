<!--
 * @Author: yut
 * @Date: 2023-09-01 09:52:07
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 16:50:26
 * @Descripttion: 
-->
<template>
  <div class="pb-energy-consumption-data">
    <te-collapse v-model="pbService.activeCollapse">
      <template v-for="(item, index) in pbService.dataSource.collapseTableData" :key="'dataSource_' + index">
        <te-collapse-item :title="item.typeName" :name="item.typeName" v-if="item.moduleVOList.length">
          <te-table
            :data="item.moduleVOList"
            :cell-class-name="cellClassName"
            :tree-props="{ children: 'sonVOList' }"
            default-expand-all
            row-key="nodeId"
            size="large"
          >
            <te-table-column
              align="center"
              :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_INDEX_MIN_WIDTH"
              :label="pbService.fixedTitleList[0]?.name"
              :prop="pbService.fixedTitleList[0]?.code"
              fixed="left"
              type=""
            />
            <te-table-column
              align="left"
              :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_CATEGORY_MIN_WIDTH"
              :label="pbService.fixedTitleList[1]?.name"
              :prop="pbService.fixedTitleList[1]?.code"
              fixed="left"
              show-overflow-tooltip
            />

            <te-table-column
              align="right"
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
              :label="it.name"
              :prop="it.code"
              :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_DATA_MIN_WIDTH"
            >
              <template #default="scope">
                <te-input
                  v-if="pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index) && !scope.row.taxTypeShowFlag"
                  v-inputFilter:number="{ integral: 10, decimal: 2 }"
                  v-model="scope.row.values[it.code].predictCostAfterTax"
                />
                <te-tooltip
                  placement="top"
                  trigger="click"
                  v-if="pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index) && scope.row.taxTypeShowFlag"
                >
                  <template v-slot:content>
                    <div style="word-break: break-all; white-space: normal">
                      {{
                        '请输入税前值，保存后系统将自动计算并展示税后值' +
                        '（税率为 ' +
                        (scope.row.taxRatePercentage ?? '') +
                        '）'
                      }}
                    </div>
                  </template>
                  <te-input
                    v-inputFilter:number="{ integral: 10, decimal: 2 }"
                    v-model="scope.row.values[it.code].predictCost"
                  />
                </te-tooltip>

                <te-tooltip
                  placement="top"
                  popper-class="pb-tooltip"
                  trigger="hover"
                  v-if="
                    !pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index) &&
                    pbService.mapIsShow(scope.row.values[it.code]?.predictCostAfterTax)
                  "
                  :content="
                    tooltipContent(
                      scope.row,
                      scope.row.values[it.code]?.predictCostAfterTax,
                      scope.row.values[it.code]?.predictCost,
                    )
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
                    !pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index) &&
                    !pbService.mapIsShow(scope.row.values[it.code]?.predictCostAfterTax)
                  "
                >
                  -
                </span>
              </template>
            </te-table-column>

            <te-table-column
              label="操作"
              :width="PB_TABLE_COLUMN_MIN_WIDTH.PB_OPERATE_MIN_WIDTH"
              align="left"
              fixed="right"
            >
              <!-- 2023-12-19把只有编辑功能才展示这一列的限制移除，所有表格都展示 -->
              <!-- v-if="data.hasOperateBtn" -->
              <template #default="scope">
                <div style="white-space: nowrap; display: inline-block">
                  <template
                    v-if="scope.row.editableFlag && pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index)"
                  >
                    <te-button type="primary" link @click="save(scope.row, item.type)">保存</te-button>
                    <te-button type="primary" link @click="pbService.cancelEdit(scope.row)">取消</te-button>
                  </template>
                  <template
                    v-if="scope.row.editableFlag && !pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index)"
                  >
                    <te-button
                      type="primary"
                      link
                      @click="pbService.editTdData(scope.row, item.moduleIndex, scope.$index, index)"
                      :disabled="pbService.mapEditDisabled(item.moduleIndex, scope.$index)"
                      >编辑</te-button
                    >
                  </template>
                  <span v-if="!scope.row.editableFlag">-</span>
                </div>
              </template>
            </te-table-column>
          </te-table>
        </te-collapse-item>
      </template>
    </te-collapse>
  </div>
</template>
<script lang="ts" setup>
import { TeTable, TeTableColumn, TeInput, TeButton, TeCollapse, TeCollapseItem, TeTooltip } from '@tiansu/element-plus';
import { thousandSeparation, convertToPercentage } from '@/utils';
import pbService from '../../project-budget.service';
import { EPBLevel, PB_TABLE_COLUMN_MIN_WIDTH, PBudgetType } from '../../project-budget.api';
import { PB_ITableDataItem } from '../../project-budget.api';

/**
 * 保存
 * @param type
 * @param row
 */
const save = (row: PB_ITableDataItem, type: string) => {
  const element = document.getElementById('project-budget');
  const height = element?.scrollTop ?? 0;
  pbService.save(row, type);
  pbService.height = height;
};

/**
 * tooltip动态内容
 * @param row 行
 * @param after 税后
 * @param before 税前
 */
const tooltipContent = (row: PB_ITableDataItem, after: number | null, before: number | null) => {
  return !!row.taxTypeShowFlag
    ? `税后：${thousandSeparation(after, 2)} / 税前：${thousandSeparation(before, 2)} (税率为${
        row.taxRatePercentage ?? ''
      })`
    : row.rateFlag
    ? convertToPercentage(after)
    : thousandSeparation(after, 2);
};

/**
 * 单元格类名
 * @param param0
 */
const cellClassName = ({ row, column, rowIndex, columnIndex }: any) => {
  if (Number(row.values[column.property]?.predictCostAfterTax) < 0) {
    return 'pb-waring-cell';
  } else if (column.property === 'predictTotalCost' && row.predictTotalCost && Number(row.predictTotalCost) < 0) {
    return 'pb-waring-cell';
  } else if (row.level === EPBLevel.三级节点) {
    return 'pb-deep-color';
  } else {
    return '';
  }
};
</script>
<style lang="less"></style>
