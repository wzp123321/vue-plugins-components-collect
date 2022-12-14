import { defineComponent, ref } from 'vue';
// 组件
import Aside from '../layout/aside-box/aside-box.vue';
import { LayoutHeader, Layout, LayoutContent } from 'ant-design-vue';

export default defineComponent({
  components: {
    'ems-aside': Aside,
    'a-layout-header': LayoutHeader,
    'a-layout': Layout,
    'a-layout-content': LayoutContent,
  },
  setup() {
    // 菜单
    const menuList = ref<any[]>([{}]);
    // 选中菜单
    const selectedMenu = ref<string[]>([]);

    return {
      selectedMenu,
      menuList,
    };
  },
});
