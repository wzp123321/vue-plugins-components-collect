<template>
  <div class="pa-table">
    <te-table
      :data="data.moduleVOList"
      :cell-class-name="cellClassName"
      default-expand-all
      :tree-props="{ children: 'sonVOList' }"
      row-key="nodeId"
      size="large"
    >
      <te-table-column
        align="center"
        :width="PA_TABLE_COLUMN_MIN_WIDTH.PA_INDEX_MIN_WIDTH"
        :label="paService.fixedTitleList[0]?.name"
        :prop="paService.fixedTitleList[0]?.code"
        fixed="left"
        type=""
      />
      <te-table-column
        align="left"
        :width="PA_TABLE_COLUMN_MIN_WIDTH.PA_CATEGORY_MIN_WIDTH"
        :label="paService.fixedTitleList[1]?.name"
        :prop="paService.fixedTitleList[1]?.code"
        fixed="left"
        show-overflow-tooltip
      />
      <te-table-column
        align="right"
        :width="PA_TABLE_COLUMN_MIN_WIDTH.PA_TOTAL_MIN_WIDTH"
        :label="
          data.type === EPAccountingTypeKey['项目合计收入(含能源费流水)'] ||
          data.type === EPAccountingTypeKey['项目合计收入(含能源费流水和建设期成本)']
            ? '项目合计'
            : paService.fixedTitleList[2]?.name
        "
        :prop="paService.fixedTitleList[2]?.code"
        fixed="left"
      >
        <template #default="scope">
          <te-tooltip
            placement="top-start"
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
        v-for="(it, index) in getTitleList(data.type)"
        :key="index"
        align="right"
        :min-width="PA_TABLE_COLUMN_MIN_WIDTH.PA_DATA_MIN_WIDTH"
        :label="it.name"
        :prop="it.code"
      >
        <template #default="scope">
          <te-input
            v-if="
              paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index) &&
              !scope.row.taxTypeShowFlag &&
              scope.row.values[it.code]
            "
            v-inputFilter:number="{ integral: 10, decimal: 2 }"
            v-model="scope.row.values[it.code].predictCostAfterTax"
          />
          <span v-if="paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index) && !scope.row.values[it.code]"
            >-</span
          >
          <te-tooltip
            placement="top"
            trigger="click"
            popper-class="pb-tooltip"
            :content="
              '请输入税前值，保存后系统将自动计算并展示税后值' + '（税率为 ' + scope.row?.taxRatePercentage ?? '' + '）'
            "
            v-if="paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index) && scope.row.taxTypeShowFlag"
          >
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
              !paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index) &&
              paService.mapIsShow(scope.row.values[it.code]?.predictCostAfterTax)
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
              !paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index) &&
              !paService.mapIsShow(scope.row.values[it.code]?.predictCostAfterTax)
            "
          >
            -
          </span>
        </template>
      </te-table-column>

      <te-table-column
        label="备注"
        :min-width="PA_TABLE_COLUMN_MIN_WIDTH.PA_REMARK_MIN_WIDTH"
        align="left"
        prop="remark"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="pa-remark" v-if="!scope.row.editableFlag">
            <te-input
              v-if="paService.mapRemarkIsEditing(scope.row, data.moduleIndex, scope.$index)"
              v-model="scope.row.remark"
              v-inputFilter:search="{ allowSpace: true, regularStr: defaultStr }"
              v-auto-focus
              v-auto-blur
              maxlength="200"
              @change="paService.changeRemark(scope.row)"
              @blur="paService.blurEvt"
            ></te-input>
            <span v-else>{{
              scope.row.remark && scope.row.remark !== '' && scope.row.remark !== null ? scope.row.remark : '-'
            }}</span>
            <span
              v-if="!paService.mapRemarkIsEditing(scope.row, data.moduleIndex, scope.$index)"
              class="pa-edit"
              @click="paService.editTdData(scope.row, data.moduleIndex, scope.$index)"
              ><IconEditPen
            /></span>
          </div>
          <div class="pa-remark" v-else>
            <te-input
              v-if="paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index)"
              v-model="scope.row.remark"
              v-inputFilter:search="{ allowSpace: true, regularStr: defaultStr }"
              maxlength="200"
            ></te-input>
            <span v-else>{{
              scope.row.remark && scope.row.remark !== '' && scope.row.remark !== null ? scope.row.remark : '-'
            }}</span>
          </div>
        </template>
      </te-table-column>

      <te-table-column
        label="操作"
        :width="PA_TABLE_COLUMN_MIN_WIDTH.PA_OPERATE_MIN_WIDTH"
        align="left"
        fixed="right"
        v-if="getTitleList(data.type).length"
      >
        <!-- 2023-12-19把只有编辑功能才展示这一列的限制移除，所有表格都展示 -->
        <template #default="scope">
          <template v-if="scope.row.editableFlag && paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index)">
            <te-button type="primary" link @click="save(scope.row, data.type)">保存</te-button>
            <te-button type="primary" link @click="paService.cancelEdit(scope.row)">取消</te-button>
          </template>
          <template v-if="scope.row.editableFlag && !paService.mapIsEditing(scope.row, data.moduleIndex, scope.$index)">
            <te-button
              type="primary"
              link
              @click="paService.editTdData(scope.row, data.moduleIndex, scope.$index, index)"
              :disabled="paService.mapEditDisabled(data.moduleIndex, scope.$index)"
              >编辑</te-button
            >
          </template>
          <span v-if="!scope.row.editableFlag">-</span>
        </template>
      </te-table-column>
    </te-table>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { TeTable, TeTableColumn, TeInput, TeButton, TeTooltip } from '@tiansu/element-plus';
import {
  PA_IBasicData,
  PA_TABLE_COLUMN_MIN_WIDTH,
  EPAccountingTypeKey,
  PA_ITableDataItem,
  EPALevel,
} from '../project-accounting.api';
import { thousandSeparation, convertToPercentage } from '@/utils';
import paService from '../project-accounting.service';
const defaultStr = String.raw`\`\\;\'\"<>`;
import { IconEditPen } from '@arco-iconbox/vue-te';

const props = defineProps<{
  data: PA_IBasicData;
  index?: number;
}>();

const getTitleList = (type: string) => {
  if (
    type === EPAccountingTypeKey['项目合计收入(含能源费流水)'] ||
    type === EPAccountingTypeKey['项目合计收入(含能源费流水和建设期成本)']
  ) {
    return [];
  } else {
    return paService.titleList;
  }
};

/**
 * 保存
 * @param type
 * @param row
 */
const save = (row: PA_ITableDataItem, type: string) => {
  const element = document.getElementById('project-accounting');
  const height = element?.scrollTop ?? 0;
  paService.save(row, type);
  paService.height = height;
};

/**
 * tooltip动态内容
 * @param row 行
 * @param after 税后
 * @param before 税前
 */
const tooltipContent = (row: PA_ITableDataItem, after: number | null, before: number | null) => {
  return !!row.taxTypeShowFlag
    ? `税后：${thousandSeparation(after, 2)} / 税前：${thousandSeparation(before, 2)} (税率为${
        row.taxRatePercentage ?? ''
      })`
    : row.rateFlag
    ? convertToPercentage(after)
    : thousandSeparation(after, 2);
};

const cellClassName = ({ row, column, rowIndex, columnIndex }: any) => {
  if (Number(row.values[column.property]?.predictCostAfterTax) < 0) {
    return 'pa-waring-cell';
  } else if (column.property === 'predictTotalCost' && row.predictTotalCost && Number(row.predictTotalCost) < 0) {
    return 'pa-waring-cell';
  } else if (row.level === EPALevel.三级节点) {
    return 'pa-deep-color';
  } else {
    return '';
  }
};
</script>
<style lang="less" scoped>
.pa-remark {
  display: flex;
  span:nth-child(1) {
    flex: auto;
    width: 0;
    // margin-right: var(--te-space-8);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  span:nth-child(2) {
    flex: none;
    width: 16px;
    height: 16px;
  }
}

//编辑
:deep(tr td > .cell .pa-edit) {
  display: none;
}
:deep(tr td > .cell) {
  position: relative;
  &:hover .pa-edit {
    cursor: pointer;
    display: inline-block;
    position: absolute;
    right: 0;
  }
}
</style>
