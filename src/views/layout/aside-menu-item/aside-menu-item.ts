import { useRouter } from 'vue-router';
import { defineComponent, computed, PropType } from 'vue';
// components
import { MailOutlined, CalendarOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { MenuItem, SubMenu } from 'ant-design-vue';

export default defineComponent({
  name: 'AsideMenuItem',
  props: {
    dataSource: {
      type: Array as PropType<any[]>,
      default: [],
    },
  },
  components: {
    MailOutlined,
    CalendarOutlined,
    AppstoreOutlined,
    SettingOutlined,
    'a-menu-item': MenuItem,
    'a-sub-menu': SubMenu,
  },
  setup(props) {
    const menus = computed(() => {
      return props.dataSource;
    });
    const router = useRouter();
    /**
     * 菜单点击
     * iframe unload事件 监听到了在触发后续
     * @param path
     */
    const onMenuLinkTo = (path: string) => {
      router.push({
        path,
      });
    };
    // 处理菜单item key
    const handleMenuKey = (url: string) => {
      return !url || url.indexOf('?') === -1 ? url : url.split('?')[0];
    };
    return {
      menus,
      router,
      onMenuLinkTo,
      handleMenuKey,
    };
  },
});
