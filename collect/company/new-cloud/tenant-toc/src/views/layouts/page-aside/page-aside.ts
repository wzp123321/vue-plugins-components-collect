/*
 * @Description: aside
 * @Autor: zpwan
 * @Date: 2022-04-06 13:50:16
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-25 21:00:51
 */
import { defineComponent, ref, watch, PropType, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';

// components
import AsideMenuItem from '../page-aside-item/page-aside-item.vue';

export default defineComponent({
  name: 'Aside',
  components: {
    AsideMenuItem,
  },
  props: {
    menuList: {
      type: Array as PropType<GeneralModule.MenuInfo[]>,
      default: [],
    },
  },
  setup(props) {
    const route = useRoute();
    // 菜单
    const menuList = computed(() => {
      return props.menuList;
    });
    // 处理path
    const selectedMenu = ref<string[]>([]);
    const openKeys = ref<string[]>([]);
    const clearOpenKeys = (val: string) => {
      nextTick(() => {
        if (openKeys.value.length === 0) {
          openKeys.value = [val];
        } else {
          openKeys.value = [];
        }
      });
    };
    const addOpenKeys = (val: string[]) => {
      openKeys.value = val;
    };
    watch(
      () => route.path,
      (newVal: string) => {
        selectedMenu.value = [newVal];
        if (
          newVal === '/home/projectManage/list' ||
          newVal === '/home/projectManage/view' ||
          newVal === '/home/projectManage/editor'
        ) {
          selectedMenu.value = ['/home/projectManage'];
        }
        if (newVal === '/home/energyProjectLibrary/list' || newVal === '/home/energyProjectLibrary/editor') {
          selectedMenu.value = ['/home/energyProjectLibrary/list'];
        }
        if (
          newVal === '/home/energyEventLibrary' ||
          newVal === '/home/benchmarkingDataMaintenance' ||
          newVal === '/home/benchmarkingLibrary' ||
          newVal === '/home/measureLibrary'
        ) {
          openKeys.value = ['/home/confluence'];
        }
        if (newVal === '/home/benchmarkingDataMaintenance') {
          selectedMenu.value = ['/home/benchmarkingLibrary'];
        }
      },
      {
        immediate: true,
      }
    );

    return { selectedMenu, menuList, openKeys, clearOpenKeys, addOpenKeys };
  },
});
