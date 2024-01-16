<!--
 * @Author: yut
 * @Date: 2023-09-01 14:53:13
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 17:01:06
 * @Descripttion: 
-->
<template>
  <div class="pb-project-income">
    <te-collapse v-model="pbService.activeCollapse">
      <template v-for="(item, index) in pbService.dataSource.taxDifferencesData" :key="'dataSource_' + index">
        <te-collapse-item :title="item.typeName" :name="item.typeName" v-if="item.moduleVOList.length">
          <te-table :data="item.moduleVOList" :cell-class-name="cellClassName">
            <te-table-column
              align="center"
              show-overflow-tooltip
              :min-width="PB_TABLE_COLUMN_MIN_WIDTH.PB_INDEX_MIN_WIDTH"
              :label="pbService.fixedTitleList[0]?.name"
              :prop="pbService.fixedTitleList[0]?.code"
              fixed="left"
              size="large"
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
                  v-if="pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index)"
                  v-inputFilter:number="{ integral: 10, decimal: 2 }"
                  v-model="scope.row.values[it.code].predictCostAfterTax"
                />

                <te-tooltip
                  placement="top"
                  trigger="hover"
                  width="auto"
                  v-if="
                    !pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index) &&
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
                    !pbService.mapIsEditing(scope.row, item.moduleIndex, scope.$index) &&
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

            <te-table-column
              label="操作"
              :width="PB_TABLE_COLUMN_MIN_WIDTH.PB_OPERATE_MIN_WIDTH"
              align="left"
              fixed="right"
            >
              <!-- 2023-12-19把只有编辑功能才展示这一列的限制移除，所有表格都展示 -->
              <!-- v-if="data.hasOperateBtn" -->
              <template #default="scope">
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
              </template>
            </te-table-column>
          </te-table>
        </te-collapse-item>
      </template>
    </te-collapse>
  </div>
</template>
<script lang="ts" setup>
import { thousandSeparation, convertToPercentage } from '@/utils';
import { TeTable, TeTableColumn, TeInput, TeButton, TeCollapse, TeCollapseItem, TeTooltip } from '@tiansu/element-plus';
import { PB_ITableDataItem, PB_TABLE_COLUMN_MIN_WIDTH } from '../../project-budget.api';
import pbService from '../../project-budget.service';

/**
 * 保存
 * @param type 数据源
 * @param row 行
 */
const save = (row: PB_ITableDataItem, type: string) => {
  const element = document.getElementById('project-budget');
  const height = element?.scrollTop ?? 0;
  pbService.save(row, type);
  pbService.height = height;
};

/**
 * 单元格样式
 * @param param0
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
<style lang="less" scoped></style>
