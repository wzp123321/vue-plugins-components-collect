/*
 * @Description: aside-item
 * @Autor: zpwan
 * @Date: 2022-04-06 13:50:16
 * @LastEditors: zpwan
 * @LastEditTime: 2022-05-06 17:16:28
 */
import { defineComponent, computed, PropType, inject } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'AsideMenuItem',
  props: {
    dataSource: {
      type: Array as PropType<GeneralModule.MenuInfo[]>,
      default: [],
    },
    selectedMenu: {
      type: Array as PropType<string[]>,
      default: [],
    },
    openKeys: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  emits: ['clearOpenKeys', 'addOpenKeys'],
  inject: ['refreshRouterKey'],
  setup(props, ctx) {
    const route = useRoute();
    const router = useRouter();
    const menus = computed(() => {
      return props.dataSource;
    });

    const refreshRouterKey: any = inject('refreshRouterKey');

    const onRouterTo = (url: string) => {
      router.push({
        path: url,
      });
      // 编辑页跳列表页 不用重置
      if (route.path !== '/home/projectManage/editor' && route.path === url) {
        refreshRouterKey();
      }
    };
    const titleClick = (key: any, e: any) => {
      ctx.emit('clearOpenKeys', e);
    };
    const downMenu = (val: string) => {
      setTimeout(() => {
        if (props.openKeys.length === 0) {
          ctx.emit('addOpenKeys', [val]);
        } else {
          ctx.emit('addOpenKeys', []);
        }
      });
    };
    const transformDeg = () => {
      if (props.openKeys.length === 0) {
        return 'transform: rotate(0deg)';
      } else {
        return 'transform: rotate(-180deg)';
      }
    };
    const mapIcon = (val: any) => {
      let pageSideIcon;
      let pageSideIconSelected;
      let selectName;
      switch (val.id) {
        case 12:
          pageSideIcon = require('@/assets/images/home/home-knowledage.svg');
          pageSideIconSelected = require('@/assets/images/home/home-knowledage-hover.svg');
          break;
        case 11:
          pageSideIcon = require('@/assets/images/home/home-projectManage.svg');
          pageSideIconSelected = require('@/assets/images/home/home-projectManage-hover.svg');
          break;
        case 52:
          pageSideIcon = require('@/assets/images/home/home-energy-project-library.svg');
          pageSideIconSelected = require('@/assets/images/home/home-energy-project-library-hover.svg');
          break;
        case 30:
          pageSideIcon = require('@/assets/images/home/home-projectInfoConfig.svg');
          pageSideIconSelected = require('@/assets/images/home/home-projectInfoConfig-hover.svg');
        case 39:
          pageSideIcon = require('@/assets/images/home/home-log-management.svg');
          pageSideIconSelected = require('@/assets/images/home/home-log-management-hover.svg');
          break;
        case 38:
          pageSideIcon = require('@/assets/images/home/home-cost-detail.svg');
          pageSideIconSelected = require('@/assets/images/home/home-cost-detail-hover.svg');
          break;
      }
      if (val.childMenu.length !== 0) {
        const index = val.childMenu.findIndex((item: any) => {
          return item.url === props.selectedMenu[0];
        });
        if (index !== -1) {
          selectName = val.name;
        }
      }
      if (selectName || val.url === props.selectedMenu[0]) {
        return pageSideIconSelected;
      } else {
        return pageSideIcon;
      }
    };

    return {
      menus,
      onRouterTo,
      mapIcon,
      titleClick,
      downMenu,
      transformDeg,
    };
  },
});
