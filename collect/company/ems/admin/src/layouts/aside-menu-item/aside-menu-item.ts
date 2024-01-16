import { defineComponent, computed, PropType, inject } from 'vue';
import { useCommonController } from '@/utils/use-common-controller';
import { getMenuIcon } from '@/config/index';
import { FSetSession } from '@/utils/token';

export default defineComponent({
  name: 'AsideMenuItem',
  props: {
    dataSource: {
      type: Array as PropType<GlobalModule.MenuInfo[]>,
      default: [],
    },
  },
  inject: ['refreshRouterkey'],
  setup(props) {
    const menus = computed(() => {
      return props.dataSource;
    });
    const { router, route } = useCommonController();
    const refreshKey: any = inject('refreshRouterkey');
    /**
     * 菜单点击
     * @param path
     */
    const onMenuLinkTo = (path: string) => {
      FSetSession('share-rule-tab', '');
      FSetSession('ad-basic-indicators-maintain-pageNum', '');
      router.push({
        path: path.trim(),
        query: route.query,
      });
      if (route.path === path.trim()) {
        refreshKey();
      }
    };

    return {
      menus,
      router,
      onMenuLinkTo,
      getMenuIcon,
    };
  },
});
