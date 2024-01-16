<template>
  <div id="ma-ad-table" v-loading="Service.loading" style="overflow-y: auto">
    <template v-if="Service.dataSource?.length">
      <template v-for="(item, index) in Service.dataSource" :key="'dataSource_' + index">
        <te-collapse v-model="Service.activeCollapse">
          <te-collapse-item :name="item.typeName">
            <template v-slot:title>
              <span>{{ `${convertToChinaNum(index + 1)}、${item.typeName}` }}</span>
            </template>
            <te-table
              :data="item.moduleVOList"
              :header-cell-style="mapHeaderStyle"
              :span-method="mapSpanMethod"
              :cell-class-name="mapCellClassName"
              :row-class-name="rowClassName"
            >
              <te-table-column align="left" fixed="left" label="能源类型" :min-width="widthOfEnergy">
                <template #default="scope">
                  <div
                    v-if="!scope.row.summaryFlag"
                    class="ma-category"
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
                    class="ma-category"
                    :title="scope.row.energyName + '-' + scope.row.itemName"
                  >
                    {{ scope.row.energyName + '-' + scope.row.itemName }}
                  </div>
                </template>
              </te-table-column>

              <te-table-column
                align="left"
                fixed="left"
                :min-width="widthofNode"
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
                show-overflow-tooltip
                align="right"
              >
                <template #default="scope">
                  {{
                    scope.row[childItem] !== '' && scope.row[childItem] !== null
                      ? thousandSeparation(Number(scope.row[childItem]), mapCellIsPrice(scope.row.itemCode) ? 0 : 2)
                      : '-'
                  }}
                </template>
              </te-table-column>

              <te-table-column label="合计" fixed="right" align="right" :width="widthOfTotal" show-overflow-tooltip>
                <template #default="scope">
                  {{
                    scope.row.lineTotal !== '' && scope.row.lineTotal !== null
                      ? thousandSeparation(Number(scope.row.lineTotal), mapCellIsPrice(scope.row.itemCode) ? 0 : 2)
                      : '-'
                  }}
                </template>
              </te-table-column>
            </te-table>
          </te-collapse-item>
        </te-collapse>
      </template>
    </template>
    <div v-if="Service.dataSource?.length === 0 && !Service.loading" class="ecb-home-empty">
      <img src="@/assets/images/common/common-data-none.svg" alt="nodata" />
      <p>暂无数据</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onUnmounted, computed } from 'vue';
import { Subject } from 'rxjs';
import { default as mitt } from '@/core/eventbus';

import { thousandSeparation, convertToChinaNum } from '@/utils/index';
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults';

import MaAdTableService from './ma-ad-table.service';

import {
  MaAd_IConvertRow,
  WIDTH_OF_ENERGY_CODE,
  WIDTH_OF_NODE_NAME,
  WIDTH_OF_AREA,
  WIDTH_OF_OPERATE,
  WIDTH_OF_TOTAL,
  MIN_WIDTH_OF_YEAR,
} from './ma-ad-table.api';

interface SpanMethodProps {
  row: MaAd_IConvertRow;
  column: TableColumnCtx<MaAd_IConvertRow>;
  rowIndex: number;
  columnIndex: number;
}

const Service = new MaAdTableService();
const destroy = new Subject<void>();

const widthOfFixedHead = (hasArea: boolean) => {
  return `${WIDTH_OF_ENERGY_CODE + WIDTH_OF_NODE_NAME + 20 + (hasArea ? WIDTH_OF_AREA : 0)}px`;
};
const widthOfEnergy = computed(() => {
  return `${WIDTH_OF_ENERGY_CODE}px`;
});
const widthofNode = computed(() => {
  return `${WIDTH_OF_NODE_NAME + 20}px`;
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
const widthOfYearCol = computed(() => {
  return `${100 / 12}%`;
});

function mapHeaderStyle({
  row,
  colunm,
  rowIndex,
  columnIndex,
}: {
  row: any;
  colunm: any;
  rowIndex: number;
  columnIndex: number;
}) {
  if (rowIndex === 1 && columnIndex === 0) {
    return { display: 'none' };
  }
  if (rowIndex === 1 && columnIndex === 1) {
    return { display: 'none' };
  }
  if (rowIndex === 1 && columnIndex === 2 && !row[2].label) {
    return { display: 'none' };
  }

  if (row[0].label === '能源类型') {
    row[0].rowSpan = '2';
  }
}
/**
 * 单元格合并
 * 1.同一能源类型（小结行除外）的进行合并
 * 2.如果有区域节点，对同一能源类型同一区域进行合并
 * 3.小结行和合计行站几列需要判断当前是否有区域节点
 */
function mapSpanMethod({ row, column, rowIndex, columnIndex }: SpanMethodProps) {
  let colspan = 1;
  let rowspan = 1;
  // 当前类型的数据列表
  const list = Service.dataSource.filter((item) => {
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
  // 第一列
  if (columnIndex === 1) {
    // 2023-11-18改 小计或者合计--需要隐藏
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
  return `${row.summaryFlag && columnIndex !== 0 ? 'summary' : ''}${row.totalFlag ? ' total' : ''}`;
}
/**
 * 根据itemCode判断行是否是单价
 * @param code
 */
const mapCellIsPrice = (code: string) => {
  return code === '2';
};
/**
 * 小计
 */
const rowClassName = ({ row, rowIndex }: any) => {
  if (row.summaryFlag) {
    return 'summary';
  } else if (row.totalFlag) {
    return 'total';
  }
};

/**
 * 触发查询
 */
const triggerSearch = () => {
  Service.query();
};

mitt.on('query', () => {
  Service.query();
});

onUnmounted(() => {
  destroy.next();
  destroy.complete();
  mitt.off('query');
});

// 对外暴露
defineExpose({
  triggerSearch,
});
</script>
<style lang="less" scoped>
#ma-ad-table {
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

          &.is-hidden div.cell {
            visibility: inherit !important;
          }

          input {
            max-width: 100%;
          }

          div.cell {
            padding-left: 10px;
            padding-right: 10px;
          }

          div.cell > div {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        td.te-table__cell.is-stripe {
          background-color: var(--color-table-body) !important;
        }

        td.te-table__cell.is-stripe:hover {
          background-color: var(--color-table-body) !important;
        }

        td.te-table__cell.total {
          background-color: var(--te-table-header-bg-color) !important;
        }
      }
    }
  }
  :deep(.summary > td) {
    background-color: var(--te-color-warning-light-9) !important;
  }
  :deep(.total > td) {
    background-color: var(--color-table-header) !important;
  }
  :deep(.is-left > .cell) {
    text-align: left !important;
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

  :deep(.is-right) {
    text-align: right !important;
  }
  :deep(.is-left) {
    text-align: left !important;
  }
  :deep(.te-table__header th) {
    border-bottom: 1px solid var(--te-border-color-lighter);
    border-right: 1px solid var(--te-border-color-lighter);
  }
  :deep(.ma-category > div) {
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
