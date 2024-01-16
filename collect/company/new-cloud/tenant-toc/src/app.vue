<template>
  <el-config-provider :locale="locale">
    <te-config-provider :locale="teZhCn" :message="{ max: 1 }">
      <router-view />
    </te-config-provider>
  </el-config-provider>
</template>
<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { TeConfigProvider } from '@tiansu/element-plus';
import { HTTP_CONFIG, HTTP_REQUEST_INTERCEPTORS } from 'web-core';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import 'dayjs/locale/zh-cn';
import teZhCn from '@tiansu/element-plus/lib/locale/lang/zh-cn';
import cryptoUtil from '@/utils/crypto';

import { FGetAuthorization, FGetQueryParam } from '@/utils/index';
import { FGetCookie } from './core/token/token';

const WEB_CORE_PROXY = '/energy-tenant-toc';

export default defineComponent({
  beforeCreate() {
    console.log('%c🚀 ~ app.vue ~ 31行', 'font-size: 18px', window.location);
    const tenantCode = cryptoUtil.Decrypt(FGetQueryParam('tenantCode') ?? '');
    const tenantId = cryptoUtil.Decrypt(FGetQueryParam('tenantId') ?? '');
    sessionStorage.setItem('TENANT_CODE', tenantCode);
    sessionStorage.setItem('TENANT_ID', tenantId);
  },
  components: {
    TeConfigProvider,
  },
  setup() {
    const locale = zhCn;

    onMounted(async () => {
      HTTP_CONFIG.proxy = WEB_CORE_PROXY;
      HTTP_REQUEST_INTERCEPTORS.add(setHeader);
      // 响应拦截器
      // HTTP_RESPONSE_INTERCEPTORS.add(setResponseInterceptors);
    });
    onUnmounted(() => {
      HTTP_REQUEST_INTERCEPTORS.clear();
    });

    async function setHeader(req: Request): Promise<Request> {
      req.headers.set('token', FGetCookie('toc-token') ?? '');
      req.headers.set('authorization', FGetAuthorization());
      req.headers.set('tenantCode', FGetQueryParam('tenantCode') ?? '');
      req.headers.set('username', FGetCookie('username') ?? '');
      req.headers.set('tocTenantId', FGetCookie('toc_tenant_id') ?? '');
      return req;
    }

    // async function setResponseInterceptors(res: Response): Promise<Response> {
    //   const temp = await res.json();
    //   console.log('-setResponseInterceptors--------------------', temp);
    //   return res;
    // }

    return { locale, teZhCn };
  },
});
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
