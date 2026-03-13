import { defineStore } from 'pinia';
import { getPlatformTenant } from '@/utils/storage';
import { computed, ref } from 'vue';

interface TenantInfo {
  platformName: string;
  loginLogo: string;
  loginBackground: string;
  navigationLogo: string;
  navigationName: string;
  tenantCode: string;
  tenantId: string;
}
interface UserInfo {
  userId: string;
  name: string;
  picUrl: string;
  token: string | null;
}

export const useUserStore = defineStore('user', () => {
  const { tenantCode, tenantId } = getPlatformTenant() as unknown as {
    tenantId: string;
    tenantCode: string;
  };
  const userInfo = ref<UserInfo>({
    userId: '',
    name: '',
    picUrl: '',
    token: '',
  });
  const tenantInfo = ref<TenantInfo>({
    platformName: '',
    loginLogo: '',
    loginBackground: '',
    navigationLogo: '',
    navigationName: '',
    tenantCode,
    tenantId,
  });
  // 设置user state
  const setUserState = (info: UserInfo) => {
    Object.assign(userInfo.value, info);
  };
  // 设置tenant state
  const setTenantState = (tenant: TenantInfo) => {
    tenantInfo.value = tenant;
  };
  const loginUrl = computed(
    () =>
      `${window.origin}/web/hlmsPortal/login/${tenantInfo.value.tenantCode}`,
  );
  return {
    userInfo,
    tenantInfo,
    loginUrl,
    setUserState,
    setTenantState,
  };
});
