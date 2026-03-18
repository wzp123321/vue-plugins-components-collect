import { request } from '@/utils/request';
import { CommonResponseType, MenuItem } from '@/apis/types';
import { ButtonPermission } from './types';

/**
 * 获取菜单数据
 */
export const getMenuData = (): CommonResponseType<Array<MenuItem>> =>
  request({
    url: `/sec/basic/getMenu`,
    method: 'post',
    data: { appInstanceId: 'elderlyCare' },
  });

/**
 * 获取按钮列表
 */
export const getPageButtonList = (data: {
  menuCode: string;
}): CommonResponseType<ButtonPermission[]> =>
  request({
    url: `/sec/basic/getMenuPermissions`,
    method: 'post',
    data: {
      menuCode: data.menuCode,
      appInstanceId: 'elderlyCare',
    },
  });
/**
 * 获取当前登录用户信息
 */
export const getUserInfo = (): CommonResponseType<any> =>
  request({
    url: `/web/v1/user/getUserInfo`,
    method: 'post',
  });

/*
 * 子系统登出请求，登出之后跳转到登录界面
 */
export const logout = (): CommonResponseType<any> =>
  request({
    url: `/sec/basic/myLogout`,
    method: 'post',
  });
