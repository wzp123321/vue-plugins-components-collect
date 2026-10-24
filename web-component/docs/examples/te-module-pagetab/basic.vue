<!--
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-05-17 14:23:02
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-05-17 14:27:48
 * @Description: 
-->
<template>
  <div style="height: 500px; width: 700px; border: 1px solid">
    <te-module-pagetab :model-value="'second'" :show-tab-tip="true">
      <template #tip>
        <div style="padding: 8px;">lalallalallalala</div>
      </template>
      <te-tab-pane label="User" name="first">User</el-tab-pane>
      <te-tab-pane label="Config" name="second">Config</el-tab-pane>
      <te-tab-pane label="Role" name="third">Role</el-tab-pane>
      <te-tab-pane label="Task" name="fourth">Task</el-tab-pane>
    </te-module-pagetab>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElTabPane } from 'element-plus';
import { TeModulePagetab } from '@ts-web-package/components/lib/te-module-pagetab';

onMounted(() => {});
</script>
<script lang="ts">
export default {
  name: 'te-module-pagetab-demo',
};
</script>
