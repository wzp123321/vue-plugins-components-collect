import { getCurrentInstance, ComponentInternalInstance,computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export const useCommonController = () => {
  const { appContext } = getCurrentInstance() as ComponentInternalInstance;
  const route = useRoute();
  const router = useRouter();
  const store = useStore();
  const proxy = appContext.config.globalProperties;
  /**
   * 路由跳转携带的projectId
   */
  const projectId = computed(() => {
    return store.getters.routeParams && store.getters.routeParams.projectId ? store.getters.routeParams.projectId : -1;
  });

  return { proxy, route, router, store, projectId };
};
