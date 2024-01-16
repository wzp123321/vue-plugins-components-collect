import {
  FSetSessionStorageData,
  getUserInfoByTokenCheck,
  linkToForbiddenPage,
  FGetSessionStorageData,
  clearCookies,
  signHttpSha256,
} from '@/utils/token';
import { defineComponent, ref, onMounted, provide } from 'vue';
// components
import HeaderBox from '../header-box/header-box.vue';
import AsideBox from '../aside-box/aside-box.vue';
import ContentBox from '../content-box/content-box.vue';
import { ElMessageBox } from 'element-plus';
// utils
import { useRoute, useRouter } from 'vue-router';
import message from '@/utils/message';
import { useStore } from 'vuex';
// service
import commonService from '@/services/common/common';
// import { Access } from '../../utils/access-token/initAccess';

// config
import { MENU_TYPE } from '@/config/enum';
import { FORBIDDEN_CODE } from '../../config/index';
import { getMenuIcon } from '@/config/index';

const checktoken_interval = import.meta.env.VITE_NODE_ENV !== 'production' ? 60 * 10 * 1000 : 60 * 1000;

export default defineComponent({
  name: 'Home',
  components: {
    HeaderBox,
    AsideBox,
    ContentBox,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    // 默认地址
    const defaultUrl = ref('/pageDiy');
    // 菜单
    const menuList = ref<GlobalModule.MenuInfo[]>([]);
    const loading = ref(true);
    const is_error = ref(false);
    let timer: any = null;

    const routerKey = ref<number>(0);

    provide('refreshRouterkey', () => {
      routerKey.value = new Date().getTime() + Math.random() * 100000;
      console.warn('刷新路由key---------------', routerKey.value);
    });

    // 请求菜单
    const queryMenu = async () => {
      try {
        loading.value = true;
        const res = await commonService.getMenuListByProjectType(MENU_TYPE);
        if (res?.code === FORBIDDEN_CODE) {
          linkToForbiddenPage();
          return;
        }

        is_error.value = false;
        if (res && res.code === 200 && res.data && res.data.menuList?.length) {
          let list = res.data.menuList;
          defaultUrl.value = res.data.defaultUrl || '/pageDiy';
          list = list.map((item) => {
            const icon = getMenuIcon(item.orderNum);
            return {
              ...item,
              icon,
            };
          });
          menuList.value = list;
          store.dispatch('setMenuList', {
            menuList: res.data,
            defaultUrl: defaultUrl.value,
          });
          loading.value = false;
          is_error.value = false;
        } else {
          loading.value = false;
          linkToForbiddenPage();
          is_error.value = true;
        }
      } catch (error) {
        loading.value = false;
        is_error.value = true;
        linkToForbiddenPage();
      }
    };

    /**
     * 设置定时器校验token
     */
    const handleCheckTokenInterval = () => {
      timer = setInterval(async () => {
        try {
          const params = {
            tenantCode: FGetSessionStorageData('energy-corpid') as string,
            tenantId: Number(FGetSessionStorageData('energy-corpid')),
            token: FGetSessionStorageData('energy-token') as string,
          };
          if (store?.getters?.forbiddenReqFlag) {
            clearInterval(timer);
            return;
          }
          const res = await commonService.getTokenCheck(params);
          if (res?.code === FORBIDDEN_CODE) {
            clearInterval(timer);
            clearCookies();
            if (store?.getters?.forbiddenReqFlag) {
              return;
            }
            store.dispatch('setForbiddenReqFlag', true);

            ElMessageBox.alert('登录信息已失效，请重新登录', '', {
              confirmButtonText: '确认',
              showClose: false,
              showCancelButton: false,
              type: 'warning',
            })
              .then(() => {
                window.location.href = res?.message ?? store?.getters?.tenantVO?.tenant?.loginUrl;
              })
              .catch(() => {
                console.warn('cancel');
              });
          } else if (res?.code !== 200) {
            clearInterval(timer);
            clearCookies();
            if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
              message.error(res?.message ?? '服务异常');
            }
          }
        } catch (error) {
          clearInterval(timer);
          clearCookies();
          console.warn('error-----------', error);
        }
      }, checktoken_interval);
    };

    /**
     * 判断有没有拿到assess_token
     * 初始化 判断菜单是否查询
     * 如果没有具体页面 跳转至第一个菜单的地址
     */
    onMounted(async () => {
      // const assessRes = await Access.init();

      // if (!assessRes) {
      //   loading.value = false;
      //   // linkToForbiddenPage();
      //   return;
      // }

      // 地址栏如果有token或已存储token
      if (route.query?.token) {
        clearCookies();
      }
      if (route.query?.token) {
        FSetSessionStorageData('energy-token', route?.query?.token as string);
      }
      if (route.query?.corpid) {
        FSetSessionStorageData('energy-corpid', route?.query?.corpid as string);
      }
      if (route.query?.showtype) {
        FSetSessionStorageData('energy-showtype', route?.query?.showtype as string);
      }
      if (route.query?.ts_sign) {
        FSetSessionStorageData('energy-ts_sign', route?.query?.ts_sign as string);
      }
      if (route?.query?.loginName) {
        FSetSessionStorageData('ems-username', route?.query?.loginName as string);
        FSetSessionStorageData('energy-loginName', route?.query?.loginName as string);
      }
      if (route?.query?.tenantCode) {
        FSetSessionStorageData('energy-corpid', route?.query?.tenantCode as string);
      }

      // 只有从平台跳转的地址，才会验签------如果有ts_sign就进行验签
      // if (route.query?.ts_sign) {
      //   let myUrl = window.location.pathname.substring(1) + '?';
      //   Object.keys(route.query)
      //     .sort()
      //     .forEach((item) => {
      //       if (item !== 'ts_sign') {
      //         myUrl += item + '=' + route.query[item] + '&';
      //       }
      //     });
      //   console.log(myUrl, signHttpSha256('GET', myUrl, ''));
      //   if (route.query.ts_sign !== signHttpSha256('GET', myUrl, '')) {
      //     console.log('url验参错误');
      //     loading.value = false;
      //     return;
      //   }
      // }
      if (Object.keys(store?.getters?.tenantVO)?.length === 0) {
        const flag = await getUserInfoByTokenCheck();
        if (!flag) {
          loading.value = false;
          return;
        }
        // 取消参数隐藏
        // const ignoreKeys = ['token', 'corpid', 'showtype', 'loginName', 'tenantCode'];
        // let query = {};
        // Object.entries(route.query).forEach(([k, v]) => {
        //   if (!ignoreKeys.includes(k)) {
        //     query = {
        //       ...query,
        //       [k]: v,
        //     };
        //   }
        // });
        // router.replace({
        //   path: route.path,
        //   query,
        // });
      }
      await queryMenu();
      router.push({
        path: route.path === '/' || route.path === '/energy/ems/ems-admin' ? defaultUrl.value : route.path,
        query: route.query,
      });

      handleCheckTokenInterval();
    });

    return { routerKey, menuList, loading, is_error };
  },
});
