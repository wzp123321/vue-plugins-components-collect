import { Ref } from "vue";
import { useRouter } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import layoutContent from "../content.vue";

export const useTagsView = (contentRef: Ref<InstanceType<typeof layoutContent>>) => {
	const router = useRouter();
	/**
	 * 刷新当前页签
	 */
	const refresh = () => {
		contentRef.value && contentRef.value.refreCurrentComponent();
	};
	/**
	 * 跳转到当前页面
	 */
	const tagChange = (tag: RouteLocationNormalizedLoaded) => {
		try {
			router?.push(tag);
		} catch (error) {
			throw new Error("页面跳转失败，请检查当前路由是否存在！");
		}
	};

	return {
		refresh,
		tagChange,
	};
};
