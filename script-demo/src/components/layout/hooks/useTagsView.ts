import { useRouter } from 'vue-router';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

const useTagsView = () => {
  const router = useRouter();
  /**
   * 刷新当前页签
   */
  const refresh = () => {
    router.go(0);
  };
  /**
   * 跳转到当前页面
   */
  const tagChange = (tag: RouteLocationNormalizedLoaded) => {
    router.push(tag);
  };

  return {
    refresh,
    tagChange,
  };
};

export default useTagsView;
