import { defineStore } from 'pinia';
import { MenuItem, TreeNode } from '@/apis/types';
import { ProjectType } from '@/apis/common/index.api';
import { ButtonPermission } from '@/components/layout/api/types';

export const useCommonStore = defineStore('common', {
  state: () => ({
    cancelTokenArr: [] as any,
    menuButtonPermissions: [] as ButtonPermission[],
    isAuthorityMenu: '',
    initMenuName: '',
    menuList: [] as Array<TreeNode<MenuItem>>,
    selectRegion: [] as Array<ProjectType>,
    areaList: [],
  }),
  persist: {
    key: `${import.meta.env.VITE_APP_ID}-common`,
    paths: [
      'cancelTokenArr',
      'menuButtonPermissions',
      'isAuthorityMenu',
      'initMenuName',
      'menuList',
    ],
    storage: localStorage,
  },
});
