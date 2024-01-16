<!--
 * @Author: yut
 * @Date: 2023-09-13 15:25:01
 * @LastEditors: yut
 * @LastEditTime: 2023-12-15 09:15:19
 * @Descripttion: 
-->

<template>
  <div class="eca-energy-consumption-table">
    <te-table
      v-if="columunHeader.length"
      :data="tableData"
      :header-cell-style="handerMethod"
      :span-method="arraySpanMethod"
      :row-class-name="rowClassName"
      :cell-class-name="cellClassName"
      row-key="id"
      :header-row-class-name="mapHeaderClassName"
      default-expand-all
    >
      <te-table-column
        prop="name"
        label="能源类型及类目"
        :min-width="widthOfEnergy(componentData.type)"
        fixed="left"
        align="left"
        show-overflow-tooltip
      >
        <template #default="scope">
          <div
            v-if="!scope.row.summaryFlag"
            class="eca-category"
            :title="
              scope.row.name +
              (scope.row.areaName && !scope.row.summaryFlag && !scope.row.children ? `(${scope.row.areaName})` : '')
            "
          >
            <div>
              {{
                scope.row.name +
                (scope.row.areaName && !scope.row.summaryFlag && !scope.row.children ? `(${scope.row.areaName})` : '')
              }}
            </div>
          </div>
          <div v-if="scope.row.summaryFlag" class="eca-category" :title="scope.row.name">
            {{ scope.row.name }}
          </div>
        </template>
      </te-table-column>
      <te-table-column :min-width="widthOfItemName(componentData.type)" align="left" fixed="left" show-overflow-tooltip>
        <template #default="scope">
          {{ scope.row.itemName }}
        </template>
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
    <no-data v-if="!columunHeader.length"></no-data>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { thousandSeparation } from '@/utils';
import { IconEditPen } from '@arco-iconbox/vue-te';
import {
  EAccountingType,
  ECA_IAccountingRow,
  ECA_IConvertAccountingTypeVO,
  ECA_TABLE_COLUMN_MIN_WIDTH,
} from '../../energy-consumption-accounting.api';
import ecaService from '../../energy-consumption-accounting.service';

const props = defineProps<{
  componentData: ECA_IConvertAccountingTypeVO<ECA_IAccountingRow[]>;
}>();

const defaultStr = String.raw`\`\\;\'\"<>`;

// 表头
const columunHeader = computed(() => props.componentData.titleList);
//表格数据
const tableData = computed(() => props.componentData.moduleVOList);

const widthOfEnergy = (type: string) => {
  return type === EAccountingType.单价调差
    ? ECA_TABLE_COLUMN_MIN_WIDTH.ECA_ENERGY_PRICE_MIN_WIDTH
    : ECA_TABLE_COLUMN_MIN_WIDTH.ECA_ENERGY_MIN_WIDTH;
};
const widthOfItemName = (type: string) => {
  return type === EAccountingType.单价调差
    ? ECA_TABLE_COLUMN_MIN_WIDTH.ECA_ITEM_PRICE_MIN_WIDTH
    : ECA_TABLE_COLUMN_MIN_WIDTH.ECA_ITEM_MIN_WIDTH;
};

/**
 * 单元格合并
 * @param param0
 */
const arraySpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  let rowspan = 1;
  let colspan = 1;
  const list = props.componentData.moduleVOList;
  if (columnIndex === 0) {
    // 某个能源类型
    let arr: any[] = [];
    list.forEach((ite) => {
      if (ite.children?.length) {
        arr =
          ite.children?.filter((item) => {
            return item.energyCode === row.energyCode && item.areaId === row.areaId;
          }) ?? [];
      }
    });
    //除开第一行都为0
    rowspan =
      arr?.findIndex((item) => {
        return item.itemCode === row.itemCode;
      }) > 0
        ? 0
        : arr.length;
    //若是父节点
    if (row.children?.length) {
      rowspan = 1;
      colspan = 2;
    }

    if (row.summaryFlag) {
      rowspan = 1;
      colspan = 2;
    }

    return {
      rowspan,
      colspan,
    };
  }
  //合计
  if (columnIndex === 1) {
    if (row.children?.length) {
      rowspan = 0;
      colspan = 0;
    }
    if (row.summaryFlag) {
      rowspan = 0;
      colspan = 0;
    }
  }
  return {
    rowspan: rowspan,
    colspan: colspan,
  };
};

/**
 * 单元格类名
 * @param param0
 */
const cellClassName = ({ row, column, rowIndex, columnIndex }: any) => {
  if (columnIndex === 0 && row.children?.length) {
    return 'eca-expand-head';
  }

  if (
    Object.prototype.toString.call(column.property) === '[object Undefined]' &&
    row.dataList[columnIndex - 2] &&
    Number(row.dataList[columnIndex - 2]) < 0
  ) {
    return 'eca-waring-cell';
  }
  if (column.property === 'lineTotal' && row.lineTotal && Number(row.lineTotal) < 0) {
    return 'eca-waring-cell';
  }
};

function mapHeaderClassName({ row, rowIndex }: any) {
  return 'eca-header';
}

/**
 * 合并表头
 * @param row
 */
const handerMethod = (row: any) => {
  // 第一级表头
  if (row.row[0].level == 1) {
    // 合并第一列，第二列（第一列的列宽是2，第二列的列宽是0）
    row.row[0].colSpan = 2;
    row.row[1].colSpan = 0;
    // 隐藏第二列的表头
    if (row.columnIndex === 1) {
      return { display: 'none' };
    }
  }
};

/**
 * 小计
 */
const rowClassName = ({ row, rowIndex }: any) => {
  if (row.summaryFlag) {
    return 'eca-summary';
  }
};

/**
 * 根据itemCode判断行是否是单价
 * @param code
 */
const mapCellIsPrice = (code: string) => {
  return code === '2';
};
</script>
<style lang="less" scoped>
.eca-energy-consumption-table {
  width: 100%;
  height: 100%;
  :deep(.te-table__placeholder) {
    display: none !important;
  }
  :deep(.te-table__indent) {
    display: none !important;
  }

  :deep(.eca-summary > td) {
    background-color: var(--te-color-warning-light-9) !important;
  }
  :deep(.eca-category > div) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 5;
    text-overflow: ellipsis;
    white-space: pre-line;
    word-wrap: break-word;
    word-break: break-all;
    word-spacing: normal;
  }
}
</style>
