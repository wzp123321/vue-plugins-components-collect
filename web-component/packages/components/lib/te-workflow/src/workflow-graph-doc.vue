<template>
  <div class="workflow-graph">
    <img src="../../../assets/images/workflowGraph.jpg" />
  </div>
</template>
<script setup lang="ts">
import { Axios } from 'axios';
const props = defineProps<{
  axios: Axios;
  processInstanceId: string;
  tenantId: string;
}>();
</script>

<style scoped lang="less">
.workflow-graph {
  width: 100%;
  height: 100%;
}
</style>
