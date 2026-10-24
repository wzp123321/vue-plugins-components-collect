<template>
  <el-tag>Tag default</el-tag>
  <te-tag v-for="(item, index) in types" class="ml-2" style="margin-top: 15px;" :type="item">{{ `Tag ${item}` }}</el-tag>
</template>
<script setup lang="ts">
const types = ['success', 'info', 'warning', 'danger', 'data1', 'data2', 'data3', 'data4', 'data5', 'data6', 'data7', 'data8', 'data9', 'data10']
</script>
