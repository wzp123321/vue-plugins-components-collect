import { ref, inject, Ref } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { StateType, EmitsType } from "../types";
import { DELAYER_KEY } from "../../../constant";
import { useRoute } from "vue-router";

enum CloseType {
	CLOSEALL,
	CLOSEOTHER,
}
export default function useMenu(state: StateType, props, emit: EmitsType) {
	const Delayer: Ref<(arg: any) => void> = inject(DELAYER_KEY);
	const visible = ref(false);
	const top = ref(0);
	const left = ref(0);
	const route = useRoute();
	/**
	 * 触发页签改变事件
	 */
	const changeHandle = (tag: RouteLocationNormalizedLoaded): Promise<any> => {
		const match = route.matched[route.matched.length - 1];
		console.log(match.leaveGuards.size > 0);
		emit("tag-change", tag);
		if (match.leaveGuards.size > 0) {
			return new Promise((resolve) => {
				Delayer.value = resolve;
			});
		} else {
			return Promise.resolve(true);
		}
	};
	/**
	 * 页签关闭处理
	 */
	const closeFilterTag = async (
		currentTag?: RouteLocationNormalizedLoaded,
		type?: CloseType
	) => {
		let filterTags = [];
		let cTag = currentTag;
		let cIndex = state.currentIndex;
		let res = true;
		filterTags = props.tags.filter(
			(item) =>
				item.meta.closeAble === false ||
				(CloseType.CLOSEOTHER === type &&
					currentTag &&
					currentTag.name === item.name)
		);
		filterTags = filterTags.length > 0 ? filterTags : [props.tags[0]];
		if (type === CloseType.CLOSEALL) {
			cIndex = 0;
			cTag = filterTags[0];
		}
		if (
			currentTag.name !== state.currentTag.name ||
			type === CloseType.CLOSEALL
		) {
			res = await changeHandle(cTag);
		}
		if (!res) return;

		state.currentTag = cTag;
		state.currentIndex = cIndex;
		emit("update:tags", filterTags);
	};
	/**
	 * 刷新
	 */
	const refresh = (tag: RouteLocationNormalizedLoaded | null) => {
		emit("refresh", tag as RouteLocationNormalizedLoaded);
	};
	/**
	 * 关闭其他
	 */
	const closeOther = (tag?: RouteLocationNormalizedLoaded) => {
		closeFilterTag(tag, CloseType.CLOSEOTHER);
	};
	/**
	 * 关闭全部
	 */
	const closeAll = () => {
		closeFilterTag(state.optTag, CloseType.CLOSEALL);
	};
	/**
	 * 关闭处理
	 */
	const closeHandle = async (tag?: RouteLocationNormalizedLoaded) => {
		emit("close", tag);
	};

	return {
		visible,
		top,
		left,
		refresh,
		closeOther,
		closeAll,
		closeHandle,
		changeHandle,
		Delayer,
	};
}
