import { defineComponent, PropType } from 'vue';
import { useRouter } from 'vue-router';
import { ElMenu } from 'element-plus';

export default defineComponent({
  name: 'Aside',
  props: {
    menuList: {
      type: Array as PropType<any[]>,
      default: [],
    },
    selectedMenu: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  components: {
    'el-menu': ElMenu,
  },
  setup(props) {
    const router = useRouter();

    const handleMenuLinkTo = (path: string) => {
      router.push({ path });
    };

    return {
      menuList: props.menuList,
      selectedMenu: props.selectedMenu,
      handleMenuLinkTo,
    };
  },
});
