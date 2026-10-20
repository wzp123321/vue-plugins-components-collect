import type { RouteLocationNormalizedLoaded } from "vue-router";

export interface TagItem {
	path: string;
}

export interface StateType {
	currentTag: RouteLocationNormalizedLoaded | null;
	currentIndex: number;
	optTag: RouteLocationNormalizedLoaded | null;
}

export type Key = string | number;

export type TagSizeMap = Map<Key, { width: number; left: number }>;

export interface TagOffset {
	width: number;
	left: number;
	right: number;
}
export type TagOffsetMap = Map<Key, TagOffset>;
export interface Tag extends RouteLocationNormalizedLoaded {
	key?: Key;
}

export type OnTabScroll = (_info: { direction: "left" | "right" }) => void;

export interface EmitsType {
	(e: "tag-change", tag: RouteLocationNormalizedLoaded): void;
	(e: "refresh", tag: RouteLocationNormalizedLoaded): void;
	(e: "update:tags", list: Array<RouteLocationNormalizedLoaded>): void;
	(e: "close", tag: RouteLocationNormalizedLoaded): void;
}
