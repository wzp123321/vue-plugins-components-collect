/*
 * @Description: 面包屑
 * @Autor: zpwan
 * @Date: 2022-04-06 15:32:30
 * @LastEditors: zpwan
 * @LastEditTime: 2022-04-06 15:32:31
 */
import {
  defineComponent,
  onMounted,
  reactive,
  Ref,
  ref,
  watch,
  onUnmounted
} from 'vue';
// 类型
import { RouteLocationMatched, useRouter, useRoute } from 'vue-router';
import { PUBLIC_PATH } from '@/config';

export default defineComponent({
  name: 'TenantBreadCrumb',
  setup() {
    const route = useRoute();
    const router = useRouter();
    // 面包屑列表
    const routes: Ref<RouteLocationMatched[]> = ref([]);
    // 弹框
    const dialogVisible = ref(false);
    const dialogPosition = reactive<{ left: string; top: string }>({
      left: '0',
      top: '0'
    });
    // 当前tab
    const currentTab = ref();
    // 右击索引
    const rightClickValue = ref('');
    // 点击
    const onTabClick = (tab: any) => {
      const idx = Number(tab.index);
      if (currentTab.value !== routes.value[idx]) {
        currentTab.value = routes.value[idx].path;
        router.push(routes.value[idx].path);
      }
      console.log(tab);
    };
    /**
     * 移除
     */
    const onTabRemove = (tab: string) => {
      if (tab === currentTab.value) {
        if (routes.value.length === 1) {
          routes.value = [];
          router.push('/');
        } else {
          routes.value = routes.value.filter(item => {
            return item.path !== tab;
          });
          router.push({
            path: routes.value[routes.value.length - 1].path
          });
        }
      } else {
        routes.value = routes.value.filter(item => {
          return item.path !== tab;
        });
      }
    };
    // 右键
    const onBreadcrumbItemRightClick = (e: MouseEvent) => {
      e.preventDefault();
      const currentValue =
        (e.target as any).id &&
        (e.target as any).id.split('-') &&
        (e.target as any).id.split('-')[1]
          ? (e.target as any).id.split('-')[1]
          : '';
      rightClickValue.value = currentValue;
      if (
        !(e.target as any).className ||
        !(e.target as any).className.includes('el-tabs__item') ||
        routes.value.length < 2
      ) {
        return;
      }
      const offsetLeft = 200;
      const offsetTop = 60;
      Object.assign(dialogPosition, {
        left: `${e.clientX - offsetLeft}px`,
        top: `${e.clientY - offsetTop}px`
      });
      dialogVisible.value = true;
    };
    // 关闭
    const onRouteItemClose = (type: string) => {
      switch (type) {
        case 'current':
          onTabRemove(rightClickValue.value);
          break;
        case 'other':
          routes.value = routes.value.filter(item => {
            return item.path === rightClickValue.value;
          });
          if (rightClickValue.value !== currentTab.value) {
            router.push(rightClickValue.value);
          }
          break;
        case 'all':
          window.location.href = PUBLIC_PATH;
          break;
      }
    };
    // 鼠标点击事件
    const onMouseClickEv = (e: WindowEventMap['click']) => {
      if (
        e.target &&
        (e.target as any).className !== 'iot-breadcrumb__dialog'
      ) {
        dialogVisible.value = false;
      }
    };
    // 处理path
    const calculatePath = (value: string) => {
      return value.substring(
        0,
        value.indexOf('?') !== -1 ? value.indexOf('?') : value.length
      );
    };
    /**
     * 监听路由变化
     */
    watch(
      () => route.path,
      newVal => {
        if (newVal) {
          currentTab.value = calculatePath(window.history.state.current);
          const paths = routes.value.map(item => {
            return item.path;
          });
          if (!paths.includes(newVal)) {
            routes.value.push(route.matched[route.matched.length - 1]);
          }
        }
      },
      {
        immediate: true
      }
    );
    // 初始化--监听鼠标按下
    onMounted(() => {
      window.addEventListener('click', onMouseClickEv);
      // 根据hitsory模式机制初始化默认tab
      currentTab.value = calculatePath(window.history.state.current);
    });
    // 销毁前
    onUnmounted(() => {
      window.removeEventListener('click', onMouseClickEv);
    });

    return {
      routes,
      dialogVisible,
      dialogPosition,
      currentTab,
      onTabClick,
      onTabRemove,
      onRouteItemClose,
      onBreadcrumbItemRightClick
    };
  }
});
