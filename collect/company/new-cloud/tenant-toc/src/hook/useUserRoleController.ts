import { ref } from 'vue';
import { FResHandler } from '@/pages/management-analysis/ma-home/services';
import { Common_IUserRoleVO } from '@/service/api';
import commonService from '@/service/pkg/index';
import { Common_EUserRole } from '@/config/enum';

export const useUserRoleController = () => {
  // 是否有财务专家权限
  const isFinancialExpert = ref<boolean>(false);
  /**
   * 判断用户是否是财务专家
   */
  const checkIsFinancialExpert = async () => {
    try {
      const res = await commonService.checkIsFinancialExpert();
      isFinancialExpert.value = res ?? false;
    } catch (error) {
      isFinancialExpert.value = false;
    }
  };
  // 角色列表·
  const ruleList = ref<Common_IUserRoleVO[]>([]);
  /**
   * 查询用户角色
   */
  const queryUserRole = async () => {
    try {
      const res = await commonService.queryUserSelfRoleList();
      const result = FResHandler<Common_IUserRoleVO[]>(res);
      ruleList.value = result ?? [];
    } catch (error) {
      ruleList.value = [];
    }
  };
  /**
   * 判断用户是否是财务
   * @returns
   */
  const mapUserIsFinancialExperts = () => {
    return (
      ruleList.value.length > 0 &&
      ruleList.value.findIndex((item) => item.roleCode === Common_EUserRole.财务专家) !== -1
    );
  };
  /**
   * 判断用户是否是运营专家
   * @returns
   */
  const mapUserIsOperatorExperts = () => {
    return (
      ruleList.value.length > 0 &&
      ruleList.value.findIndex((item) => item.roleCode === Common_EUserRole.运营专家) !== -1
    );
  };

  return {
    ruleList,
    isFinancialExpert,
    checkIsFinancialExpert,
    queryUserRole,
    mapUserIsFinancialExperts,
    mapUserIsOperatorExperts,
  };
};
