<template>
	<div class="list-container flex-justify-between">
		<ResizeObserver :onResize="onListHolderResize">
			<div ref="tagsWrapperRef" class="tag-wrapper">
				<ResizeObserver :onResize="onListHolderResize">
					<ul ref="tabListRef" class="flex-justify-start flex-align-center tag-list" :style="{ transform: `translate(${transformLeft}px` }">
						<li :class="['tag-placeholder', currentIndex === 0 ? 'borderBottomRightRadius' : '']" key="first-p" ref="firstRef"></li>
						<li
							@click="changeTag(item, index)"
							@contextmenu.prevent="contextMenu(item, $event)"
							v-for="(item, index) in tags"
							:key="item.name as string"
							:ref="setRef(item.name as string) as any"
							:class="[
								currentTag?.name === item.name ? 'active' : 'disActive',
								currentIndex === index + 1 ? 'borderBottomRightRadius' : '',
								currentIndex === index - 1 ? 'borderBottomLeftRadius' : '',
								index !== tags.length - 1 ? 'tag-line' : '',
								'tag-item',
							]">
							<span>{{ item.meta && item.meta.title ? item.meta.title : item.name }}</span>
							<span class="icon" v-show="tags.length > 1 && item.meta.closeAble !== false" @click.stop="closeTag(item, index)">
								<el-icon>
									<Close />
								</el-icon>
							</span>
						</li>
						<li key="last-p" :class="['tag-placeholder', currentIndex > -1 && currentIndex === tags.length - 1 ? 'borderBottomLeftRadius' : '']"></li>
					</ul>
				</ResizeObserver>
			</div>
		</ResizeObserver>
		<te-dropdown max-height="200" v-if="hiddenTabs.length">
			<div class="expand-more flex-justify-center flex-align-center">
				<el-icon>
					<MoreFilled />
				</el-icon>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<te-dropdown-item @click="changeTag(tab, index)" v-for="(tab, index) in hiddenTabs" :key="tab.name">
						<span class="dropdown-menu-title">{{ tab.meta && tab.meta.title ? tab.meta.title : tab.name }}</span>
						<span class="dropdown-menu-icon" @click.stop="closeTag(tab, index)">
							<el-icon>
								<Close />
							</el-icon>
						</span>
					</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<!-- 下拉菜单 -->
		<transition name="te-zoom-in-top">
			<ul v-if="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
				<li @click="refresh(optTag)" v-show="optTag?.name === currentTag?.name">刷新</li>
				<li @click="closeOther(optTag)">关闭其他</li>
				<li @click="closeAll">全部关闭</li>
			</ul>
		</transition>
	</div>
</template>
<script lang="ts">
	import { defineComponent, reactive, toRefs, watch, shallowRef, ref, computed, watchEffect } from "vue";
	import type { PropType, ShallowRef } from "vue";
	import ResizeObserver from "./resize-observer";
	import { Close, MoreFilled } from "@element-plus/icons-vue";
	import { ElIcon, ElDropdownMenu, ElDropdownItem, ElDropdown } from "element-plus";
	import type { RouteLocationNormalizedLoaded } from "vue-router";
	import { useRoute } from "vue-router";
	import useMenu from "./hooks/useMenu";
	import { StateType, TagSizeMap, TagOffset } from "./types";
	import useTouchMove from "./hooks/useTouchMove";
	import useState from "./hooks/useState";
	import useRefs from "./hooks/useRefs";
	import { useRafState } from "./hooks/useRaf";
	import useOffsets from "./hooks/useOffsets";
	import useSyncState from "./hooks/useSyncState";
	import { isFunction } from "lodash-es";

	const DEFAULT_SIZE = { width: 0, left: 0, right: 0 };
	export default defineComponent({
		name: "TeTagsView",
		emits: ["tag-change", "update:tags", "refresh", "close"],
		components: {
			Close,
			MoreFilled,
			ResizeObserver,
			ElIcon,
			ElDropdownMenu,
			ElDropdownItem,
			ElDropdown,
		},
		props: {
			tags: {
				type: Array as PropType<Array<RouteLocationNormalizedLoaded>>,
				default: () => [],
				required: true,
			},
			activeName: {
				type: String,
				default: "",
			},
			onTagClickFn: {
				type: Function,
				default: () => null,
			},
		},
		setup(props, { emit }) {
			const curentRoute = useRoute();
			const firstRef = ref();
			const visibleStart = shallowRef(0);
			const visibleEnd = shallowRef(0);
			const tagsWrapperRef = shallowRef<HTMLDivElement>();
			const tabListRef = shallowRef<HTMLDivElement>();
			const [wrapperScrollWidth, setWrapperScrollWidth] = useState<number>(0);
			const [wrapperWidth, setWrapperWidth] = useState<number>(0);
			const [setRef, btnRefs] = useRefs();
			const hiddenTabs = computed(() => [...props.tags.slice(0, visibleStart.value), ...props.tags.slice(visibleEnd.value + 1)]);
			const [tagSizes, setTagSizes] = useRafState<TagSizeMap>(new Map());
			const tagOffsets = useOffsets(props.tags, tagSizes);

			const [transformLeft, setTransformLeft] = useSyncState(0, (_next, _prev) => {});
			watchEffect(() => {
				const transformSize: number = Math.abs(transformLeft.value);
				const basicSize: number = wrapperWidth.value;
				const tabContentSize: number = wrapperScrollWidth.value;
				const tagOffsetsValue = tagOffsets.value;
				let mergedBasicSize = basicSize;
				if (tabContentSize > basicSize && tabContentSize < basicSize) {
					mergedBasicSize = basicSize;
				}

				const tabsVal = props.tags;
				if (!tabsVal.length) {
					[visibleStart.value, visibleEnd.value] = [0, 0];
					return [visibleStart.value, visibleEnd.value];
				}

				const len = tabsVal.length;
				let endIndex = len;
				for (let i = 0; i < len; i += 1) {
					const offset: TagOffset = tagOffsetsValue.get(tabsVal[i].name as string) || DEFAULT_SIZE;
					if (offset.left + offset.width > transformSize + mergedBasicSize) {
						endIndex = i - 1;
						break;
					}
				}
				let startIndex = 0;
				for (let i = len - 1; i >= 0; i -= 1) {
					const offset = tagOffsetsValue.get(tabsVal[i].name as string) || DEFAULT_SIZE;
					if (offset.left < transformSize) {
						startIndex = i + 1;
						break;
					}
				}
				[visibleStart.value, visibleEnd.value] = [startIndex, endIndex];
				return [visibleStart.value, visibleEnd.value];
			});
			/**
			 * 取临界值
			 */
			const transformMin = shallowRef(0);
			const transformMax = shallowRef(0);
			const alignInRange = (value: number): number => {
				if (value < transformMin.value) {
					return transformMin.value;
				}
				if (value > transformMax.value) {
					return transformMax.value;
				}
				return value;
			};
			/**
			 *
			 * 滚动到目标位置
			 */
			const scrollToTag = (key = props.activeName) => {
				const tagOffset = tagOffsets.value.get(key) || {
					width: 0,
					left: 0,
					right: 0,
				};
				let newTransform = transformLeft.value;
				if (tagOffset.left < -transformLeft.value) {
					newTransform = -tagOffset.left;
				} else if (tagOffset.left + tagOffset.width > -transformLeft.value + wrapperWidth.value) {
					newTransform = -(tagOffset.left + tagOffset.width - wrapperWidth.value);
				}
				setTransformLeft(alignInRange(newTransform));
			};
			/**
			 * 切换tag
			 */
			const changeTag = async (item: RouteLocationNormalizedLoaded, i?: number) => {
				if (state.currentIndex === i) return;
				if (props.onTagClickFn && isFunction(props.onTagClickFn)) {
					props.onTagClickFn(item);
				}
				const res = await changeHandle(item);
				if (!res) return;
				const index = props.tags.findIndex((i) => i.name === item.name);
				scrollToTag(item.name as string);
				state.currentTag = item;
				state.currentIndex = index;
			};
			/**
			 * 组件数据
			 */
			const state = reactive<StateType>({
				currentTag: null,
				currentIndex: -1,
				optTag: null,
			});
			/**
			 * 右键菜单操作
			 */
			const { visible, left, top, refresh, closeOther, closeAll, changeHandle, Delayer } = useMenu(state, props, emit);
			/**
			 * 观察默认名字以及tag数据的变化
			 */
			watch(
				[() => props.activeName, tagOffsets],
				() => {
					defaultSelectTag();
				},
				{ flush: "post" }
			);
			/**
			 * 默认选中页签
			 */
			const defaultSelectTag = () => {
				state.currentIndex = props.tags.findIndex((i) => {
					if (i.name === props.activeName || i.meta.key === props.activeName) {
						state.currentTag = i;
						return true;
					}
					return false;
				});

				scrollToTag();
			};
			/**
			 * 关闭菜单
			 */
			const closeMenu = () => {
				visible.value = false;
			};
			watch(
				() => visible.value,
				() => {
					if (visible.value) {
						document.body.addEventListener("click", closeMenu);
					} else {
						document.body.removeEventListener("click", closeMenu);
					}
				},
				{ immediate: true }
			);

			/**
			 * 删除tag
			 */
			const closeTag = async (item: RouteLocationNormalizedLoaded, index: number) => {
				console.log(state.currentIndex, index);
				let currentIndex = state.currentIndex;
				let currentTag = state.currentTag;
				const surplusTags = props.tags.filter((i: RouteLocationNormalizedLoaded) => item.name !== i.name);
				if (currentIndex === index) {
					currentIndex = currentIndex === surplusTags.length ? --currentIndex : index;
					currentTag = surplusTags[currentIndex];
					const res = await changeHandle(currentTag);
					if (!res) return;
				}
				state.currentIndex = currentIndex;
				state.currentTag = currentTag;
				emit("close", item);
				emit("update:tags", surplusTags);
			};
			/**
			 * 右键
			 */
			const contextMenu = (tag: RouteLocationNormalizedLoaded, e: MouseEvent) => {
				if (tag.meta && !tag.meta.closeAble) {
					state.optTag = tag;
					left.value = e.pageX;
					top.value = e.pageY;
					visible.value = true;
				}
			};
			/**
			 * 监听滚动区域的变化
			 */
			const onListHolderResize = () => {
				const offsetWidth = tagsWrapperRef.value?.offsetWidth || 0;
				const newWrapperScrollWidth = tabListRef.value?.offsetWidth || 0;
				setWrapperWidth(offsetWidth);
				setWrapperScrollWidth(newWrapperScrollWidth);

				// 更新每个按钮的信息
				setTagSizes(() => {
					const newSizes: TagSizeMap = new Map();
					props.tags.forEach(({ name }) => {
						const key: string = name as string;
						const btnRef = btnRefs.value.get(key);
						const btnNode = (btnRef as any)?.$el || btnRef;
						if (btnNode) {
							newSizes.set(key, {
								width: btnNode.offsetWidth,
								left: btnNode.offsetLeft,
							});
						}
					});
					return newSizes;
				});
			};
			watchEffect(() => {
				transformMin.value = Math.min(0, wrapperWidth.value - wrapperScrollWidth.value);
				transformMax.value = 0;
			});

			/**
			 * 移动
			 */
			const doMove = (setState: (_fn: (_val: number) => number) => void, offset: number) => {
				setState((value: number) => {
					const newValue = alignInRange(value + offset);
					return newValue;
				});
			};
			useTouchMove(tagsWrapperRef as ShallowRef<HTMLDivElement>, (offsetX) => {
				if (wrapperWidth.value >= wrapperScrollWidth.value) {
					return false;
				}
				doMove(setTransformLeft, offsetX);
				return true;
			});
			return {
				...toRefs(state),
				changeTag,
				closeTag,
				contextMenu,
				visible,
				left,
				top,
				refresh,
				closeOther,
				closeAll,
				firstRef,
				onListHolderResize,
				tagsWrapperRef,
				tabListRef,
				hiddenTabs,
				setRef,
				transformLeft,
				curentRoute,
			};
		},
	});
</script>

<style lang="less" scoped>
	ul {
		padding: 0;
		margin: 0;
	}

	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.flex-justify-between {
		display: flex;
		justify-content: space-between;
	}

	.flex-justify-center {
		display: flex;
		justify-content: center;
	}

	.flex-align-center {
		display: flex;
		align-items: center;
	}

	.flex-justify-start {
		display: flex;
		justify-content: flex-start;
	}

	.dropdown-menu-title {
		flex: 1;
	}

	.dropdown-menu-icon {
		margin-left: 8px;
		vertical-align: middle;
		float: right;
		transform: translateY(2px);
		svg {
			color: var(--te-color-black);
			font-size: 14px;
			margin-top: 6px;
		}
		&:hover {
			svg {
				transform: scale(1.5);
			}
		}
	}

	.contextmenu {
		margin: 0;
		background: var(--te-bg-color);
		z-index: 3000;
		position: fixed;
		list-style-type: none;
		padding: 5px 0;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 400;
		color: #333;
		box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
		transition: all 200ms;

		li {
			margin: 0;
			padding: 7px 16px;
			cursor: pointer;

			&:hover {
				background: var(--te-bg-color-page);
			}
		}
	}

	.list-container {
		background: var(--te-bg-color);
		height: 32px;

		// padding: 0 8px;paddingpaddingpaddingpaddingpadding
		.tag-wrapper {
			flex: 1;
			width: 0;
			overflow: hidden;

			.tag-list {
				background: linear-gradient(var(--te-bg-color), var(--te-bg-color-page));
				display: inline-block;
				white-space: nowrap;

				li {
					display: inline-block;
					vertical-align: middle;
					color: var(--te-text-color-primary);

					&.tag-placeholder {
						width: 8px;
						height: 32px;
						background: var(--te-bg-color);
					}

					&.borderBottomRightRadius {
						border-bottom-right-radius: 8px;
					}

					&.borderBottomLeftRadius {
						border-bottom-left-radius: 8px;
					}

					&.tag-item {
						cursor: pointer;
						height: 32px;
						text-align: center;
						padding: 0px 12px 0px 16px;
						line-height: 32px;
						font-size: 14px;
						background: var(--te-bg-color);
						font-weight: 400;
						position: relative;

						&.tag-line {
							&::after {
								content: "";
								position: absolute;
								right: 0;
								top: 8px;
								margin: auto 0;
								height: 16px;
								width: 1px;
								background: var(--te-bg-color-page);
							}
						}

						span {
							&.icon {
								margin-left: 8px;
								color: var(--te-text-color-primary);
								vertical-align: middle;

								svg {
									margin-top: 6px;
								}

								&:hover {
									svg {
										transform: scale(1.5);
									}
								}
							}
						}

						&.active {
							background: var(--te-bg-color-page);
							border-radius: 8px 8px 0px 0px;
							color: var(--te-color-primary);
							position: relative;
							overflow: hidden;
						}
					}
				}
			}
		}

		.expand-more {
			width: 32px;
			height: 32px;
			cursor: pointer;
			box-shadow: -10px 0 10px var(--te-bg-color-page);
		}
	}
</style>
