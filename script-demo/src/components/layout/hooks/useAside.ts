import { ref, reactive, toRefs } from 'vue';
import { getMenuData, getPageButtonList } from '../api';
import { type Router } from 'vue-router';
import { LayoutAsideType } from '../api/types';
import { SUCCESS_CODE } from '@/constant';
import { useCommonStore } from '@/store/common';
import { MenuItem, TreeNode } from '@/apis/types';
import {
  IconJiedaiguanli,
  IconJiankangdangan,
  IconHetongguanli,
  IconJuzhuguanli,
  IconHuliguanli,
  IconCaiwuguanli,
  IconXitongpeizhi,
} from '@arco-iconbox/vue-te';

const useAside = (router: Router) => {
  const menuList = ref<Array<TreeNode<MenuItem>>>([]);
  const isSpread = ref(false);
  const commonStore = useCommonStore();
  const iconList = [
    IconJiedaiguanli,
    IconJiankangdangan,
    IconHetongguanli,
    IconJuzhuguanli,
    IconHuliguanli,
    IconCaiwuguanli,
    IconXitongpeizhi,
  ];
  /**
   * 当前组件数据
   */
  const data = reactive<LayoutAsideType>({
    menuArray: [],
    isSpread: isSpread.value ? isSpread.value : false,
  });

  /**
   * 获取菜单接口中第一个有url地址的菜单
   * @param list
   */
  const getFirstValidMenu = (
    list: Array<TreeNode<MenuItem>>,
  ): MenuItem | undefined => {
    for (let index = 0; index < list.length; index++) {
      const ele = list[index];
      if (ele?.path) {
        return ele;
      }
      if (!ele?.path && ele.children) {
        return getFirstValidMenu(ele.children);
      }
    }
    return undefined;
  };
  /**
   *  查询指定菜单下的按钮权限
   */
  const getButtonAuthority = async (param: { menuCode: string }) => {
    try {
      const res = await getPageButtonList(param);
      if (res.errcode === SUCCESS_CODE) {
        commonStore.menuButtonPermissions = res.data;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMenuDataForAside = async () => {
    if (menuList.value && menuList.value.length > 0) {
      if (!commonStore.initMenuName) {
        const firstMenu = getFirstValidMenu(menuList.value);
        if (firstMenu) {
          data.defaultActive = firstMenu?.name;
          commonStore.initMenuName = firstMenu?.name;
          router.push({ name: data.defaultActive });
        }
      }
    } else {
      data.defaultActive = '';
      commonStore.initMenuName = '';
    }
  };

  const getMenus = async () => {
    try {
      const res = await getMenuData();
      const menus = res?.data ?? [];
      menuList.value = menus;
      commonStore.menuList = menus;
      getMenuDataForAside();
    } catch (error) {
      console.log(error);
      menuList.value = [];
      commonStore.menuList = [];
      return Promise.reject();
    }
    return commonStore.menuList;
  };
  // 初始化数据
  const initLayoutData = async () => {
    try {
      menuList.value = commonStore.menuList;
      await getMenus();
      getMenuDataForAside();
    } catch (error) {
      console.log(error);
      menuList.value = [];
      commonStore.menuList = [];
    }
  };
  /**
   * 是否有菜单权限
   */
  const findPath = (
    arr: Array<TreeNode<MenuItem>>,
    targetPath: string,
  ): boolean => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].path === targetPath) {
        return true;
      }
      if (arr[i] && arr[i].children) {
        if (findPath(arr[i]?.children ?? [], targetPath)) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * 选中的菜单
   * @param val
   */
  const selectMenu = async (val: MenuItem) => {
    if (val.path) {
      const isAuthority = findPath(menuList.value, val.path);
      // 有权限
      if (isAuthority) {
        router.push(val.path);
        data.defaultActive = val.name;
        commonStore.initMenuName = val.name;
        commonStore.isAuthorityMenu = '';
      } else {
        data.defaultActive = '';
        // 没有权限的菜单
        commonStore.isAuthorityMenu = val.name;
      }
    }
  };
  /**
   * 展开收起
   * @param val ： true? false
   */
  const isSpreadChange = (val: boolean) => {
    isSpread.value = val;
  };

  return {
    ...toRefs(data),
    menuList,
    selectMenu,
    isSpreadChange,
    isSpread,
    iconList,
    getMenus,
    getButtonAuthority,
    initLayoutData,
  };
};
export default useAside;
