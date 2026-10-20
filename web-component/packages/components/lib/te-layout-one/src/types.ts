import type { RouteRecordName } from "vue-router";

export interface LayoutMenuType {
	path: string;
	name: string;
	meta: {
		hidden?: boolean;
		icon: string;
		title: string;
	};
	children: LayoutMenuType[] | null;
}
export interface LayoutAsideType {
	activeMenuCode?: string;
	activeParentMenuCode?: string;
	menuArray: LayoutMenuType[];
	isSpread: boolean;
	defaultActive?: string | null | undefined | RouteRecordName;
}

export interface LayoutContentProps {
	keepAlives?: string[];
}
