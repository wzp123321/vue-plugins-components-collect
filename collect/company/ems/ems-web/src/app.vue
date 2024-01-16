<template>
  <el-config-provider :locale="locale">
    <te-config-provider :locale="teZhCn">
      <router-view />
    </te-config-provider>
  </el-config-provider>
</template>
<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { TeConfigProvider } from '@tiansu/element-plus';

import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import teZhCn from '@tiansu/element-plus/lib/locale/lang/zh-cn';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { FGetQueryParam, FSetStorageData } from '@/utils/token';

dayjs.locale('zh-cn');

export default defineComponent({
  components: {
    TeConfigProvider,
  },
  setup() {
    const locale = zhCn;

    /**
     * 初始化 添加resize事件监听
     */
    onMounted(() => {
      setParams();
    });
    /**
     * 卸取参数
     */
    const setParams = () => {
      window.sessionStorage.removeItem('ems-sourceValue');
      // 判断地址栏是否有sourceValue字段
      if (FGetQueryParam('sourceValue')) {
        FSetStorageData('ems-sourceValue', `${FGetQueryParam('sourceValue')}`);
        FSetStorageData('ems-wholeHospitalFlag', 'true');
        if (FGetQueryParam('cloudToken')) {
          FSetStorageData('ems-cloudToken', `${FGetQueryParam('cloudToken')}`);
        }
        if (FGetQueryParam('tenantId')) {
          FSetStorageData('energy-corpid', `${FGetQueryParam('tenantId')}`);
        }
        if (FGetQueryParam('token')) {
          FSetStorageData('energy-token', `${FGetQueryParam('token')}`);
        }
        if (FGetQueryParam('loginName')) {
          FSetStorageData('energy-loginName', `${FGetQueryParam('loginName')}`);
        }
      }
    };
    return {
      locale,
      teZhCn,
    };
  },
});
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
