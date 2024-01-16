<script lang="ts">
import { defineComponent, onMounted } from 'vue';

import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import teZhCn from '@tiansu/element-plus/lib/locale/lang/zh-cn';
import { TeConfigProvider } from '@tiansu/element-plus';
import { clearCookies, FGetSessionStorageData, FSetSessionStorageData } from './utils/token';
import { FGetQueryParam } from './utils';

export default defineComponent({
  components: {
    TeConfigProvider,
  },
  setup() {
    onMounted(() => {
      if (FGetQueryParam('token')) {
        clearCookies();
      }
      if (FGetQueryParam('token') || FGetSessionStorageData('energy-token')) {
        if (FGetQueryParam('token')) {
          FSetSessionStorageData('energy-token', FGetQueryParam('token') as string);
        }
        if (FGetQueryParam('corpid')) {
          FSetSessionStorageData('energy-corpid', FGetQueryParam('corpid') as string);
        }
        if (FGetQueryParam('showtype')) {
          FSetSessionStorageData('energy-showtype', FGetQueryParam('showtype') as string);
        }
      } else {
        if (FGetQueryParam('loginName')) {
          FSetSessionStorageData('ems-username', FGetQueryParam('loginName') as string);
          FSetSessionStorageData('energy-loginName', FGetQueryParam('loginName') as string);
        }
        if (FGetQueryParam('tenantCode')) {
          FSetSessionStorageData('energy-corpid', FGetQueryParam('tenantCode') as string);
        }
      }
    });

    return {
      locale: zhCn,
      teZhCn,
    };
  },
});
</script>

<template>
  <el-config-provider :locale="locale">
    <te-config-provider :locale="teZhCn">
      <router-view></router-view>
    </te-config-provider>
  </el-config-provider>
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
