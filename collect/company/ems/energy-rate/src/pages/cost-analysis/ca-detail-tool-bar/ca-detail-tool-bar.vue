<template>
  <div class="ca-detail-tool-bar">
    <sub-title title="成本明细">
      <te-button
        type="primary"
        @click="handleDetailExport"
        :disabled="exportLoading || exportParams?.treeIdList?.length === 0"
        >导出</te-button
      >
    </sub-title>
  </div>
</template>
<script lang="ts" setup>
import { onUnmounted, onMounted, ref, reactive } from 'vue';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { useFileDownload } from '../../../services/file/index';
import costAnalysisService from '../cost-analysis.service';
import { CA_EPath, CA_IQueryParams } from '../cost-analysis.api';
import { Common_EFileDownloadType } from '../../../services/api';

const destroy$ = new Subject<void>();
// 导出loading
const exportLoading = ref<boolean>(false);
// 导出入参
const exportParams = reactive<CA_IQueryParams>({
  startTime: '',
  endTime: '',
  treeIdList: [],
});
/**
 * 导出明细
 */
const handleDetailExport = () => {
  if (exportLoading.value || exportParams?.treeIdList?.length === 0) {
    return;
  }
  exportLoading.value = true;
  useFileDownload(exportParams, CA_EPath.导出成本明细, Common_EFileDownloadType.导出).then(() => {
    exportLoading.value = false;
  });
};

onMounted(() => {
  costAnalysisService.exportParams$.pipe(takeUntil(destroy$)).subscribe((v) => {
    exportParams.startTime = v?.startTime;
    exportParams.endTime = v?.endTime;
  });
  costAnalysisService.detailTable$.pipe(takeUntil(destroy$)).subscribe((v) => {
    exportParams.treeIdList = v?.treeIdList;
  });
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
.ca-detail-tool-bar {
  width: 100%;

  .sub-title {
    margin-bottom: 20px;
  }
}
</style>
