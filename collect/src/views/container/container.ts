import { defineComponent, ref } from 'vue';
// 组件
import Aside from '../layout/aside-box/aside-box.vue';
import { ElHeader, ElContainer, ElMain } from 'element-plus';
import { menuList } from '../layout/aside-box/constant';

export default defineComponent({
  components: {
    'ems-aside': Aside,
    'el-header': ElHeader,
    'el-container': ElContainer,
    'el-main': ElMain,
  },
  setup() {
    const selectedMenu = ref<string[]>([]);

    return {
      selectedMenu,
      menuList,
    };
  },
});
