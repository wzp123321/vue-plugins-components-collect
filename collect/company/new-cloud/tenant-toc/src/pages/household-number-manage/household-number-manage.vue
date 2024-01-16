<!--
 * @Author: yut
 * @Date: 2023-08-11 16:08:20
 * @LastEditors: yut
 * @LastEditTime: 2023-12-08 11:04:16
 * @Descripttion: 
-->
<template>
  <div class="household-number-manage">
    <page-container title="户号管理" :hasSearch="false" :hasTitle="false">
      <template v-slot:pageContent>
        <te-tabs v-model="activeName">
          <te-tab-pane label="户号数据" :name="HNM_ETabType.户号数据"
            ><hnm-data v-if="activeName === HNM_ETabType.户号数据"
          /></te-tab-pane>
          <te-tab-pane label="户号列表" :name="HNM_ETabType.户号列表"
            ><hnm-list v-if="activeName === HNM_ETabType.户号列表"
          /></te-tab-pane>
        </te-tabs>
      </template>
    </page-container>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { HNM_ETabType } from './household-number-manage.api';
import { HnmData, HnmList } from './components';
import { FBatchRemoveStorageData, FGetStorageData, FSetStorageData } from '@/utils/storage';

const activeName = ref(HNM_ETabType.户号数据);

onMounted(() => {
  if (FGetStorageData('toc-household')) {
    activeName.value = HNM_ETabType.户号列表;
  } else {
    HNM_ETabType.户号数据;
  }
  FBatchRemoveStorageData(['toc-household']);
});
</script>
<style lang="less" scoped>
.household-number-manage {
  width: 100%;
  height: 100%;
  .te-tabs {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  :deep(.te-tabs__header) {
    flex: none;
  }
  :deep(.te-tabs__content) {
    flex: auto;
    > div {
      width: 100%;
      height: 100%;
    }
  }

  :deep(.te-dialog__header) {
    display: flex;
    align-items: center;
    height: 48px;
    padding: 12px 20px;
    background-color: var(--color-table-header);
    border: none;
    border-radius: 3px 3px 0 0;
    margin-right: 0;
  }
  :deep(.te-dialog__headerbtn) {
    width: 48px;
    height: 48px;
    top: 0;
    right: 0;
  }
  :deep(.te-dialog__title) {
    line-height: 24px;
    font-size: 14px !important;
    font-weight: 400 !important;
    color: var(--color-primary);
  }
  :deep(.te-table-v2__header-cell) {
    background-color: var(--te-fill-color-light);
  }
  :deep(.te-dialog__body) {
    margin: 22px 5px 8px;
    padding: 4px 15px;
  }
  :deep(.te-date-editor input[readonly]) {
    cursor: pointer !important;
  }
}
</style>
