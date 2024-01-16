import { clearRedundantSession, globalPageLink } from '@/utils/index';
import { cloneDeep } from 'lodash';
import { defineComponent, computed, PropType } from 'vue';
import { MenuInfo } from '@/services/common.type';
import { MenuItem, SubMenu } from 'ant-design-vue';

export default defineComponent({
  name: 'AsideMenuItem',
  props: {
    dataSource: {
      type: Array as PropType<MenuInfo[]>,
      default: [],
    },
  },
  components: {
    'a-menu-item': MenuItem,
    'a-sub-menu': SubMenu,
  },
  setup(props) {
    const menus = computed(() => {
      return props.dataSource;
    });
    /**
     * 菜单点击
     * iframe unload事件 监听到了在触发后续
     * @param path
     */
    const onMenuLinkTo = (path: string) => {
      clearRedundantSession();

      // 触发iframe改变
      let newPath = cloneDeep(path);
      let params = {};
      if (newPath.indexOf('?') !== -1) {
        const arr = newPath.split('?');
        newPath = arr[0];
        arr[1].split('&').forEach((item) => {
          if (item.indexOf('=') !== -1) {
            const d = item.split('=');
            params = {
              [d[0]]: d[1],
            };
          }
        });
      }
      // 把多的参数传到方法里
      globalPageLink(`/ems-container${newPath}`, params);
    };
    // 处理菜单item key
    const handleMenuKey = (url: string) => {
      return !url || url.indexOf('?') === -1 ? url : url.split('?')[0];
    };
    return {
      menus,
      onMenuLinkTo,
      handleMenuKey,
    };
  },
});
