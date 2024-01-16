import { PropType, onMounted, watch } from 'vue';
import { defineComponent, computed, ref } from 'vue';
// components
import AsideMenuItem from '../aside-menu-item/aside-menu-item.vue';
import { useRoute } from 'vue-router';
import { getCurrentDomain } from '@/utils/index';
import { jointSkipParams } from '@/utils/token';

import { webPrefixUrl } from '@/config/index';

export default defineComponent({
  name: 'Aside',
  components: {
    AsideMenuItem,
  },
  props: {
    allowCollapse: {
      type: Boolean,
      default: false,
    },
    menuList: {
      type: Array as PropType<GlobalModule.MenuInfo[]>,
      default: [],
    },
  },
  setup(props) {
    const route = useRoute();
    // 是否支持收起
    const allowCollapse = computed(() => {
      return props.allowCollapse;
    });
    const isCollapse = ref(false); // 菜单是否收起
    // 当前选中的菜单
    const selectedMenu = ref<string[]>([route.path]);
    // 鼠标进入菜单状态 0-未进入  1-进入菜单  2-进入子菜单
    const menuStatus = ref(0);
    // 展开的二级菜单
    const openSubMenuKeys = ref<string[]>([]);
    // 菜单
    const menuList = computed(() => {
      return props.menuList;
    });

    // 是否展开
    const onCollapseChange = () => {
      if (!props.allowCollapse) {
        return;
      }
      isCollapse.value = !isCollapse.value;
      if (isCollapse.value) {
        (document.querySelector('.menu-list') as HTMLElement).style.width = '50px';
      } else {
        (document.querySelector('.menu-list') as HTMLElement).style.width = '208px';
      }
    };
    // 鼠标进入
    /**
     * 判断是否处于收起状态
     */
    const onMouseOver = () => {
      if (!props.allowCollapse) {
        return;
      }
      if (!isCollapse.value) {
        return;
      }
      menuStatus.value = 1;
      if (
        (document.querySelector('.menu-list') as HTMLElement).style.width &&
        (document.querySelector('.menu-list') as HTMLElement).style.width === '50px'
      ) {
        (document.querySelector('.menu-list') as HTMLElement).style.width = '208px';
      }
    };
    /**
     * 展开二级菜单事件
     * @param keys
     */
    const onSubMenuOpen = (keys: string[]) => {
      if (!props.allowCollapse) {
        return;
      }
      if (!isCollapse.value) {
        return;
      }
      openSubMenuKeys.value = keys;
      // 如果展开二级菜单
      if (keys?.length) {
        console.log(keys, menuStatus.value);
        (document.querySelector('.menu-list') as HTMLElement).style.width = '208px';
      } else {
        setTimeout(() => {
          console.log('移除------------', openSubMenuKeys.value, menuStatus.value);
          if (openSubMenuKeys.value.length === 0 && menuStatus.value === 0) {
            (document.querySelector('.menu-list') as HTMLElement).style.width = '50px';
          }
        }, 120);
      }
    };
    // 鼠标移出
    const onMouseOut = () => {
      if (!props.allowCollapse) {
        return;
      }
      if (!isCollapse.value) {
        return;
      }
      menuStatus.value = 0;
      setTimeout(() => {
        console.log('移除------------', openSubMenuKeys.value, menuStatus.value);
        if (openSubMenuKeys.value.length === 0 && menuStatus.value === 0) {
          (document.querySelector('.menu-list') as HTMLElement).style.width = '50px';
        }
      }, 120);
    };
    /**
     * 路由跳转
     */
    const onRouterLink = () => {
      const prefixUrl = getCurrentDomain();
      const url = `${prefixUrl}${webPrefixUrl}?${jointSkipParams()}`;
      window.open(url, '_blank');
    };

    watch(
      () => route.path,
      () => {
        selectedMenu.value = [route.path];

        if (selectedMenu.value?.[0] === '/adBasicIndicatorMaintainDetail') {
          selectedMenu.value = ['/adBasicIndicatorMaintain'];
        }
      },
      {
        immediate: true,
      },
    );

    return {
      allowCollapse,
      selectedMenu,
      menuList,
      isCollapse,
      openSubMenuKeys,
      onMouseOver,
      onMouseOut,
      onCollapseChange,
      onSubMenuOpen,
      onRouterLink,
    };
  },
});
