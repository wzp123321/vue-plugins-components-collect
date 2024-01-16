<!--
 * @Author: yut
 * @Date: 2023-08-11 16:45:27
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-10-19 18:51:53
 * @Descripttion: 
-->
<template>
  <div class="hnm-list">
    <hnm-list-search />
    <hnm-list-table :configureHostFlag="configureHostFlag" />
    <hnm-list-update :configureHostFlag="configureHostFlag" />
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import hnmListSearch from './hnm-list-search/hnm-list-search.vue';
import hnmListTable from './hnm-list-table/hnm-list-table.vue';
import hnmListUpdate from './hnm-list-update/hnm-list-update.vue';
import { postRequest } from '@/service/request';
// 工具方法
import { getTenant } from '@/utils';

import { EPath } from './hnm-list-update/hnm-list-update.api';

// 是否配置过平托
const configureHostFlag = ref<boolean>(false);
// 查询项目是否配置平托
const queryProjectConfigureHost = async () => {
  configureHostFlag.value = false;

  const res = await postRequest(EPath.查询项目是否配置过平托, getTenant());
  if (res?.success) {
    configureHostFlag.value = res?.data;
  }
};

onMounted(() => {
  queryProjectConfigureHost();
});
</script>
<style lang="less" scoped>
.hnm-list {
  width: 100%;
  height: 100%;
}
</style>
