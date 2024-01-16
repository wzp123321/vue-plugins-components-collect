<template>
  <div class="boundary-management" id="boundary-management">
    <h5>边界管理</h5>
    <main>
      <BmSearchbar></BmSearchbar>
      <BmToolBar></BmToolBar>
      <BmRulesTable></BmRulesTable>
      <BmCollapseHome></BmCollapseHome>
      <!-- 新增、编辑弹框 -->
      <BmAddEditDialog :hostPeriodList="bmDataService.hostPeriodList"></BmAddEditDialog>
    </main>
  </div>
</template>
<script lang="ts" setup>
import bmDataService from './boundary-management.service';

import BmSearchbar from './bm-search-bar/bm-search-bar.vue';
import BmToolBar from './bm-toolbar/bm-toolbar.vue';
import BmRulesTable from './bm-rules-table/bm-rules-table.vue';
import BmCollapseHome from './bm-collapse-home/bm-collapse-home.vue';
import BmAddEditDialog from './bm-add-edit-dialog/bm-add-edit-dialog.vue';
</script>
<style lang="less" scoped>
#boundary-management {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  background-color: rgba(240, 244, 249, 1);

  > h5 {
    font-size: 16px;
  }

  > main {
    flex: auto;
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    border-radius: 2px;
    min-width: 1440px;
  }
}
</style>
