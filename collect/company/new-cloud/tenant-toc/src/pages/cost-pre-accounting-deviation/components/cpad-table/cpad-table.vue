<template>
  <div id="cpad-table">
    <te-collapse v-model="activeCollapseNames">
      <te-collapse-item name="项目收入(不含税)">
        <template #title>
          <div class="cpad-table-item-title">
            <div>一、{{ props.cpadService?.dataSource.incomeCostInfo?.name ?? '项目收入(不含税)' }}</div>
            <div>
              <button
                v-if="!projectIncomeEditFlag && props.cpadService?.editAuthFlag && isShowRight"
                primary
                size="small"
                @click="
                  edit(CpAd_CollapseName['项目收入(不含税)'], $event),
                    props.cpadService?.setEditStore(CpAd_CollapseName['项目收入(不含税)'])
                "
              >
                编辑
              </button>
              <button
                v-if="projectIncomeEditFlag"
                primary
                size="small"
                @click.stop="
                  props.cpadService?.editSubmit(CPAD_EEditType.项目收入);
                  projectIncomeEditFlag = false;
                "
              >
                保存
              </button>
              <button
                v-if="projectIncomeEditFlag"
                size="small"
                @click.stop="
                  (projectIncomeEditFlag = false), props.cpadService?.editCancel(CpAd_CollapseName['项目收入(不含税)'])
                "
              >
                取消
              </button>
            </div>
          </div>
        </template>
        <div v-loading="props.cpadService?.loading">
          <te-table
            :data="props.cpadService?.dataSource.incomeCostTable?.lineVOList"
            v-if="!props.cpadService?.loading && props.cpadService?.dataSource.incomeCostTable?.lineVOList?.length > 0"
            ref="elTableRef"
            style="width: 100%"
            role="directCosts"
            :cell-style="cellStyle"
            :header-cell-style="headerCellStyle"
            :cell-class-name="tableTdClass"
            :span-method="objectSpanMethodForOperateCost"
            :key="props.cpadService?.elTableKey"
          >
            <te-table-column
              :width="item.name === '类目' ? '260' : 'auto'"
              v-for="(item, index) in props.cpadService?.dataSource.incomeCostTable?.titleList"
              :key="index"
              :prop="item.code"
              :label="item.name"
            >
              <template #default="{ row }">
                <te-input
                  v-inputFilter:search="{ allowSpace: true, regularStr: defaultStr }"
                  type="textarea"
                  v-if="mapProjectIncomeEditInput(row, item, index)"
                  v-model="row[item.code as string]"
                  :rows="1"
                  maxlength="1000"
                />
                <template v-else>
                  <div
                    :title="moneyCode.includes(item.code) ? row[item.code as string] !== '' && row[item.code as string] !== null
                        ? thousandSeparation(Number(row[item.code as string]))
                        : '-' : row[item.code as string] ?? '-'"
                    role="title"
                  >
                    {{
                      moneyCode.includes(item.code)
                        ? row[item.code as string] !== '' && row[item.code as string] !== null
                          ? thousandSeparation(Number(row[item.code as string]))
                          : '-'
                        : item.code === 'num' && row[item.code as string] !== null
                        ? row[item.code as string]
                        : item.code === 'num' && row[item.code as string] === null
                        ? ''
                        : row[item.code as string] ?? '-'
                    }}
                  </div>
                </template>
              </template>
            </te-table-column>
          </te-table>
          <no-data
            v-if="!props.cpadService?.loading && !props.cpadService?.dataSource.incomeCostTable?.lineVOList?.length"
          ></no-data>
        </div>
      </te-collapse-item>
      <te-collapse-item name="直接成本">
        <template #title>
          <div class="cpad-table-item-title">
            <div>二、{{ props.cpadService?.dataSource.directCostInfo?.name ?? '直接成本' }}</div>
            <div>
              预估金额：{{
                props.cpadService?.dataSource.directCostInfo?.predictCost !== '' &&
                props.cpadService?.dataSource.directCostInfo?.predictCost !== null
                  ? thousandSeparation(Number(props.cpadService?.dataSource.directCostInfo?.predictCost))
                  : '-'
              }}
            </div>
            <div>
              实际金额：
              {{
                props.cpadService?.dataSource.directCostInfo?.actualCost !== '' &&
                props.cpadService?.dataSource.directCostInfo?.actualCost !== null
                  ? thousandSeparation(Number(props.cpadService?.dataSource.directCostInfo?.actualCost))
                  : '-'
              }}
            </div>
            <div>
              <button
                v-if="!directCostEditFlag && props.cpadService?.editAuthFlag && isShowRight"
                primary
                size="small"
                @click="
                  edit(CpAd_CollapseName.直接成本, $event), props.cpadService?.setEditStore(CpAd_CollapseName.直接成本)
                "
              >
                编辑
              </button>
              <button
                v-if="directCostEditFlag"
                primary
                size="small"
                @click.stop="
                  props.cpadService?.editSubmit(CPAD_EEditType.直接成本);
                  directCostEditFlag = false;
                "
              >
                保存
              </button>
              <button
                v-if="directCostEditFlag"
                size="small"
                @click.stop="(directCostEditFlag = false), props.cpadService?.editCancel(CpAd_CollapseName.直接成本)"
              >
                取消
              </button>
            </div>
          </div>
        </template>
        <div v-loading="props.cpadService?.loading">
          <te-table
            :data="props.cpadService?.dataSource.directCostTable?.lineVOList"
            v-if="props.cpadService?.dataSource.directCostTable?.lineVOList.length > 0 && !props.cpadService?.loading"
            ref="elTableRef"
            role="directCosts"
            :cell-style="cellStyle"
            :cell-class-name="tableTdClass"
            :header-cell-style="headerCellStyle"
            :span-method="objectSpanMethodForDirectCost"
            :key="props.cpadService?.elTableKey"
          >
            <te-table-column
              :width="item.name === '序号' ? '60' : item.name === '成本类型' ? '200' : 'auto'"
              v-for="(item, index) in props.cpadService?.dataSource.directCostTable?.titleList"
              :key="index"
              :prop="item.code"
              :label="item.name"
            >
              <template #default="{ row }">
                <te-input
                  type="textarea"
                  v-if="mapDirectCostEditInput(row, item, index)"
                  v-inputFilter:search="{ allowSpace: true, regularStr: defaultStr }"
                  v-model="row[item.code as string]"
                  :rows="1"
                  maxlength="1000"
                  @blur="editBlur"
                />
                <template v-else>
                  <div
                    :title="moneyCode.includes(item.code) ? row[item.code as string] !== '' && row[item.code as string] !== null
                        ? thousandSeparation(Number(row[item.code as string]))
                        : '-' : row[item.code as string] ?? '-'"
                    role="title"
                  >
                    {{
                      moneyCode.includes(item.code)
                        ? row[item.code as string] !== '' && row[item.code as string] !== null
                          ? thousandSeparation(Number(row[item.code as string]))
                          : '-'
                        : item.code === 'num' && row[item.code as string] !== null
                        ? row[item.code as string]
                        : item.code === 'num' && row[item.code as string] === null
                        ? ''
                        : row[item.code as string] ?? '-'
                    }}
                  </div>
                </template>
              </template>
            </te-table-column>
          </te-table>
          <no-data
            v-if="!props.cpadService?.loading && !props.cpadService?.dataSource.directCostTable?.lineVOList.length"
          ></no-data>
        </div>
      </te-collapse-item>
      <te-collapse-item name="运营成本">
        <template #title>
          <div class="cpad-table-item-title">
            <div>三、{{ props.cpadService?.dataSource.operateCostInfo?.name ?? '运营成本' }}</div>
            <div>
              预估金额：{{
                props.cpadService?.dataSource.operateCostInfo?.predictCost !== '' &&
                props.cpadService?.dataSource.operateCostInfo?.predictCost !== null
                  ? thousandSeparation(Number(props.cpadService?.dataSource.operateCostInfo?.predictCost))
                  : '-'
              }}
            </div>
            <div>
              实际金额：
              {{
                props.cpadService?.dataSource.operateCostInfo?.actualCost !== '' &&
                props.cpadService?.dataSource.operateCostInfo?.actualCost !== null
                  ? thousandSeparation(Number(props.cpadService?.dataSource.operateCostInfo?.actualCost))
                  : '-'
              }}
            </div>
            <div>
              <button
                v-if="!operateCostEditFlag && props.cpadService?.editAuthFlag && isShowRight"
                primary
                size="small"
                @click="
                  edit(CpAd_CollapseName.运营成本, $event), props.cpadService?.setEditStore(CpAd_CollapseName.运营成本)
                "
              >
                编辑
              </button>
              <button
                v-if="operateCostEditFlag"
                primary
                size="small"
                @click.stop="props.cpadService?.editSubmit(CPAD_EEditType.运营成本), (operateCostEditFlag = false)"
              >
                保存
              </button>
              <button
                v-if="operateCostEditFlag"
                size="small"
                @click.stop="(operateCostEditFlag = false), props.cpadService?.editCancel(CpAd_CollapseName.运营成本)"
              >
                取消
              </button>
            </div>
          </div>
        </template>
        <div v-loading="props.cpadService?.loading">
          <te-table
            :data="props.cpadService?.dataSource.operateCostTable?.lineVOList"
            v-if="!props.cpadService?.loading && props.cpadService?.dataSource.operateCostTable?.lineVOList.length > 0"
            ref="elTableRef"
            style="width: 100%"
            role="directCosts"
            :cell-style="cellStyle"
            :header-cell-style="headerCellStyle"
            :cell-class-name="tableTdClass"
            :span-method="objectSpanMethodForOperateCost"
            :key="props.cpadService?.elTableKey"
          >
            <te-table-column
              :width="item.name === '序号' ? '60' : item.name === '成本类型' ? '200' : 'auto'"
              v-for="(item, index) in props.cpadService?.dataSource.operateCostTable?.titleList"
              :key="index"
              :prop="item.code"
              :label="item.name"
            >
              <template #default="{ row }">
                <te-input
                  v-inputFilter:search="{ allowSpace: true, regularStr: defaultStr }"
                  type="textarea"
                  v-if="mapOperateCostEditInput(row, item, index)"
                  v-model="row[item.code as string]"
                  :rows="1"
                  maxlength="1000"
                />
                <template v-else>
                  <div
                    :title="moneyCode.includes(item.code) ? row[item.code as string] !== '' && row[item.code as string] !== null
                        ? thousandSeparation(Number(row[item.code as string]))
                        : '-' : row[item.code as string] ?? '-'"
                    role="title"
                  >
                    {{
                      moneyCode.includes(item.code)
                        ? row[item.code as string] !== '' && row[item.code as string] !== null
                          ? thousandSeparation(Number(row[item.code as string]))
                          : '-'
                        : item.code === 'num' && row[item.code as string] !== null
                        ? row[item.code as string]
                        : item.code === 'num' && row[item.code as string] === null
                        ? ''
                        : row[item.code as string] ?? '-'
                    }}
                  </div>
                </template>
              </template>
            </te-table-column>
          </te-table>
          <no-data
            v-if="!props.cpadService?.loading && !props.cpadService?.dataSource.directCostTable?.lineVOList.length"
          ></no-data>
        </div>
      </te-collapse-item>
      <te-collapse-item name="项目成本合计">
        <template #title>
          <div class="cpad-table-item-title">
            <div>四、{{ props.cpadService?.dataSource.totalCostInfo?.name ?? '项目成本合计' }}</div>
            <div>
              预估金额：{{
                props.cpadService?.dataSource.totalCostInfo?.predictCost !== '' &&
                props.cpadService?.dataSource.totalCostInfo?.predictCost !== null
                  ? thousandSeparation(Number(props.cpadService?.dataSource.totalCostInfo?.predictCost))
                  : '-'
              }}
            </div>
            <div>
              实际金额：
              {{
                props.cpadService?.dataSource.totalCostInfo?.actualCost !== '' &&
                props.cpadService?.dataSource.totalCostInfo?.actualCost !== null
                  ? thousandSeparation(Number(props.cpadService?.dataSource.totalCostInfo?.actualCost))
                  : '-'
              }}
            </div>
            <div>
              偏差金额：{{
                props.cpadService?.dataSource.totalCostInfo?.deviation !== '' &&
                props.cpadService?.dataSource.totalCostInfo?.deviation !== null
                  ? thousandSeparation(Number(props.cpadService?.dataSource.totalCostInfo?.deviation))
                  : '-'
              }}
            </div>
            <span>偏差率：{{ props.cpadService?.dataSource.totalCostInfo?.deviationRate ?? '-' }}</span>
          </div>
        </template>
      </te-collapse-item>
    </te-collapse>
  </div>
</template>
<script lang="ts" setup>
import { thousandSeparation } from '@/utils';
import { ref } from 'vue';

import { CpAd_CollapseName, CPAD_EEditType } from '../../cost-pre-accounting-deviation.api';
import { EProperty } from './cpad-table.api';
import { CPAD_EDateType } from '../cpad-search/cpad-search.api';

const props = defineProps({
  cpadService: {
    type: Object,
  },
  isShowRight: {
    type: Boolean,
    default: false,
  },
});
//需要做千分位处理的字段名
const moneyCode = ['predictCost', 'actualCost', 'deviation'];

const defaultStr = String.raw`\`\\;\'\"<>`;
const activeCollapseNames = ref<string[]>([
  CpAd_CollapseName.直接成本,
  CpAd_CollapseName.运营成本,
  CpAd_CollapseName['项目收入(不含税)'],
]);

const projectIncomeEditFlag = ref<boolean>(false);
const directCostEditFlag = ref<boolean>(false);
const operateCostEditFlag = ref<boolean>(false);

const editClick = ref<boolean>(false);

/**
 * 单元格样式
 * @param param0
 */
const tableTdClass = ({
  row,
  column,
  rowIndex,
  columnIndex,
}: {
  row: any;
  column: any;
  rowIndex: number;
  columnIndex: number;
}) => {
  if (row.deviation && Number(row.deviation) < 0 && column.property === 'deviation') {
    return 'waring-cell';
  } else if (row.deviationRate && row.deviationRate.includes('-') && column.property === 'deviationRate') {
    return 'waring-cell';
  } else if (row.level === '3' && row.num === null) {
    return 'deep-color-cell';
  } else {
    return 'cell-chidren';
  }
};

// 编辑事件
const edit = (val: string, e: Event) => {
  //#region
  // 点击编辑打开抽屉，抽屉打开的情况下，点击编辑不会收起抽屉
  if (activeCollapseNames.value.includes(val)) {
    e.stopPropagation();
  }
  editClick.value === !editClick.value;
  if (editClick.value) {
    e.stopPropagation();
  }
  //#endregion
  if (val === CpAd_CollapseName['项目收入(不含税)']) {
    if (!props.cpadService?.dataSource?.incomeCostTable.lineVOList?.length) {
      return;
    }
    projectIncomeEditFlag.value = true;
  }
  if (val === CpAd_CollapseName.直接成本) {
    if (!props.cpadService?.dataSource.directCostTable?.lineVOList?.length) {
      return;
    }
    directCostEditFlag.value = true;
  }

  if (val === CpAd_CollapseName.运营成本) {
    if (!props.cpadService?.dataSource.operateCostTable?.lineVOList?.length) {
      return;
    }
    operateCostEditFlag.value = true;
  }
};

// 自定义表格cell style函数
const cellStyle = (obj: any) => {
  let style = {};
  switch (obj.column.property) {
    case EProperty.序号:
    case EProperty.成本类型:
    case EProperty.类目:
      style = {
        textAlign: 'left !important',
      };
      break;
    case EProperty.实际:
    case EProperty.预估:
    case EProperty.偏差金额:
      style = {
        textAlign: 'right !important',
      };
      break;
    case EProperty.偏差率:
      style = {
        textAlign: 'center !important',
      };
      break;
    case EProperty.偏差分析:
    case EProperty.运行策略:
      style = {
        textAlign: 'left !important',
      };
      break;
  }
  return style;
};
// 自定义表格cell style函数
const headerCellStyle = (obj: any) => {
  let style = {};
  switch (obj.column.property) {
    case EProperty.序号:
    case EProperty.成本类型:
    case EProperty.类目:
      style = {
        textAlign: 'left !important',
      };
      break;
    case EProperty.实际:
    case EProperty.预估:
    case EProperty.偏差金额:
    case EProperty.偏差率:
      style = {
        textAlign: 'center !important',
      };
      break;
    case EProperty.偏差分析:
    case EProperty.运行策略:
      style = {
        textAlign: 'left !important',
      };
      break;
  }
  return style;
};

const mapDirectCostEditInput = (row: any, item: any, index: any) => {
  return directCostEditFlag.value && (item.name === '偏差分析' || item.name === '运营策略');
};

const mapOperateCostEditInput = (row: any, item: any, index: any) => {
  return operateCostEditFlag.value && (item.name === '偏差分析' || item.name === '运营策略');
};

const mapProjectIncomeEditInput = (row: any, item: any, index: any) => {
  return projectIncomeEditFlag.value && (item.name === '偏差分析' || item.name === '运营策略');
};

const objectSpanMethodForDirectCost = ({ row, column, rowIndex, columnIndex }: any) => {
  const lineVOList = props.cpadService?.dataSource.directCostTable?.lineVOList;
  let rowspan = 1;
  let colspan = 1;

  if (columnIndex >= 4) {
    if (lineVOList?.length) {
      lineVOList.forEach((childItem: any) => {
        if (row.nodeId === childItem.parentId && childItem.mergeFlag) {
          rowspan++;
        }
      });
    }

    return {
      rowspan: rowspan,
      colspan: colspan,
    };
  }
};

const editBlur = (e: any) => {
  console.log(e.target.innerText);
  if (e.target.innerText == '') {
    e.target.innerText = null;
  }
};

const objectSpanMethodForOperateCost = ({ row, column, rowIndex, columnIndex }: any) => {
  const lineVOList = props.cpadService?.dataSource.operateCostTable?.lineVOList;
  let rowspan = 1;
  let colspan = 1;

  if (columnIndex >= 4) {
    if (lineVOList?.length) {
      lineVOList.forEach((childItem: any) => {
        if (row.nodeId === childItem.parentId && childItem.mergeFlag) {
          rowspan++;
        }
      });
    }
    return {
      rowspan: rowspan,
      colspan: colspan,
    };
  }
};
defineExpose({ directCostEditFlag, operateCostEditFlag, projectIncomeEditFlag });
</script>
<style lang="less" scoped>
#cpad-table {
  // overflow-y: auto;
  .cpad-table-item-title {
    width: 100%;
    padding-right: 20px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    > div {
      width: 20%;
      color: #303133;

      &:first-child {
        font-size: 14px;
        font-weight: 600;
      }
    }

    > div:last-child:not(span) {
      display: flex;
      justify-content: flex-end;
      margin-left: auto;
    }

    > span {
      color: #303133;
    }
  }

  :deep(.te-collapse-item__arrow) {
    color: #303133;
  }

  :deep(.te-collapse) {
    border-top: 1px solid rgba(0, 0, 0, 0.15);
  }

  :deep(.te-collapse-item__header) {
    font-weight: 700;
    font-size: 14px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  }
  :deep(.te-collapse-item__header.is-active) {
    border-bottom-color: transparent;
  }
  :deep(.te-collapse-item__wrap) {
    border-bottom: none;
  }

  :deep(.te-collapse-item__content) {
    padding-bottom: 0;
  }

  :deep(.te-collapse-item:last-child) > div {
    cursor: pointer;

    .te-collapse-item__header {
      pointer-events: none;
    }

    .te-collapse-item__arrow {
      visibility: hidden;
    }
  }
  :deep(.te-table th.te-table__cell) {
    padding: 0px !important;
    border-right: 1px solid var(--te-border-color-lighter) !important;
    // border-bottom: 1px solid var(--color-text-divider) !important;
    // &:last-child {
    //   border-right: none !important;
    // }
  }
  :deep(.te-table) tbody tr {
    td.te-table__cell {
      position: relative;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      // border-bottom: 1px solid var(--color-text-divider) !important;
      // border-right: 1px solid var(--color-text-divider) !important;
      // &:last-child {
      //   border-right: none !important;
      // }
    }
  }

  :deep(.te-table) tbody tr:nth-child(even) td {
    background-color: #fff;
  }

  // :deep(.te-table[role='directCosts']) tbody tr {
  //   td.te-table__cell:nth-child(n + 5) {
  //     // background-color: #fffbe6 !important;
  //     background-color: #fff;
  //   }
  // }

  :deep(.te-table::before) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
  }

  // :deep(.te-table) tbody tr:hover > td:not(.waring-cell) {
  //   background-color: transparent !important;
  // }
  // :deep(.te-table) tbody tr:hover > td:not(.deep-color-cell) {
  //   background-color: transparent !important;
  // }
  :deep(.waring-cell) {
    color: #f5222d !important;
    background-color: var(--te-color-danger-light-9) !important;
  }

  :deep(.te-table td.te-table__cell .cell, .te-table td .cell) {
    height: 100%;
    padding: 4px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    word-break: normal;
    text-align: inherit;
    > div[role='title'] {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  :deep(.te-textarea) {
    height: 100% !important;
    min-height: 0px !important;
  }

  :deep(.te-textarea__inner) {
    resize: none !important;
    width: 100%;
    height: 100% !important;
    line-height: normal !important;
    min-height: 0 !important;
  }

  button {
    width: 52px !important;
    height: 22px !important;
    line-height: 22px !important;
    padding: 0 5px;
  }
}
:deep(.is-horizontal) {
  display: none !important;
}
:deep(.deep-color-cell) {
  background-color: var(--te-fill-color-lighter) !important;
}
:deep(.te-table--enable-row-hover .te-table__body tr:hover > td.te-table__cell) {
  background-color: var(--te-table-row-hover-bg-color) !important;
}
</style>
