<template>
  <header>
    <h5>{{ title }}</h5>
  </header>
  <main flexible="true">
    <te-config-provider :locale="zhCn">
      <router-view></router-view>
    </te-config-provider>
  </main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import zhCn from '@tiansu/element-plus/es/locale/lang/zh-cn';


const route = useRoute();
/**
 * 网页头部标题
 */
const title = computed(() => {
  return route?.meta?.title;
});
</script>
<style lang="less">
#app {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 10px 16px 12px;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  gap: 10px;

  > header > h5 {
    flex: none;
    height: 22px;
    line-height: 22px;
    color: #000;
    font-size: 16px;
    text-align: left;
    font-weight: 500;
  }

  > main {
    flex: auto;
    background-color: #fff;
    box-shadow: 0 1px 7px #2626261a;
    display: flex;
    flex-direction: column;
    padding: 16px;
  }

  // 弹性布局
  [flexible='true'] {
    flex: auto;
  }
  [flexible='false'] {
    flex: none;
  }
}
</style>
