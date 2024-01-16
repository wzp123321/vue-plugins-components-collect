import { defineComponent, onMounted, ref, computed, watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import Aside from '@/pages/layout/aside-box/aside-box.vue';
import NotFound from '@/pages/not-found/not-found.vue';
import { ElBadge, ElPopover, ElHeader, ElContainer, ElCheckbox, ElCheckboxGroup } from 'element-plus';

import commonService from '@/services/common.service';
import { MenuInfo, MenuRes, IHeaderAlarmVO } from '@/services/common.type';
import { MENU_PARAMS, FORBIDDEN_CODE, IFRAME_ID, URL_REFLECTION } from '@/config/config';
import {
  globalPageLink,
  FResHandler,
  linkToForbiddenPage,
  getUserInfoByTokenCheck,
  FSetSessionStorageData,
  FGetSessionStorageData,
  getCurrentDomain,
  clearCookies,
  signHttpSha256,
} from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
import { cloneDeep } from 'lodash';
// import { Access } from '@/utils/access-token/initAccess';
// import GatewayUtil from '@/utils/access-token/GatewayUtil';

const check_token_interval = !window.IS_PRODUCTION ? 60 * 10 * 1000 : 60 * 1000;

const ALARM_PATH = '/hlmsV2Front/passport/alarm/alarmIndex/';
const ALARM_SINGLE_PATH = '/hlmsV2Front/passport/alarm/currentAlarm/';

enum JUMP_TYPES {
  跳转首页 = 1,
  带参跳转 = 2,
}

enum ALARM_TYPES {
  严重 = 1,
  重要 = 2,
  次要 = 3,
  提示 = 4,
}

export default defineComponent({
  components: {
    'ems-aside': Aside,
    'ems-not-found': NotFound,
    'el-badge': ElBadge,
    ElPopover,
    ElHeader,
    ElContainer,
    ElCheckbox,
    ElCheckboxGroup,
  },
  setup() {
    const { proxy } = useCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const store = useStore();
    // 默认地址
    const defaultUrl = ref('/ems-web/home');
    // 菜单
    const menuList = ref<MenuInfo[]>([]);
    // loading
    const loading = ref(true);
    // 选中菜单
    const selectedMenu = ref<string[]>([]);
    // 选中的院区
    const selectedAreaCodeList = ref<string[]>([]);
    // 原始院区选中
    let originAreaSelectedCodes: string[] = [];
    // 展示警告
    const showWarn = ref<boolean>(false);
    const alarmInfo = ref<IHeaderAlarmVO>({
      critical: 0,
      major: 0,
      minor: 0,
      recover: 0,
      total: 0,
      warn: 0,
    });
    // popover开关
    const campusVisible = ref<boolean>(false);
    const userVisible = ref<boolean>(false);
    // 是否修改选中院区
    let isChanged = false;
    let timer: any = 0;
    // 租户信息
    const tenantVO = computed(() => {
      return store?.getters?.tenantVO ?? '';
    });
    // 租户信息
    const username = ref<string>('');
    // 院区列表
    const areaList = computed(() => {
      return store.getters.tenantVO?.usable?.length &&
        store.getters.tenantVO?.usable[0] &&
        store.getters.tenantVO?.usable[0]?.values
        ? store.getters.tenantVO?.usable[0]?.values
        : [];
    });
    /**
     * 菜单icon
     */
    const getMenuIconByOrderNum = (orderNum: number) => {
      let icons = '';
      switch (orderNum) {
        // 能耗门户
        case 1:
          icons = 'IconHome';
          break;
        // 能源分析
        case 2:
          icons = 'IconDataLine';
          break;
        // 科室考核
        case 3:
          icons = 'IconExamine';
          break;
        // 能源托管
        case 4:
          icons = 'IconHosted';
          break;
        // 节能专家
        case 5:
          icons = 'IconGreenEnergy';
          break;
        // 能源大脑
        case 6:
          icons = 'IconBrain';
          break;
        // 能源管理
        case 7:
          icons = 'IconEnergy';
          break;
        // 告警管理
        case 8:
          icons = 'IconAlarm';
          break;
        // 系统管理
        case 9:
          icons = 'IconMonitor';
          break;
        default:
          icons = 'IconHome';
          break;
      }
      return icons;
    };
    /**
     * 查询菜单列表
     * @returns
     */
    const getMenuList = async () => {
      loading.value = true;
      /**
       * 处理项目类型 菜单
       * 获取当前项目类型 拿menu 如果拿不到就去调接口
       */
      try {
        const res = await commonService.getMenuListByProjectType(MENU_PARAMS);
        if (res?.code === FORBIDDEN_CODE) {
          linkToForbiddenPage();
          return;
        }
        const result = FResHandler<MenuRes>(res);
        if (result && result?.menuList?.length) {
          const list = result?.menuList.map((item: MenuInfo) => {
            return {
              ...item,
              hasIcon: true,
              icons: getMenuIconByOrderNum(item.orderNum),
            };
          });

          // 根据路由反显页面
          const tag = window.location.pathname.match(/[^\/]+(?!.*\/)/)?.[0]?.split('?')[0] ?? '';
          let initUrl = '';
          const initMenu = (menuList: MenuInfo[]) => {
            for (let i = 0; i < menuList.length; i++) {
              if (menuList[i].url?.split('/').pop() === tag) {
                initUrl = menuList[i].url;
                return;
              }
            }
          };
          if (tag) {
            if (Array.from(URL_REFLECTION.keys()).includes(tag)) {
              initUrl = URL_REFLECTION.get(tag) ?? '';
            } else {
              initMenu(cloneDeep(result?.frontMenuListAll));
            }
          }
          defaultUrl.value = initUrl || result?.defaultUrl;
          store.dispatch('setMenuList', {
            menuList: list,
            defaultUrl: defaultUrl.value,
          });
          menuList.value = list;
        } else {
          linkToForbiddenPage();
        }
      } catch (error) {
        linkToForbiddenPage();
      } finally {
        loading.value = false;
      }
    };
    /**
     * 查询告警信息
     * @returns
     */
    const getAlarmInfo = async () => {
      if (store.getters.forbiddenReqFlag) {
        return;
      }
      // FGetSessionStorageData('ems-used-campus') ? JSON.parse(FGetSessionStorageData('ems-used-campus') as string) : []
      const params = {
        tenantId: tenantVO.value?.tenant?.tenantId,
        userId: tenantVO.value?.user?.userId,
        campusCodeList: [],
      };
      try {
        const res = await commonService.queryAlarmInfo(params);
        if (res?.code === 200 && res?.data) {
          alarmInfo.value.total = res?.data?.total ?? 0;
          alarmInfo.value.critical = res?.data?.critical ?? 0;
          alarmInfo.value.major = res?.data?.major ?? 0;
          alarmInfo.value.minor = res?.data?.minor ?? 0;
          alarmInfo.value.warn = res?.data?.warn ?? 0;
        } else {
          alarmInfo.value = {
            critical: 0,
            major: 0,
            minor: 0,
            recover: 0,
            total: 0,
            warn: 0,
          };

          if (res?.code === FORBIDDEN_CODE) {
            clearCookies();
          }
        }
      } catch (error) {
        alarmInfo.value = {
          critical: 0,
          major: 0,
          minor: 0,
          recover: 0,
          total: 0,
          warn: 0,
        };
      }
    };
    /**
     * 校验权限
     *  判断当前地址是否在菜单中
     * @returns
     */
    const checkAuthority = () => {
      try {
        const params = route.query;
        globalPageLink(defaultUrl.value, params);
      } catch (error) {
        console.log(error);
      }
    };
    /**
     * 监听iframe加载完成
     */
    const onIframeLoaded = () => {
      if (document.getElementsByTagName('iframe')[0].contentWindow?.location.pathname !== 'blank') {
        let pathname = String(document.getElementsByTagName('iframe')[0].contentWindow?.location.pathname)
          .replaceAll('/energy/ems/', '/')
          .replaceAll('/ems-container/', '/');
        // 配置页 - 选中
        if (pathname === '/ems-web/energyConservationManage') {
          pathname = '/ems-web/energyConservationAssess';
        }
        if (pathname === '/ems-web/equipmentDetailInfo') {
          pathname = '/ems-web/equipmentDetail';
        }
        if (pathname === '/ems-web/kpiQuotaConfigurations') {
          pathname = '/ems-web/kpiManagement';
        }
        if (pathname === '/ems-web/departmentAssessmentTarget') {
          pathname = '/ems-web/departmentAssess';
        }
        selectedMenu.value = [pathname];

        // 把tenantCode username隐藏
        let paramsStr = '';
        const iframeSearch = document.getElementsByTagName('iframe')[0].contentWindow?.location.search;
        if (iframeSearch?.includes('?')) {
          const searchArr = iframeSearch?.split('?') as string[];
          let queryArr = searchArr[searchArr?.length - 1]?.split('&');
          queryArr = queryArr.filter((item) => {
            return !item.includes('tenantCode') && !item.includes('username');
          });
          paramsStr = queryArr.join('&');
        }
        let path = document
          .getElementsByTagName('iframe')[0]
          .contentWindow?.location.pathname.match(/[^\/]+(?!.*\/)/)?.[0]
          ?.split('?')[0];
        router.replace('/' + path + (paramsStr !== '' ? `?${paramsStr}` : ''));
      }
    };
    /**
     * 告警跳转
     */
    const handleAlarmLinkTo = (type = JUMP_TYPES.带参跳转 | JUMP_TYPES.跳转首页, level: number) => {
      let url = '';
      const tenantCode = tenantVO.value?.tenant?.tenantCode;
      const tenantId = tenantVO.value?.tenant?.tenantId;
      if (type === JUMP_TYPES.跳转首页) {
        url = `${getCurrentDomain()}${ALARM_PATH}${tenantCode}?tenantId=${tenantId}`;
      } else if (JUMP_TYPES.带参跳转) {
        url = `${getCurrentDomain()}${ALARM_SINGLE_PATH}${tenantCode}?level=${String(level)}&tenantId=${tenantId}`;
      }
      window.open(url);
    };
    /**
     * 切换院区
     * @param value 选中的院区
     */
    const handleAreaChange = (value: string[]) => {
      if (value?.length > 1) {
        showWarn.value = false;
      }
    };
    /**
     * 关闭popover
     */
    const handlePopoverClose = () => {
      campusVisible.value = false;
      userVisible.value = false;
    };
    /**
     * 院区弹出层隐藏
     */
    const handleAreaPopoverHide = async () => {
      if (selectedAreaCodeList.value?.length >= 1 && isChanged) {
        try {
          const tenantId = FGetSessionStorageData('energy-corpid') as string;
          const userId = store?.getters?.tenantVO?.user?.userId;
          const params = {
            code: selectedAreaCodeList.value.join(','),
            tenantId,
            userId,
          };
          const res = await commonService.getSelectedCampusCodesUpdate(params);
          if (res?.code === 200) {
            originAreaSelectedCodes = selectedAreaCodeList.value;
            let pathname = String(document.getElementsByTagName('iframe')[0].contentWindow?.location.pathname)
              .replaceAll('/energy/ems/', '/')
              .replaceAll('/ems-container/', '/');
            globalPageLink(pathname, route.query);
          } else {
            selectedAreaCodeList.value = originAreaSelectedCodes;
          }
        } catch (error) {
          selectedAreaCodeList.value = originAreaSelectedCodes;
        } finally {
          const wholeHospitalFlag = selectedAreaCodeList.value?.length === areaList.value?.length;
          FSetSessionStorageData('ems-wholeHospitalFlag', String(wholeHospitalFlag));
          FSetSessionStorageData('ems-used-campus', JSON.stringify(selectedAreaCodeList.value));

          isChanged = false;
          showWarn.value = false;
        }
      }
    };
    /**
     * 设置定时器校验token
     */
    const handleCheckTokenInterval = () => {
      timer = setInterval(async () => {
        try {
          const params = {
            tenantCode: Number(FGetSessionStorageData('energy-corpid')),
            token: FGetSessionStorageData('energy-token') as string,
          };
          const res = await commonService.getTokenCheck(params);
          console.log(res);
          if (res?.code === FORBIDDEN_CODE) {
            clearInterval(timer);
            clearCookies();
          } else if (res?.code !== 200) {
            console.log(res);
          }
        } catch (error) {
          console.warn('keepAlive----------------error------', error);
        }
      }, check_token_interval);
    };
    /**
     * 退出登录
     */
    const handleLogOut = async () => {
      try {
        const params = {
          tenantId: Number(FGetSessionStorageData('energy-corpid')),
          tenantCode: FGetSessionStorageData('energy-corpid') as string,
          token: FGetSessionStorageData('energy-token') as string,
        };
        const res = await commonService.logOut(params);
        if (res && res?.code === 200) {
          // GatewayUtil.removeShareStorage();
          // GatewayUtil.removeAccessTokenStorage();
          window.location.href = res?.data;
          clearCookies();
        }
      } catch (error) {
        console.warn('logout-error=-================', error);
      }
    };
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
        loading.value = false;
        sessionStorage.setItem('dTimeValue', '');
      }
    };
    /**
     * 监听选中变化 处理至少勾选一条
     */
    watch(
      () => selectedAreaCodeList.value,
      (newVal, oldVal) => {
        if (newVal?.length === 0) {
          showWarn.value = true;
        }

        if (newVal?.length === 0) {
          setTimeout(() => {
            selectedAreaCodeList.value = oldVal;
          }, 200);
        }

        isChanged = !(
          selectedAreaCodeList.value?.length === originAreaSelectedCodes?.length &&
          originAreaSelectedCodes.every((item) => {
            return selectedAreaCodeList.value?.includes(item);
          })
        );
      },
    );
    /**
     * 初始化
     */
    onMounted(async () => {
      // 获取access_token
      // Access.init()
      //   .then(async (res: any) => {
      // if (res) {
      try {
        // 地址栏如果有token或已存储token
        // if (route.query?.token || FGetSessionStorageData('energy-token')) {
        if (route.query?.token) {
          FSetSessionStorageData('energy-token', route?.query?.token as string);
        }
        if (route.query?.corpid) {
          FSetSessionStorageData('energy-corpid', route?.query?.corpid as string);
        }
        if (route.query?.showtype) {
          FSetSessionStorageData('energy-showtype', route?.query?.showtype as string);
        }
        if (route?.query?.loginName) {
          FSetSessionStorageData('ems-username', route?.query?.loginName as string);
          FSetSessionStorageData('energy-loginName', route?.query?.loginName as string);
        }
        if (route?.query?.tenantCode) {
          FSetSessionStorageData('ems-wholeHospitalFlag', 'true');
          FSetSessionStorageData('energy-corpid', route?.query?.tenantCode as string);
        }

        if (route.query?.ts_sign) {
          FSetSessionStorageData('energy-ts_sign', route?.query?.ts_sign ? (route?.query?.ts_sign as string) : '');
          // let myUrl = window.location.pathname.substring(1) + '?';
          let myUrl = window.location.pathname.slice(1, 26) + '?';
          Object.keys(route.query)
            .sort()
            .forEach((item) => {
              if (item !== 'ts_sign' && item !== 'appName' && item !== 'deviceId') {
                myUrl += item + '=' + route.query[item] + '&';
              }
            });

          if (route.query.ts_sign !== signHttpSha256('GET', myUrl, '')) {
            console.log('url验参错误', route.query.ts_sign, signHttpSha256('GET', myUrl, ''), myUrl);
            loading.value = false;
            linkToForbiddenPage();
            return;
          }
        }
        loading.value = true;
        await querySystemTime();
        if (Object.keys(store?.getters?.tenantVO)?.length === 0) {
          const flag = await getUserInfoByTokenCheck();
          if (!flag) {
            loading.value = false;
            return;
          }
          selectedAreaCodeList.value =
            store.getters.tenantVO?.used?.length &&
            store.getters.tenantVO?.used[0] &&
            store.getters.tenantVO?.used[0]?.code
              ? store.getters.tenantVO?.used[0]?.code.split(',')
              : [];
          // 按照院区列表过滤一次选中节点数组
          const codes = areaList.value?.map((item: any) => {
            return item?.code;
          });
          selectedAreaCodeList.value = selectedAreaCodeList.value.filter((item) => {
            return codes?.includes(item);
          });

          originAreaSelectedCodes = selectedAreaCodeList.value;
          const wholeHospitalFlag = selectedAreaCodeList.value?.length === areaList.value?.length;
          FSetSessionStorageData('ems-wholeHospitalFlag', String(wholeHospitalFlag));
          FSetSessionStorageData('ems-used-campus', JSON.stringify(selectedAreaCodeList.value));

          // 查询顶部告警信息
          getAlarmInfo();
          await getMenuList();

          checkAuthority();
          handleCheckTokenInterval();
        }
        // } else {
        //   if (route?.query?.loginName) {
        //     FSetSessionStorageData('ems-username', route?.query?.loginName as string);
        //     FSetSessionStorageData('energy-loginName', route?.query?.loginName as string);
        //   }
        //   if (route?.query?.tenantCode) {
        //     FSetSessionStorageData('energy-corpid', route?.query?.tenantCode as string);
        //   }

        //   FSetSessionStorageData('ems-wholeHospitalFlag', 'true');

        //   await getMenuList();

        //   checkAuthority();
        // }

        username.value = decodeURIComponent(FGetSessionStorageData('ems-username') as string);
      } catch (error) {
        loading.value = false;
      }
      //   } else {
      //     loading.value = false;
      //   }
      // })
      // .catch((error) => {
      //   loading.value = false;
      //   ElMessage({
      //     type: 'error',
      //     message: error,
      //   });
      // });
    });

    onUnmounted(() => {
      clearInterval(timer);
    });

    return {
      selectedMenu,
      IFRAME_ID,
      menuList,
      loading,
      tenantVO,
      areaList,
      selectedAreaCodeList,
      showWarn,
      isChanged,
      campusVisible,
      userVisible,
      username,
      JUMP_TYPES,
      ALARM_TYPES,
      alarmInfo,

      handlePopoverClose,
      onIframeLoaded,
      handleAreaChange,
      handleAreaPopoverHide,
      handleLogOut,
      handleAlarmLinkTo,
    };
  },
});
