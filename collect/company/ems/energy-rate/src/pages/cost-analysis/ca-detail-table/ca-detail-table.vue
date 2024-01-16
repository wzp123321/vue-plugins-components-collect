<template>
  <div class="ca-detail-table">
    <!-- 表格 -->
    <te-table :data="costTableData.body" align="center">
      <te-table-column label="序号" prop="sort" width="140" align="center"></te-table-column>
      <te-table-column label="对象" align="center">
        <template #default="scope">
          <span :title="scope?.row?.analysisObj">
            {{ scope?.row?.analysisObj }}
          </span>
        </template>
      </te-table-column>
      <te-table-column label="总成本(元)" align="center">
        <template #default="scope">
          <span :title="thousandSeparation(scope?.row?.totalCost)">
            {{ scope?.row?.totalCost !== '--' ? thousandSeparation(scope?.row?.totalCost) : scope?.row?.totalCost }}
          </span>
        </template>
      </te-table-column>
      <te-table-column label="分项成本" v-if="costTableData.title?.length !== 0" align="center">
        <te-table-column v-for="item in costTableData.title" :label="item" :key="item" align="center">
          <template #default="scope">
            <span :title="thousandSeparation(scope?.row?.[item])">
              {{ scope?.row?.[item] !== '--' ? thousandSeparation(scope?.row?.[item]) : scope?.row?.[item] }}
            </span>
          </template>
        </te-table-column>
      </te-table-column>
      <te-table-column label="分项成本" v-if="costTableData.title?.length === 0" align="center"> </te-table-column>
    </te-table>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, reactive } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import costAnalysisService from '../cost-analysis.service';
import { CA_IConvertTableDataVO } from '../cost-analysis.api';
import { thousandSeparation } from '../../../utils';

// 可观察对象
const destroy$ = new Subject<void>();
// 表格数据
const costTableData = reactive<CA_IConvertTableDataVO>({
  body: [],
  title: [],
  treeIdList: [],
});
/**
 * 初始化
 * 订阅表格数据
 */
onMounted(() => {
  costAnalysisService.detailTable$.pipe(takeUntil(destroy$)).subscribe((v) => {
    costTableData.body = v?.body ?? [];
    costTableData.title = v?.title ?? [];
    costTableData.treeIdList = v?.treeIdList ?? [];
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
.ca-detail-table {
  .sub-title {
    margin-bottom: 20px;
  }
}
</style>
