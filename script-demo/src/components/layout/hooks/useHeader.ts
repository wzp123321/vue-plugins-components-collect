import { reactive, Component, markRaw, computed, Ref } from 'vue';
import { getUserInfo, logout } from '../api';
import { IconSwitchButton } from '@arco-iconbox/vue-te';
import { useCommonStore } from '@/store/common';
import { useUserStore } from '@/store/user';
import { SUCCESS_CODE } from '@/constant';
import { isEmpty } from 'lodash-es';
import { TeLayoutOne } from '@tiansu/ts-web-package';
import { TeMessage } from '@tiansu/element-plus';

interface configType {
  type: string;
  title: string;
  icon: Component;
}

const useHeader = (layoutOneRef: Ref<InstanceType<typeof TeLayoutOne>>) => {
  /**
   * 操作数据
   */
  const data = reactive({
    userinfoConfig: {
      nickname: '',
      avatar: '',
      configList: [
        {
          type: 'logout',
          title: '退出登录',
          icon: markRaw(IconSwitchButton),
        },
      ],
    },
    tenantLogo: '',
    platformName: '',
  });

  const userStore = useUserStore();
  const commonStore = useCommonStore();
  const isShowContent = computed(() => !isEmpty(commonStore.selectRegion));
  /**
   * 获取用户信息
   */
  const getUser = async () => {
    try {
      const res = await getUserInfo();
      if (res && res.errcode === SUCCESS_CODE && res.data) {
        userStore.setUserState(res.data.user);
        userStore.setTenantState(res.data.tenant);
        data.userinfoConfig.nickname = res.data.user.name;
        data.userinfoConfig.avatar = res.data.user.picUrl;
        data.platformName = res.data.tenant.platformName;
        data.tenantLogo = res.data.tenant.navigationLogo;
      }
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * 院区选择变化
   * @param hospitalList
   */
  const handleProjectChange = async (values: []) => {
    try {
      if (values.length > 0 && isShowContent.value) {
        layoutOneRef.value.refresh();
      }
    } catch (error) {
      console.log(error);
    } finally {
      console.log(11);
    }
  };
  /**
   * 退出登录
   */
  const loginout = async () => {
    try {
      const res = await logout();
      if (res.errcode === SUCCESS_CODE) {
        window.location.href = res.data;
        localStorage.clear();
      } else {
        TeMessage.warning(res.errmsg ?? '退出失败');
      }
    } catch (error) {
      TeMessage.warning((error as Error).message ?? '退出失败');
    }
  };
  /**
   * 点击下拉
   * @param item
   */
  const menuChanged = (item: configType) => {
    if (item.type === 'logout') {
      loginout();
    }
  };
  return {
    data,
    menuChanged,
    handleProjectChange,
    getUser,
    layoutOneRef,
    isShowContent,
  };
};
export default useHeader;
