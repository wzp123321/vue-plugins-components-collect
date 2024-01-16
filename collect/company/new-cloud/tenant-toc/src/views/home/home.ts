import { defineComponent, ref, onMounted, provide, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { MENU_TYPE } from '@/config/enum';
import { FORBIDDEN_CODES } from '../../config/index';

import commonService from '@/service/pkg/index';

import TenantHeader from '@/views/layouts/page-header/page-header.vue';
import TenantAside from '@/views/layouts/page-aside/page-aside.vue';
import { FGetCookie } from '@/core/token';
import { postRequest } from '@/service/request';
import { ECommonPath } from '@/service/path';

const KEEP_ALIVE_INTERVAL = !window.IS_PRODUCTION ? 60 * 10 * 1000 : 60 * 1000;

export default defineComponent({
  components: {
    TenantHeader,
    TenantAside,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    // 菜单
    const menuList = ref<GeneralModule.MenuInfo[]>([]);
    // 是否含有菜单
    const hasMenuFlag = ref<boolean>(true);
    const routerKey = ref<number>(0);

    let timer: any = 0;

    provide('refreshRouterKey', () => {
      routerKey.value = new Date().getTime() + Math.random() * 1000;
    });
    // 查询菜单
    const queryMenuList = async () => {
      try {
        const type = route.query.type ?? MENU_TYPE.DEFAULT;
        const res = await commonService.queryMenu(String(type));
        if (res && res.code === 200 && res.data?.length) {
          menuList.value =
            res.data.map((item) => {
              return {
                ...item,
                hasIcon: true,
              };
            }) ?? [];
          hasMenuFlag.value = true;
          if (route.path === '/' || route.path === '/home') {
            router.push(res.data[0].url);
          }
        } else {
          hasMenuFlag.value = false;
        }
      } catch (error) {
        hasMenuFlag.value = false;
      }
    };

    // 计算服务器时间与本地时间的差值，并存入本地
    const querySystemTime = async () => {
      try {
        const serverTime = await commonService.getServerTime();
        if (serverTime.code === 200 && serverTime.data) {
          const dTimeValue = String(new Date(serverTime.data).getTime() - new Date().getTime());
          sessionStorage.setItem('dTimeValue', dTimeValue);
        } else {
          sessionStorage.setItem('dTimeValue', '');
        }
      } catch (error) {
        sessionStorage.setItem('dTimeValue', '');
      }
    };
    // querySystemTime();
    /**
     * 设置定时器校验token
     */
    const handleCheckTokenInterval = () => {
      timer = setInterval(async () => {
        try {
          const params = {
            token: FGetCookie('toc-token'),
          };
          const res = await postRequest(ECommonPath.保活, params);
          if (FORBIDDEN_CODES?.includes(res?.code)) {
            clearInterval(timer);
          }
        } catch (error) {
          console.warn('keepAlive----------------error------', error);
        }
      }, KEEP_ALIVE_INTERVAL);
    };

    onMounted(async () => {
      handleCheckTokenInterval();
      if (menuList.value?.length === 0) {
        await queryMenuList();
      }
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    return {
      menuList,
      hasMenuFlag,
      routerKey,
    };
  },
});
