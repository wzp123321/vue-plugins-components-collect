<template>
  <div class="demo">
    <el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column type="sort" label="Name">
        <template #default="{ row, $index }">
          <div :draggable="true" @dragstart="handleDragStart(row, $index)" @drop="handleDrop($event, row, $index)"
            @dragover="handleDragOver($event, row, $index)">
            {{ row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="amount1" label="Amount 1" />
      <el-table-column prop="amount2" label="Amount 2" />
      <el-table-column prop="amount3" label="Amount 3" />
    </el-table>

    <!-- 用于拖拽的行 -->
  </div>
</template>
<script lang="ts" setup>
import type { TableColumnCtx } from 'element-plus';
import { reactive, ref } from 'vue';
import { throttle, debounce, cloneDeep } from 'lodash';

interface User {
  id: string;
  name: string;
  amount1: string;
  amount2: string;
  amount3: number;
  rowSpan: number
}

interface SpanMethodProps {
  row: User;
  column: TableColumnCtx<User>;
  rowIndex: number;
  columnIndex: number;
}

const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 0) {
    if (rowIndex === 0) {
      return {
        rowspan: 3,
        colspan: 1,
      };

    } else if (rowIndex === 3) {
      return {
        rowspan: 4,
        colspan: 1,
      };

    } else {
      return {
        rowspan: 0,
        colspan: 1,
      };
    }
  }

};

const tableData = ref<User[]>([
  {
    id: '12987122',
    rowSpan: 3,
    name: 'Tom1',
    amount1: '234',
    amount2: '3.2',
    amount3: 10,
  },
  {
    id: '12987122',
    name: 'Tom2',
    rowSpan: 0,
    amount1: '165',
    amount2: '4.43',
    amount3: 12,
  },
  {
    id: '12987122',
    name: 'Tom3',
    rowSpan: 0,
    amount1: '324',
    amount2: '1.9',
    amount3: 9,
  },
  {
    id: '12987123',
    name: 'Tom4',
    rowSpan: 4,
    amount1: '621',
    amount2: '2.2',
    amount3: 17,
  },
  {
    id: '12987123',
    name: 'Tom5',
    rowSpan: 0,
    amount1: '539',
    amount2: '4.1',
    amount3: 15,
  },
  {
    id: '12987123',
    name: 'Tom6',
    rowSpan: 0,
    amount1: '539',
    amount2: '4.1',
    amount3: 15,
  },
  {
    id: '12987123',
    name: 'Tom7',
    rowSpan: 0,
    amount1: '539',
    amount2: '4.1',
    amount3: 15,
  },
]);

const currentIndex = ref(-1);
// 当前拖拽行
const currentRow = reactive<User>({
  id: '',
  rowSpan: 1,
  name: '',
  amount1: '',
  amount2: '',
  amount3: 0,
});
const dragFlag = ref(false);
const handleDragStart = (row: User, index: number) => {
  currentRow.id = row.id;
  currentRow.name = row.name;
  currentRow.amount1 = row.amount1;
  currentRow.amount2 = row.amount2;
  currentRow.amount3 = row.amount3;
  dragFlag.value = true;
  currentIndex.value = index;
  console.log('handleDragStart-------------', index, row);
};
/**
 * drop 目标元素 被拖放的元素在目标元素上同时鼠标放开触发的事件
 * @param event 
 * @param row 
 * @param index 
 */
const handleDrop = (event: Event, row: User, index: number) => {
  if (row.id === currentRow.id) {
    console.log('handleDrop -----------------', dragFlag.value, currentIndex.value, row, index);
    const cloneItem = cloneDeep(currentRow);
    if (index > currentIndex.value) {
      tableData.value.splice(index + 1, 0, cloneItem);
      tableData.value.splice(currentIndex.value, 1);
    } else if (index < currentIndex.value) {
      tableData.value.splice(index, 0, cloneItem);
      console.log(tableData.value);
      tableData.value.splice(currentIndex.value + 1, 1);
      console.log(tableData.value);
    }
  }
};
const handleDragOver = (event: Event, row: User, index: number) => {
  event.preventDefault()
  // 只有同类的才可以拖拽
  // if (row.id === currentRow.id && !dragFlag.value) {
  //   console.log('handleDragOver -----------------', dragFlag.value, currentIndex.value, index);
  //   const cloneItem = cloneDeep(currentRow);
  //   if (index > currentIndex.value) {
  //     tableData.value.splice(index + 1, 0, cloneItem);
  //     tableData.value.splice(currentIndex.value, 1);
  //   } else if (index < currentIndex.value) {
  //     console.log(212);
  //     tableData.value.splice(Math.max(index - 1, 0), 0, cloneItem);
  //     console.log(tableData.value);
  //     tableData.value.splice(currentIndex.value + 1, 1);
  //     console.log(tableData.value);
  //   }
  //   currentIndex.value = index
  // }
}
</script>
<style lang="less" scoped>
.demo {
  height: 100%;
}
</style>
