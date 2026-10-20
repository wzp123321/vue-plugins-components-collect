<template>
  <div class="ddiv" @click="show">点我打开</div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { TeWorkflowUtil } from '@ts-web-package/components/lib/te-workflow/src/workflow-util-doc';
import axios from 'axios';
const axiosInstance = axios.create({
  baseURL: 'http://192.168.50.174:7300/mock/661e5f340c741600205e68c7/example',
});
onMounted(() => {});
const show = () => {
  TeWorkflowUtil.openTaskDetail(
    '700',
    'taskInstanceId',
    'processInstanceId',
    axiosInstance,
    {
      openType: 'COMPONENT',
    },
    ['TODO']
  )
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.error(err);
    });
};
</script>

<style scoped lang="less">
.ddiv {
  cursor: pointer;
}
</style>
