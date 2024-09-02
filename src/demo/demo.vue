<template>
  <div class="demo">
    <el-table :data="tableData" :span-method="objectSpanMethod" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column type="sort" label="Name">
        <template #default="{ row, $index }">
          <div :data-index="$index" @mousedown="handleMouseDown($event, row, $index)">
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

let trNode: HTMLElement
const handleMouseDown = (event: MouseEvent, row: User, index: number) => {
  currentRow.id = row.id;
  currentRow.name = row.name;
  currentRow.amount1 = row.amount1;
  currentRow.amount2 = row.amount2;
  currentRow.amount3 = row.amount3;
  currentIndex.value = index;

  // https://deepinout.com/javascript/javascript-questions/195_77259549-how-to-change-cursor-while-dragging-in-dragstart-or-dragover-in-javascript.html#:~:text=draggableElement.addEventListener%28%27dragstart%27%2C%20function%28event%29%20%7B%20%2F%2F%20%E8%AE%BE%E7%BD%AE%E6%8B%96%E5%8A%A8%E6%97%B6%E7%9A%84%E5%85%89%E6%A0%87%E6%A0%B7%E5%BC%8F%E4%B8%BA%22move%22%20event.dataTransfer.effectAllowed%20%3D,%27move%27%3B%20%2F%2F%20%E4%BF%AE%E6%94%B9%E6%8B%96%E5%8A%A8%E6%97%B6%E6%98%BE%E7%A4%BA%E7%9A%84%E5%9B%BE%E6%A0%87%20event.dataTransfer.setDragImage%28draggableElement%2C%200%2C%200%29%3B%20%7D%29%3B
  const target = event.target as HTMLElement
  if (target) {
    trNode = target.parentNode?.parentNode?.parentNode as HTMLElement
    trNode.setAttribute('draggable', 'true')
    trNode.addEventListener('dragstart', handleDragStart)
    trNode.addEventListener('dragover', handleDragOver)
    trNode.addEventListener('drop', handleDrop)
    console.log(target, target.parentNode?.parentNode?.parentNode,);

  }
  // :draggable="true" @dragstart="handleDragStart(row, $index)" @drop="handleDrop($event, row, $index)"
  // @dragover="handleDragOver($event, row, $index)"
}

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
const handleDragStart = () => {
  dragFlag.value = true;
};
/**
 * drop 目标元素 被拖放的元素在目标元素上同时鼠标放开触发的事件
 * @param event 
 */
const handleDrop = (event: Event) => {
  console.log('event-------------', event);
  if (trNode) {
    trNode.removeAttribute('draggable')
  }
  // if (row.id === currentRow.id) {
  //   console.log('handleDrop -----------------', dragFlag.value, currentIndex.value, row, index);
  //   const cloneItem = cloneDeep(currentRow);
  //   if (index > currentIndex.value) {
  //     tableData.value.splice(index + 1, 0, cloneItem);
  //     tableData.value.splice(currentIndex.value, 1);
  //   } else if (index < currentIndex.value) {
  //     tableData.value.splice(index, 0, cloneItem);
  //     console.log(tableData.value);
  //     tableData.value.splice(currentIndex.value + 1, 1);
  //     console.log(tableData.value);
  //   }
  // }
};
const handleDragOver = (event: Event) => {
  event.preventDefault()
}
</script>
<style lang="less" scoped>
.demo {
  height: 100%;
}
</style>
