<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useStore } from 'vuex';
// 枚举
import { Common_EBridgeType, Common_ELoadPlatform } from './config/enum';
// 工具方法
import nativeBridge from './core/nativeBridge';
import { FGetQueryParam, mapSystemInfo } from './utils';
import { FSetStorageData } from './utils/storage';
import {
  SESSION_KEY_LOGIN_NAME,
  SESSION_KEY_TOKEN,
  SESSION_KEY_TENANT_CODE,
  SESSION_KEY_STATUS_HEIGHT,
  SESSION_KEY_USER_NAME,
  SESSION_KEY_USER_ID,
  SESSION_KEY_LOAD_PLAT,
} from './config/session-key';
// 工具方法

/**
 * 初始化，获取基础配置信息
 */
const getBasicConfiguration = () => {
  return new Promise((resolve) => {
    nativeBridge.nativeCall(
      Common_EBridgeType.获取配置信息,
      {},
      async (result) => {
        const res = JSON.parse(result as string);
        console.log(res.name, res.statusbarHeight);
        FSetStorageData(SESSION_KEY_TOKEN, res?.token);
        FSetStorageData(SESSION_KEY_TENANT_CODE, res.tenantId);
        FSetStorageData(SESSION_KEY_USER_ID, res.userId);
        FSetStorageData(SESSION_KEY_USER_NAME, res.name);
        FSetStorageData(SESSION_KEY_STATUS_HEIGHT, res.statusbarHeight);
        FSetStorageData(SESSION_KEY_LOAD_PLAT, Common_ELoadPlatform.APP);

        const rootElement: Element | null = document.querySelector(':root');
        if (!rootElement) {
          return;
        }
        (rootElement as any).style.setProperty('--common-app-status-height', `${res.statusbarHeight}px`);

        if (res.loginInfo) {
          const loginInfo = JSON.parse(res.loginInfo);
          FSetStorageData(SESSION_KEY_LOGIN_NAME, loginInfo?.resultBody?.loginName);
          console.log('%c✨✨获取配置信息✨✨', 'font-size: 24px', loginInfo?.resultBody?.loginName);
        }
        // 加载成功
        nativeBridge.nativeCall(Common_EBridgeType.加载成功, {}, () => {});

        resolve(true);
        console.log(
          '%c✨✨获取配置信息✨✨',
          'font-size: 24px',
          new Date().getTime(),
          res.statusbarHeight,
          res.token,
          res.tenantId,
          res.userId,
          res.name,
        );
      },
      () => {
        // 调用失败，关闭loading
        nativeBridge.nativeCall(Common_EBridgeType.加载成功, {}, () => {});
      },
    );
  });
};

// store
const store = useStore();
/**
 * 企业微信平台--初始化用户信息
 */
const initWxWorkH5 = () => {
  FSetStorageData(SESSION_KEY_TOKEN, FGetQueryParam('token'));
  FSetStorageData(SESSION_KEY_TENANT_CODE, FGetQueryParam('tenantId'));
  FSetStorageData(SESSION_KEY_USER_ID, FGetQueryParam('userid'));
  FSetStorageData(SESSION_KEY_USER_NAME, '');
  FSetStorageData(SESSION_KEY_STATUS_HEIGHT, '0');
  FSetStorageData(SESSION_KEY_LOGIN_NAME, FGetQueryParam('loginName'));
  FSetStorageData(SESSION_KEY_LOAD_PLAT, Common_ELoadPlatform.企业微信);

  const rootElement: Element | null = document.querySelector(':root');
  if (!rootElement) {
    return;
  }
  (rootElement as any).style.setProperty('--common-app-status-height', '0px');
};
/**
 * 初始化获取用户信息
 */
onLaunch(async () => {
  if (!!FGetQueryParam('plat') && Common_ELoadPlatform.企业微信 === FGetQueryParam('plat')) {
    initWxWorkH5();
  } else {
    await getBasicConfiguration();

    /**
     * 物理键返回监听事件
     */
    nativeBridge.registerHandler('goBack', () => {
      console.log('%c✨✨物理键返回监听事件✨✨', 'font-size: 24px');
      nativeBridge.nativeCall(Common_EBridgeType.返回上一层, { pageHome: 1 }, () => {});
    });
  }

  store.dispatch('setSystemInfo', mapSystemInfo());
});
</script>
<style>
.uni-page-body {
  height: 100%;
}
</style>
