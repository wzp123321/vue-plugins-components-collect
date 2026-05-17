<template>
  <div class="container">
    <div class="flex" style="padding: 16px">
      <el-input type="text" v-model="insertLine" />
      <el-input class="ml16" type="text" v-model="insertStart" />
      <el-button class="ml16" @click="handleInsert">插入数据</el-button>
      <el-button class="ml16" @click="reset">重置</el-button>
    </div>
    <table class="vue3-virtual-list-container" ref="root" @scroll.passive="handleScroll">
      <div class="vue3-virtual-list-scroll" :style="`height: ${scrollHeight}px;padding-top: ${paddingTop}px`">
        <thead>
          <tr>
            <th class="cd-table-fixed" style="width: 60px">序号</th>
            <th class="cd-table-fixed" style="width: 211px">项目（项目任务（MD））</th>
            <th class="cd-table-fixed" style="width: 245px"></th>
            <th class="cd-table-fixed" style="width: 161px"></th>
            <th class="cd-table-fixed" style="width: 169px">总账科目（来源）</th>
            <th class="cd-table-fixed" style="width: 199px">对应客户/供应商编号</th>
            <th class="cd-table-fixed" style="width: 189px"></th>
            <th class="cd-table-fixed" style="width: 120px">产品</th>
            <th class="cd-table-fixed" style="width: 91px"></th>
            <th class="cd-table-fixed" style="width: 120px">产品类别</th>
            <th class="cd-table-fixed" style="width: 91px"></th>
            <th class="cd-table-fixed" style="width: 126px">过账日期</th>
            <th class="cd-table-fixed" style="width: 116px">年份</th>
            <th class="cd-table-fixed" style="width: 116px">月份</th>
            <th class="cd-table-fixed" style="width: 152px">日记账分录</th>
            <th class="cd-table-fixed" style="width: 150px">日记账分录类</th>
            <th class="cd-table-fixed" style="width: 205px">日记账分录抬头文本</th>
            <th class="cd-table-fixed" style="width: 244px">日记账分录项目文本</th>
            <th class="cd-table-fixed" style="width: 136px">创建时间</th>
            <th class="cd-table-fixed" style="width: 157px">公司货币余额</th>
            <th class="cd-table-fixed" style="width: 122px">评估数量</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="vue3-virtual-list-item-container"
            v-for="(item, index) in pool"
            :key="item.id"
            :style="`height: ${itemSize}px`"
            @click="rowClick(item, index)"
          >
            <td class="cell">{{ index + 1 }}</td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.projectNumber }}</span>
              <el-input type="text" v-model="item.projectNumber" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.projectNumber }}</span>
              <el-input type="text" v-model="item.projectNumber" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.projectTaskName }}</span>
              <el-input type="text" v-model="item.projectTaskName" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.ledgerCode }}</span>
              <el-input type="text" v-model="item.ledgerCode" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.ledgerName }}</span>
              <el-input type="text" v-model="item.ledgerName" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.employeeCode }}</span>
              <el-input type="text" v-model="item.employeeCode" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.employeeName }}</span>
              <el-input type="text" v-model="item.employeeName" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.productCode }}</span>
              <el-input type="text" v-model="item.productCode" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.productName }}</span>
              <el-input type="text" v-model="item.productName" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.productType }}</span>
              <el-input type="text" v-model="item.productType" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.productTypeName }}</span>
              <el-input type="text" v-model="item.productTypeName" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.billDate }}</span>
              <el-input type="text" v-model="item.billDate" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.billYear }}</span>
              <el-input type="text" v-model="item.billYear" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.billMonth }}</span>
              <el-input type="text" v-model="item.billMonth" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.billCode }}</span>
              <el-input type="text" v-model="item.billCode" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.billTitleContent }}</span>
              <el-input type="text" v-model="item.billTitleContent" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.billProjectContent }}</span>
              <el-input type="text" v-model="item.billProjectContent" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.recordTime }}</span>
              <el-input type="text" v-model="item.recordTime" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.balance }}</span>
              <el-input type="text" v-model="item.balance" v-else />
            </td>
            <td class="cell">
              <span v-if="!item.editing">{{ item.amount }}</span>
              <el-input type="text" v-model="item.amount" v-else />
            </td>
          </tr>
        </tbody>
      </div>
    </table>
  </div>
</template>

<script lang="ts">
import { CD_CostDetailConvertVO } from './list.api';
import { defineComponent, onMounted, ref } from 'vue';
import { mock } from './utils';
import { useVirtualScroll } from '@/hooks';

export default defineComponent({
  name: 'VueVirtualListContainer',

  setup() {
    const dataSource = ref<CD_CostDetailConvertVO[]>(mock(300));
    const itemSize = ref<number>(60);
    const poolBuffer = ref<number>(10);
    const insertLine = ref<number>(0);
    const insertStart = ref<number>(0);

    const root = ref<HTMLElement | null>(null);

    const { pool, scrollHeight, paddingTop, handleScroll, updatePool, initPool, refreshScrollHeight } =
      useVirtualScroll<CD_CostDetailConvertVO>({
        dataSource,
        itemSize,
        poolBuffer,
        rootRef: root,
        itemsPerRow: 1,
      });

    const handleInsert = () => {
      dataSource.value.splice(insertStart.value, 0, ...mock(insertLine.value, true));
      pool.value = [];
      refreshScrollHeight();
      updatePool();
    };

    const reset = () => {
      insertStart.value = 0;
      insertLine.value = 0;
    };

    const rowClick = (row: CD_CostDetailConvertVO, index: number) => {
      console.log(row, index);
    };

    onMounted(() => {
      initPool();
    });

    return {
      insertLine,
      insertStart,
      itemSize,
      dataSource,
      pool,
      scrollHeight,
      root,
      paddingTop,
      reset,

      handleScroll,
      handleInsert,
      rowClick,
    };
  },
});
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 500px;
}

.vue3-virtual-list-container {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  overflow: auto;
}
.vue3-virtual-list-scroll {
  box-sizing: border-box;
}
.vue3-virtual-list-item-container {
  overflow: hidden;
}

table {
  min-width: 100%;
  max-height: 100%;
  display: block;
  table-layout: fixed;

  :deep(.el-select) {
    .el-input__wrapper {
      padding: 0 8px;
    }

    .el-input__suffix > .el-input__suffix-inner > i {
      position: relative;

      width: 16px;
      height: 16px;

      &::before {
        font-family: 'ems-iconfont';
        content: '\e65d';

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      svg {
        display: none;
      }
    }
  }

  thead {
    z-index: 10;
    position: sticky;
    top: 0;
  }

  thead tr th {
    position: relative;
  }

  thead tr th:first-child {
    z-index: 11;
  }

  tr {
    table-layout: fixed;
  }

  .cd-table-fixed {
    z-index: 1;
    position: sticky;
    left: 0;
  }

  tbody tr {
    &.selected-row > td {
      background-color: var(--color-active);
    }

    &.copying-row > td,
    &.editing-row > td {
      background-color: var(--color-hover);
    }

    &.insert-row {
      td:first-child {
        border-left: 1px solid var(--color-primary);
      }

      td:last-child {
        border-right: 1px solid var(--color-primary);
      }
    }

    &.insert-start {
      td {
        border-top: 1px solid var(--color-primary);
      }
    }

    &.insert-end {
      td {
        border-bottom: 1px solid var(--color-primary);
      }
    }

    td {
      position: relative;
      overflow: hidden;
      padding: 0 15px;
      height: 48px;
      line-height: 48px;

      &:hover {
        span {
          color: var(--color-primary);
        }
      }
    }
  }
}
</style>
