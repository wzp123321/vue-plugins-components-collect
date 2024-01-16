<template>
  <div class="car-table" id="car-table" v-loading="carTable.loading">
    <div style="height: 100%" v-if="!carTable.loading">
      <el-table
        :data="carTable.dataSource"
        :header-cell-style="mapHeaderStyle"
        :cell-class-name="mapCellClassName"
        :row-class-name="mapRowClassName"
        :height="carTable.height"
        :border="false"
        style="width: 100%"
      >
        <el-table-column label="" :width="carTable.dataSource?.length > 0 ? 260 : '100%'" fixed="left">
          <el-table-column :width="carTable.dataSource?.length > 0 ? 80 : 'auto'">
            <template #default="scope">{{ scope.row[carTable?.columns?.[0]?.key] }}</template>
          </el-table-column>
          <el-table-column :width="carTable.dataSource?.length > 0 ? 180 : 'auto'">
            <template #default="scope">
              <span :title="scope.row[carTable?.columns?.[1]?.key]">{{ scope.row[carTable?.columns?.[1]?.key] }}</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column v-for="(item, index) in mapDateDataList()" :label="item.title" min-width="120">
          <template #default="scope">
            <input
              autofocus
              v-show="scope.$index === carTable.editStore.rowIndex && carTable.editStore.columnKey === item.key"
              type="text"
              v-model="scope.row[item.key]"
              v-inputFilter:number="{ integral: 10, decimal: 2, negative: true }"
              @blur="carTable.handleEdit(scope.row?.[item.key])"
              @keydown.enter="carTable.handleEdit(scope.row?.[item.key])"
            />
            <span class="car-table-label">
              <span
                v-show="!(scope.$index === carTable.editStore.rowIndex && carTable.editStore.columnKey === item.key)"
                :title="scope.row[item.key] + ''"
              >
                {{ scope.row[item.key] === '' || scope.row[item.key] === null ? '--' : scope.row[item.key] }}
              </span>
              <!-- 非锁定行且非编辑状态下展示按钮 -->
              <img
                src="../../../assets/images/management-analysis/ma-monthly/ma-monthly-edit-icon.svg"
                title="编辑"
                @click="carTable.setEditState($event, scope.$index, item.key, scope.row?.[item.key])"
                alt="编辑"
            /></span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElTable, ElTableColumn } from 'element-plus';

import CarTableService from './car-table.service';
import { CAR_ERowLevel } from './car-table.api';
import searchBar from '../car-searchbar/car-searchbar.service';

const carTable = new CarTableService();
const destroy$ = new Subject<void>();

function mapHeaderStyle({
  row,
  colunm,
  rowIndex,
  columnIndex,
}: {
  row: string[][];
  colunm: any;
  rowIndex: number;
  columnIndex: number;
}) {
  if (rowIndex === 1) {
    return { display: 'none' };
  }
}
function mapCellClassName({
  row,
  column,
  rowIndex,
  columnIndex,
}: {
  row: { [key: string]: string | number };
  column: any;
  rowIndex: number;
  columnIndex: number;
}) {
  const key = carTable.columns[columnIndex]?.key ?? '';
  return !row?.isLeaf
    ? 'not-leaf column-cost'
    : rowIndex === carTable.editStore.rowIndex && carTable.editStore.columnKey === key
    ? 'editing column-cost'
    : 'column-cost';
}

function mapRowClassName({ row, rowIndex }: { row: { [key: string]: string | number }; rowIndex: number }) {
  const colors = [
    'first-level',
    'second-level',
    'third-level',
    'fourth-level',
    'fifth-level',
    'sixth-level',
    'seventh-level',
  ];
  const level = Number(row?.level) - 1 ?? 1;
  return !row?.isLeaf ? colors[level] : '';
}

function mapDateDataList() {
  return carTable.columns?.slice(2, carTable.columns.length);
}

watch(
  () => carTable.loading,
  (newVal, oldVal) => {
    console.log('newVal', newVal, oldVal);
  },
);

onMounted(() => {
  searchBar.searchParamsResult$.pipe(takeUntil(destroy$)).subscribe((v) => {
    carTable.query(v);
  });

  fromEvent(window, 'resize')
    .pipe(takeUntil(destroy$))
    .subscribe(() => {
      carTable.mapTableHeight();
    });
});

onUnmounted(() => {
  destroy$.complete();
  destroy$.next();
});
</script>
<style lang="less" scoped>
#car-table {
  :deep(.el-table) tbody tr {
    &:nth-child(even) td {
      background-color: transparent;
    }

    &.first-level {
      &:hover,
      td.el-table__cell {
        background-color: #a8abb2 !important;
      }
    }

    &.second-level {
      &:hover,
      td.el-table__cell {
        background-color: #c0c4cc !important;
      }
    }

    &.third-level {
      &:hover,
      td.el-table__cell {
        background-color: #d5d8de !important;
      }
    }

    &.fourth-level {
      &:hover,
      td.el-table__cell {
        background-color: #dcdfe6 !important;
      }
    }

    &.fifth-level {
      &:hover,
      td.el-table__cell {
        background-color: #e4e7ed !important;
      }
    }

    &.sixth-level {
      &:hover,
      td.el-table__cell {
        background-color: #eceff5 !important;
      }
    }

    &.seventh-level {
      &:hover,
      td.el-table__cell {
        background-color: #f2f6fc !important;
      }
    }

    &:not(.first-level):not(.second-level):not(.third-level):not(.fourth-level):not(.fifth-level):not(.sixth-level):not(
        .seventh-level
      ):hover
      td.el-table__cell {
      background-color: var(--color-hover) !important;
    }

    td.el-table__cell.column-cost {
      .cell {
        visibility: inherit;
      }
    }

    td.el-table__cell {
      position: relative;
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      border-bottom: 1px solid var(--color-text-divider) !important;
      border-right: 1px solid var(--color-text-divider) !important;
      height: 48px;
      line-height: 48px;

      input {
        width: 100%;

        max-width: 240px;
      }

      > div.cell {
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;

        > span.car-table-label {
          display: inline-block;
          width: 100%;
          position: relative;

          img {
            cursor: pointer;
            width: 14px;
            height: 14px;

            position: absolute;
            top: 50%;
            right: -8px;
            transform: translateY(-50%);

            display: none;
          }
        }
      }

      &:not(.editing):not(.not-leaf):hover {
        img {
          display: inline-block;
          transition: all 233ms;
        }
      }
    }
  }
}
</style>
