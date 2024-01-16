<template>
  <div class="ecb-home" id="ecb-home" v-loading="ebtHome.loading">
    <template v-if="ebtHome.dataSource?.length && !ebtHome.loading">
      <te-collapse v-model="ebtHome.activeCollapse" @change="ebtHome.handleCollapseChange">
        <template v-for="(item, index) in ebtHome.dataSource" :key="'dataSource_' + index">
          <te-collapse-item :name="item.typeName">
            <template v-slot:title>
              <span>{{ `${convertToChinaNum(index + 1)}、${item.typeName}` }}</span>
            </template>
            <te-table
              v-if="ebtHome.renderMap.has(item.typeName)"
              :data="item.moduleVOList"
              style="width: 100%"
              :header-cell-style="mapHeaderStyle"
              :header-row-class-name="mapHeaderClassName"
              :span-method="mapSpanMethod"
              :cell-class-name="mapCellClassName"
              :row-class-name="rowClassName"
            >
              <!-- 第一列 -->
              <te-table-column fixed="left" align="left" label="能源类型" :min-width="widthOfEnergy">
                <template #default="scope">
                  <div
                    v-if="!scope.row.summaryFlag"
                    class="ecb-category"
                    :title="
                      scope.row.energyName +
                      (scope.row.areaName && !scope.row.summaryFlag ? `(${scope.row.areaName})` : '')
                    "
                  >
                    <div>
                      {{
                        scope.row.energyName +
                        (scope.row.areaName && !scope.row.summaryFlag ? `(${scope.row.areaName})` : '')
                      }}
                    </div>
                  </div>
                  <div
                    v-if="scope.row.summaryFlag"
                    class="ecb-category"
                    :title="scope.row.energyName + '-' + scope.row.itemName"
                  >
                    {{ scope.row.energyName + '-' + scope.row.itemName }}
                  </div>
                </template>
              </te-table-column>
              <!-- 第二列 -->
              <te-table-column
                align="left"
                fixed="left"
                :min-width="widthOfNode"
                class="itemName"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <div>{{ scope.row.itemName }}</div>
                </template>
              </te-table-column>
              <te-table-column
                v-for="(childItem, childIndex) in item.titleList"
                :prop="childItem"
                :label="childItem"
                :min-width="minWidthOfYear"
                class="data-value"
                show-overflow-tooltip
                align="right"
              >
                <template #default="scope">
                  <input
                    v-inputFilter:number="{ integral: 10, decimal: 2 }"
                    type="text"
                    v-model="scope.row[childItem]"
                    v-if="
                      mapIsEditing(
                        scope.row.energyCode,
                        scope.row.areaId,
                        scope.row.itemCode,
                        scope.row.editable,
                        index,
                      )
                    "
                  />
                  <span
                    v-if="
                      !mapIsEditing(
                        scope.row.energyCode,
                        scope.row.areaId,
                        scope.row.itemCode,
                        scope.row.editable,
                        index,
                      )
                    "
                  >
                    {{
                      scope.row[childItem] === '' || scope.row[childItem] === null
                        ? '-'
                        : thousandSeparation(scope.row[childItem], mapCellIsPrice(scope.row.itemCode) ? 0 : 2)
                    }}
                  </span>
                </template>
              </te-table-column>
              <te-table-column label="合计" align="right" fixed="right" :min-width="widthOfTotal">
                <template #default="scope">
                  <span>
                    {{
                      scope.row.lineTotal !== '' && scope.row.lineTotal !== null
                        ? thousandSeparation(Number(scope.row.lineTotal), mapCellIsPrice(scope.row.itemCode) ? 0 : 2)
                        : '-'
                    }}
                  </span>
                </template>
              </te-table-column>
              <!-- 2023-12-19把只有编辑功能才展示这一列的限制移除，所有表格都展示 -->
              <te-table-column fixed="right" label="操作" :width="widthOfOperate">
                <template #default="scope">
                  <template
                    v-if="
                      scope.row.editable &&
                      mapIsEditing(
                        scope.row.energyCode,
                        scope.row.areaId,
                        scope.row.itemCode,
                        scope.row.editable,
                        index,
                      )
                    "
                  >
                    <button text @click="ebtHome.handleEditSubmit">保存</button>
                    <button text @click="ebtHome.cancelEdit">取消</button>
                  </template>
                  <template
                    v-if="
                      scope.row.editable &&
                      !mapIsEditing(
                        scope.row.energyCode,
                        scope.row.areaId,
                        scope.row.itemCode,
                        scope.row.editable,
                        index,
                      )
                    "
                  >
                    <button
                      text
                      @click="ebtHome.setEditStore(scope.row, index, scope.$index, item.moduleIndex)"
                      :disabled="mapEditDisabled(index, scope.$index)"
                    >
                      编辑
                    </button>
                  </template>
                  <span v-if="!scope.row.editable" class="eh-no-btn">-</span>
                </template>
              </te-table-column>
            </te-table>
          </te-collapse-item>
        </template>
      </te-collapse>
    </template>
    <div v-if="ebtHome.dataSource?.length === 0 && !ebtHome.loading" class="ecb-home-empty">
      <img src="../../../assets/images/common/common-data-none.svg" alt="no-data" />
      <p>暂无数据</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

import { thousandSeparation, convertToChinaNum } from '../../../utils/index';
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults';

import EbtHomeService from './ecb-home.service';

import {
  Ebt_IConvertRow,
  WIDTH_OF_ENERGY_CODE,
  WIDTH_OF_NODE_NAME,
  WIDTH_OF_AREA,
  WIDTH_OF_OPERATE,
  WIDTH_OF_TOTAL,
  MIN_WIDTH_OF_YEAR,
  Ebt_ISearchVO,
} from './ecb-home.api';

interface SpanMethodProps {
  row: Ebt_IConvertRow;
  column: TableColumnCtx<Ebt_IConvertRow>;
  rowIndex: number;
  columnIndex: number;
}

const ebtHome = new EbtHomeService();

const widthOfFixedHead = (hasArea: boolean) => {
  return `${WIDTH_OF_ENERGY_CODE + WIDTH_OF_NODE_NAME + (hasArea ? WIDTH_OF_AREA : 0)}px`;
};
const widthOfEnergy = computed(() => {
  return `${WIDTH_OF_ENERGY_CODE}px`;
});
const widthOfNode = computed(() => {
  return `${WIDTH_OF_NODE_NAME}px`;
});
const widthOfArea = computed(() => {
  return `${WIDTH_OF_AREA}px`;
});
const minWidthOfYear = computed(() => {
  return `${MIN_WIDTH_OF_YEAR}px`;
});
const widthOfOperate = computed(() => {
  return `${WIDTH_OF_OPERATE}px`;
});
const widthOfTotal = computed(() => {
  return `${WIDTH_OF_TOTAL}px`;
});

function mapHeaderStyle({
  row,
  column,
  rowIndex,
  columnIndex,
}: {
  row: any;
  column: any;
  rowIndex: number;
  columnIndex: number;
}) {
  // 合并第一列，第二列（第一列的列宽是2，第二列的列宽是0）
  if (row[0].level === 1) {
    row[0].colSpan = 2;
    row[1].colSpan = 0;
    if (columnIndex === 1) {
      return { display: 'none' };
    }
  }
  console.log('%c🚀 ~ ecb-home.vue ~ 233行', 'font-size: 18px', row);
}
/**
 * 单元格合并
 * 1.同一能源类型(小结行除外)的进行合并
 * 2.如果有区域节点，对同一能源类型同一区域进行合并
 * 3.小结行和合计行站几列需要判断当前是否有区域节点
 */
function mapSpanMethod({ row, column, rowIndex, columnIndex }: SpanMethodProps) {
  let colspan = 1;
  let rowspan = 1;
  // 当前类型的数据列表
  const list = ebtHome.dataSource.filter((item) => {
    return item.type === row.type;
  })?.[0]?.moduleVOList;
  if (columnIndex === 0) {
    // 某个能源类型
    const arr =
      list?.filter((item) => {
        return item.energyCode === row.energyCode && item.areaId === row.areaId;
      }) ?? [];
    // 非第一个的都为0，如果最后一个是小计，则为1
    //除开第一行都为0
    rowspan =
      arr?.findIndex((item) => {
        return item.itemCode === row.itemCode;
      }) > 0
        ? 0
        : arr.length;
  }
  //合计
  if (columnIndex === 0) {
    if (row.totalFlag || row.summaryFlag) {
      rowspan = 1;
      colspan = 2;
    }
  }

  if (columnIndex === 1) {
    if (row.totalFlag || row.summaryFlag) {
      rowspan = 0;
      colspan = 0;
    }
  }

  return {
    rowspan,
    colspan,
  };
}

function mapCellClassName({ row, column, rowIndex, columnIndex }: SpanMethodProps) {
  return `${
    (row.summaryFlag && columnIndex !== 0) || (!row.summaryFlag && row.itemName === '总费用(元)') ? 'summary' : ''
  }${row.totalFlag ? ' total' : ''}`;
}
function mapHeaderClassName({ row, rowIndex }: SpanMethodProps) {
  return 'ecb-header';
}

/**
 * 小计/合计
 */
const rowClassName = ({ row, rowIndex }: any) => {
  if (row.summaryFlag) {
    return 'summary';
  } else if (row.totalFlag) {
    return 'total';
  }
};
/**
 * 根据itemCode判断行是否是单价
 * @param code
 */
const mapCellIsPrice = (code: string) => {
  return code === '2';
};

function mapIsEditing(energyCode: string, areaId: string, itemCode: string, editable: boolean, moduleIndex: number) {
  return !!areaId
    ? editable &&
        ebtHome.editParams.energyCode &&
        ebtHome.editParams.areaId &&
        ebtHome.editParams.itemCode &&
        ebtHome.editParams.areaId === areaId &&
        ebtHome.editParams.energyCode === energyCode &&
        ebtHome.editParams.itemCode === itemCode &&
        moduleIndex === ebtHome.editParams.typeIndex
    : editable &&
        ebtHome.editParams.energyCode &&
        ebtHome.editParams.itemCode &&
        ebtHome.editParams.energyCode === energyCode &&
        ebtHome.editParams.itemCode === itemCode &&
        moduleIndex === ebtHome.editParams.typeIndex;
}
function mapEditDisabled(typeIndex: number, dataIndex: number) {
  return (
    ebtHome.editParams.typeIndex !== -1 &&
    ebtHome.editParams.dataIndex !== -1 &&
    (typeIndex !== ebtHome.editParams.typeIndex || dataIndex !== ebtHome.editParams.dataIndex)
  );
}
/**
 * 查询
 * @param v
 */
const search = (v: Ebt_ISearchVO) => {
  ebtHome.query(v);
};

defineExpose({
  search,
});
</script>
<style lang="less" scoped>
#ecb-home {
  flex: auto;
  --summary-bg-color: rgba(255, 251, 230, 1);

  :deep(.te-collapse) {
    border-top: none;

    .te-collapse-item__header {
      > span {
        font-size: var(--te-font-size-b14);
        color: var(--te-text-color-primary);
        font-weight: 600;
        line-height: 22px;
      }
    }

    .te-collapse-item__content {
      .te-table::before,
      .te-table__fixed-right::before,
      .te-table__fixed::before {
        display: none;
      }

      padding-bottom: 0;

      .te-table .te-table__body {
        td.te-table__cell {
          border-bottom: 1px solid var(--color-text-divider) !important;
          padding: 0;

          &.is-hidden div.cell {
            visibility: inherit !important;
          }

          input {
            max-width: 100%;
          }

          div.cell {
            padding-left: 8px;
            padding-right: 8px;

            button[text] {
              line-height: 22px;
            }
          }

          div.cell > div {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          div.cell > div.itemName {
            width: 108px;
          }

          span.eh-no-btn {
            color: var(--color-primary);
          }
        }

        td.te-table__cell.is-stripe {
          background-color: var(--color-table-body) !important;
        }

        td.te-table__cell.is-stripe:hover {
          background-color: var(--color-table-body) !important;
        }

        // td.te-table__cell.summary {
        //   background-color: var(--summary-bg-color) !important;
        // }

        // td.te-table__cell.total {
        //   background-color: var(--color-table-header) !important;
        // }

        // tr.te-table__row:hover td:not(.is-stripe):not(.summary):not(.total),
        // tr.te-table__row.hover-row > td:not(.is-stripe):not(.summary):not(.total) {
        //   background-color: transparent !important;
        // }
      }
    }
  }
  :deep(.summary > td) {
    background-color: var(--te-color-warning-light-9) !important;
  }
  :deep(.total > td) {
    background-color: var(--te-table-header-bg-color) !important;
  }

  .ecb-home-empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
      width: 60px;
      height: 60px;
    }

    p {
      color: rgba(0, 0, 0, 0.25);
      display: inline-block;
      line-height: 22px;
      margin-top: 8px;
    }
  }
  :deep(.te-table thead th) {
    border-bottom: 1px solid var(--te-table-border-color) !important;
  }
  :deep(table > tbody > tr:nth-child(even)) > td {
    background-color: var(--te-fill-color-blank);
  }
  :deep(.te-table__body tr.hover-row > td.te-table__cell) {
    background-color: var(--te-table-row-hover-bg-color);
  }
  :deep(.ecb-header .is-right) {
    text-align: center !important;
  }
  :deep(.is-left) {
    text-align: left !important;
  }
  :deep(.te-table__header th) {
    border-bottom: 1px solid var(--te-border-color-lighter);
    border-right: 1px solid var(--te-border-color-lighter);
  }

  :deep(.ecb-category > div) {
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
