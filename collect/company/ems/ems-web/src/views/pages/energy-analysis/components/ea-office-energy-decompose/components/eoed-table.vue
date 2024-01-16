<template>
  <div class="eoed-table">
    <el-table :data="props.tableData" style="width: 100%" stripe :height="348">
      <el-table-column :fixed="index === 0" v-for="(item, index) in props.tableHead" :width="mapColumnWidth(index)">
        <template #header>
          <el-tooltip
            v-if="mapHeaderTooltipFlag(index)"
            effect="dark"
            :content="mapHeaderTooltipLabel(index)"
            :show-after="500"
            placement="bottom"
          >
            <div class="et-header" :title="item">
              {{ item }}
            </div>
          </el-tooltip>
          <div v-else :title="item" class="et-header">
            {{ item }}
          </div>
        </template>
        <template #default="scope">
          <el-tooltip
            effect="dark"
            :content="mapTdTitle(scope.row?.[`${item}`], scope?.column?.no, scope.row?.deviceFullName)"
            :show-after="500"
            placement="bottom"
          >
            <div
              class="et-cell"
              :class="{
                'et-notLeft': !props.isLeafValue && index === 1,
                'et-is-error': mapErrorColor(index, scope.row?.tbFlag, scope.row?.hbFlag),
              }"
              @click="onCellClick(scope.$index, scope.row?.[item], index)"
            >
              {{ mapTdLabel(scope.row?.[`${item}`], scope?.column?.no) }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts" setup>
import { Common_IObject } from '@/services/common/common-api';
import { thousandSeparation } from '@/utils';

interface TableItem {
  id: number;
  name: string;
  value: string;
}

interface Props {
  tableData: Common_IObject[];
  tableHead: string[];
  isLeafValue: boolean;
  tableDataObject: TableItem[];
  lastMonthDate: string;
  lastYearDate: string;
}
const props = withDefaults(defineProps<Props>(), {
  tableData: () => [],
  tableHead: () => [],
  isLeafValue: false,
  tableDataObject: () => [],
  lastMonthDate: '',
  lastYearDate: '',
});
const emit = defineEmits(['object-name-click']);
/**
 * 判断头部是否需要tooltip
 */
const mapHeaderTooltipFlag = (index: number) => {
  return !props.isLeafValue && (index === 3 || index === 5);
};
/**
 * tooltip文本
 * @param index
 */
const mapHeaderTooltipLabel = (index: number) => {
  return index === 3 ? props.lastYearDate : props.lastMonthDate;
};
/**
 * 表格列宽
 * @param index
 */
const mapColumnWidth = (index: number) => {
  return index === 0 ? '50' : index === 1 ? '200' : 'auto';
};
/**
 * 处理单元格文本
 * @param label
 * @param index
 */
const mapTdLabel = (label: string, index: number) => {
  return index < 2 || label?.includes('%') || label === null || label === ''
    ? label ?? '--'
    : thousandSeparation(Number(label));
};
/**
 * 处理单元格title
 * @param label
 * @param index
 */
const mapTdTitle = (label: string, index: number, deviceFullName: string) => {
  let title =
    index < 2 || label?.includes('%') || label === null || label === ''
      ? label ?? '--'
      : thousandSeparation(Number(label));
  // 设备&第二列
  if (props.isLeafValue && index === 1) {
    title = deviceFullName;
  }

  return title;
};
/**
 * 是否异常
 * @param index
 * @param tbFlag
 * @param hbFlag
 */
const mapErrorColor = (index: number, tbFlag: boolean, hbFlag: boolean) => {
  return !props.isLeafValue && ((index === 4 && tbFlag) || (index === 6 && hbFlag));
};
/**
 * 节点点击事件
 */
const onCellClick = (index: number, name: string, columnIndex: number) => {
  const id = props.tableDataObject[index]?.id;
  if (!props.isLeafValue && id && columnIndex === 1) {
    emit('object-name-click', {
      id,
      name,
      index,
    });
  }
};
</script>
<style lang="less" scoped>
.eoed-table {
  margin-top: 12px;

  .et-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .et-header {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :deep(.el-table) {
    th > .cell {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .el-table__fixed::before {
      display: none;
    }
  }
  .et-notLeft {
    color: rgba(24, 144, 255, 1);
    cursor: pointer;
  }

  .et-is-error {
    color: var(--te-color-danger);
  }
}
</style>
