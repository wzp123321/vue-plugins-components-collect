import { defineComponent, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const defaultUrl = computed(() => {
      return store.getters && store.getters.defaultUrl
        ? store.getters.defaultUrl
        : '/pageDiy';
    });
    // 跳转首页
    const onGoToDashboard = () => {
      router.push({
        path: defaultUrl.value,
        query: route.query,
      });
    };

    return { onGoToDashboard };
  },
});
