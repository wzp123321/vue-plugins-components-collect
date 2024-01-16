<template>
  <div class="dr-table">
    <!-- 表格 -->
    <te-table ref="tableRef" :data="dataList" stripe @sort-change="handleSortChange($event, sortColumnKey)">
      <te-table-column label="排名" align="center" :width="68">
        <template #default="scope">
          <span :class="['dt-column-sort', mapSortClassName(scope.$index)]">
            {{ scope.$index + 1 }}
          </span>
        </template>
      </te-table-column>
      <te-table-column label="科室名称" align="center" width="200">
        <template #default="scope">
          <span class="dt-column-name" :title="scope.row.name">{{ scope.row.name }}</span>
        </template>
      </te-table-column>
      <te-table-column :label="sortColumnName" align="center" sortable>
        <template #header>
          <div class="dr-table-header">
            <div :title="sortColumnName">{{ sortColumnName }}</div>
            <te-tooltip placement="top" effect="dark">
              <template #content>
                <div style="white-space: normal; word-break: break-all">
                  {{
                    sortColumnKey === DR_ESortColumn.排名盈余
                      ? '科室考核盈余 = 考核目标值 - 实际值'
                      : '科室考核盈余率 = (考核目标值 - 实际值) / 考核目标值 * 100%'
                  }}
                </div>
              </template>
              <icon-explain />
            </te-tooltip>
          </div>
        </template>

        <template #default="scope">
          <DrProgress
            :value="scope.row.value"
            :negativeFlag="scope.row.negativeFlag"
            :width="scope.row.width"
            :unit="props.unit"
          ></DrProgress>
        </template>
      </te-table-column>
    </te-table>
  </div>
</template>
<script lang="ts" setup>
// 公共库
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// 组件
import { TeTable, TeTableColumn, TableColumnCtx } from '@tiansu/element-plus';
import DrProgress from '../dr-progress/dr-progress.vue';
import { IconExplain } from '@arco-iconbox/vue-te';

// 服务
import resultPublicityService from '../../da-result-publicity.service';
import { DA_SP_IConvertRankTableVO, DRP_ESortType } from '../../da-result-publicity.api';
import { DR_ESortColumn, DR_ETableCompSortType } from '../dsp-rank.api';

// 可观察对象
const destroy$ = new Subject<void>();
// emit事件
const emits = defineEmits(['sort']);
// props参数
const props = defineProps({
  dataSource: {
    type: Array,
    default: [],
  },
  sortColumnName: {
    type: String,
    default: '',
  },
  sortColumnKey: {
    type: String,
    default: '',
  },
  unit: {
    type: String,
    default: '',
  },
});

// 表格dom
const tableRef = ref();
// 列表数据
const dataList = computed(() => {
  return props.dataSource;
});
/**
 * 序号列-类名
 * @param {number} index
 * @returns {string}
 */
const mapSortClassName = (index: number): string => {
  const names = ['first', 'second', 'third'];
  return index < 3 ? names?.[index] : '';
};
/**
 * 表格列排序
 * @param {TableColumnCtx<DA_SP_IConvertRankTableVO>} column 列
 * @param {string} prop 列属性
 * @param {string} order 当前排序方式
 * @param {string} sortColumnKey 排序列的key
 */
const handleSortChange = (
  { column, prop, order }: { column: TableColumnCtx<DA_SP_IConvertRankTableVO>; prop: string; order: string },
  sortColumnKey: string,
) => {
  const order_value = order === DR_ETableCompSortType.升序 ? DRP_ESortType.升序 : DRP_ESortType.降序;
  emits('sort', sortColumnKey, order_value);
};
/**
 * 初始化,订阅是否重置排序
 */
onMounted(() => {
  resultPublicityService.resetSortSignal.pipe(takeUntil(destroy$)).subscribe((v) => {
    if (tableRef.value) {
      tableRef.value?.clearSort();
    }
  });
});
/**
 * 组件销毁
 */
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
.dr-table {
  :deep(.te-table) {
    div.cell {
      white-space: nowrap;
      width: 100%;

      > span.dt-column-sort {
        color: var(--te-text-color-regular);

        &.first {
          color: var(--te-color-danger);
        }

        &.second {
          color: var(--te-color-warning);
        }

        &.third {
          color: var(--te-color-primary);
        }
      }

      > span.dt-column-name {
        display: inline-block;
        width: 100%;
        overflow: hidden;
        white-space: normal;
        text-overflow: ellipsis;
      }
    }
  }
  .dr-table-header {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    > div {
      color: var(--te-text-color-secondary);
      font-family: PingFang SC;
      font-weight: 600;
      font-size: var(--te-font-size-b14);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
