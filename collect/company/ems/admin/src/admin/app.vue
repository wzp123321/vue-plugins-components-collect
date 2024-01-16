<script lang="ts">
import { defineComponent } from 'vue';

import permissionConfigure from '../pages/permission-configure/permission-configure.vue';

import zhCn from 'element-plus/lib/locale/lang/zh-cn';

export default defineComponent({
  components: {
    permissionConfigure,
  },
  setup() {
    return {
      locale: zhCn,
    };
  },
});
</script>

<template>
  <permissionConfigure></permissionConfigure>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  overflow: hidden;
}
</style>
