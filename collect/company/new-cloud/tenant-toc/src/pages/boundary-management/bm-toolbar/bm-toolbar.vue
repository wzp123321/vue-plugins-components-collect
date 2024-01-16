<template>
  <div class="bm-toolbar flex-row-justify-center" id="bm-toolbar">
    <sub-title title="边界管理"></sub-title>
    <button primary @click="addEditDialogService.handleShow({ hostingPeriod: queryParams.hostingPeriod })">新增</button>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import bmDataService from '../boundary-management.service';
import addEditDialogService from '../bm-add-edit-dialog/bm-add-edit-dialog.service';
import { BM_IAddManagementForm } from '../bm-search-bar/bm-search-bar.api';

const destroy$ = new Subject<void>();
const queryParams = ref<BM_IAddManagementForm>({
  hostingPeriod: null,
  measureType: '',
  verificationType: '',
});

onMounted(() => {
  bmDataService.bmQueryParams.pipe(takeUntil(destroy$)).subscribe((v) => {
    queryParams.value = {
      ...queryParams.value,
      ...v,
    };
  });
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
#bm-toolbar {
  :deep(.sub-title) {
    line-height: 22px;
  }
}
</style>
