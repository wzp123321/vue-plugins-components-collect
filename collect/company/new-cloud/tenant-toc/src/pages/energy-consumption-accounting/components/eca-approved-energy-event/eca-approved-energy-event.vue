<!--
 * @Author: yut
 * @Date: 2023-08-28 16:58:10
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 17:14:09
 * @Descripttion: 
-->
<template>
  <div class="eca-approved-energy-event">
    <te-table
      :data="tableData"
      row-key="id"
      :cell-style="cellStyle"
      :cell-class-name="cellClassName"
      :header-row-class-name="mapHeaderClassName"
      default-expand-all
    >
      <te-table-column
        prop="itemName"
        label="类目"
        :min-width="ECA_TABLE_COLUMN_MIN_WIDTH.ECA_CATEGORY_MIN_WIDTH"
        fixed="left"
        align="left"
        show-overflow-tooltip
      >
      </te-table-column>
      <te-table-column
        v-for="(item, index) in columunHeader"
        :key="index"
        align="right"
        show-overflow-tooltip
        :min-width="ECA_TABLE_COLUMN_MIN_WIDTH.ECA_DATA_MIN_WIDTH"
        :label="item"
      >
        <template #default="scope">
          {{ thousandSeparation(scope.row.dataList[index], mapCellIsPrice(scope.row.itemCode) ? 0 : 2) }}
        </template>
      </te-table-column>
      <te-table-column
        prop="lineTotal"
        label="合计"
        :min-width="ECA_TABLE_COLUMN_MIN_WIDTH.ECA_TOTAL_MIN_WIDTH"
        fixed="right"
        align="right"
        show-overflow-tooltip
      >
        <template #default="scope">
          {{ thousandSeparation(scope.row.lineTotal, mapCellIsPrice(scope.row.itemCode) ? 0 : 2) }}
        </template>
      </te-table-column>
      <te-table-column
        prop="remark"
        label="备注"
        :min-width="ECA_TABLE_COLUMN_MIN_WIDTH.ECA_REMARK_MIN_WIDTH"
        fixed="right"
        align="left"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div class="eca-remark">
            <te-input
              v-if="ecaService.mapIsEditing(scope.row, componentData.moduleIndex)"
              v-model="scope.row.remark"
              v-inputFilter:search="{ allowSpace: true, regularStr: defaultStr }"
              v-auto-focus
              v-auto-blur
              maxlength="200"
              @change="ecaService.changeRemark(scope.row, componentData.moduleIndex)"
              @blur="ecaService.blurEvt"
            ></te-input>
            <span v-else>{{ scope.row.remark !== '' && scope.row.remark !== null ? scope.row.remark : '-' }}</span>
            <span
              v-if="!ecaService.mapIsEditing(scope.row, componentData.moduleIndex)"
              class="eca-edit"
              @click="ecaService.ecaEdit(scope.row, componentData.moduleIndex)"
              ><IconEditPen
            /></span>
          </div>
        </template>
      </te-table-column>
    </te-table>
  </div>
</template>
<script lang="ts" setup>
import { thousandSeparation } from '@/utils';
import { computed, ref } from 'vue';
import {
  ECA_IAccountingRow,
  ECA_IConvertAccountingTypeVO,
  ECA_TABLE_COLUMN_MIN_WIDTH,
} from '../../energy-consumption-accounting.api';
import ecaService from '../../energy-consumption-accounting.service';
import { IconEditPen } from '@arco-iconbox/vue-te';

const defaultStr = String.raw`\`\\;\'\"<>`;

const props = defineProps<{
  componentData: ECA_IConvertAccountingTypeVO<ECA_IAccountingRow[]>;
}>();

//表头
const columunHeader = computed(() => props.componentData.titleList);
// 表格数据
const tableData = computed(() => props.componentData.moduleVOList);

//单元格类名
const cellClassName = ({ row, column, rowIndex, columnIndex }: any) => {
  if (columnIndex === 0) {
    return 'eca-cell-border';
  }
  if (
    Object.prototype.toString.call(column.property) === '[object Undefined]' &&
    row.dataList[columnIndex - 1] &&
    Number(row.dataList[columnIndex - 1]) < 0
  ) {
    return 'eca-waring-cell';
  }
  if (column.property === 'lineTotal' && row.lineTotal && Number(row.lineTotal) < 0) {
    return 'eca-waring-cell';
  }
  if (row.itemName === '技改节能量' || row.itemName === '管理节能量') {
    return 'eca-deep-color';
  }
};

/**
 * 特殊单元格样式
 * @param param0
 */
const cellStyle = ({ row, column, rowIndex, columnIndex }: any) => {
  let style = {};
  if ((row.itemName === '技改节能量' || row.itemName === '管理节能量') && columnIndex === 0) {
    style = {
      backgroundColor: 'var(--te-fill-color-lighter) !important',
      paddingLeft: '12px',
    };
  }
  return style;
};

function mapHeaderClassName({ row, rowIndex }: any) {
  return 'eca-header';
}

/**
 * 根据itemCode判断行是否是单价
 * @param code
 */
const mapCellIsPrice = (code: string) => {
  return code === '2';
};
</script>
<style lang="less" scoped>
.eca-approved-energy-event {
  width: 100%;
  height: 100%;
  :deep(.te-table__placeholder) {
    display: none !important;
  }
  // :deep(.te-table__indent) {
  //   display: none !important;
  // }
}
</style>
