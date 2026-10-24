<template>
	<div>
		<te-aside
			class="aside"
			width="224px"
			:class="{
				'spread-float': !collapse && isFloat,
				spread: !collapse && !isFloat,
				'fold-float': collapse && isFloat,
				fold: collapse && !isFloat,
			}">
			<slot name="head">
				<CollapseTransition>
					<div class="aside-logo" :key="String(collapse)">
						<te-image :src="sideNavLogo" style="width: 32px; height: 32px" alt="加载失败">
							<template #error>
								<img src="./img/logo.png" alt="加载失败" />
							</template>
						</el-image>
						<span v-show="!collapse">{{ sideNavName }}</span>
					</div>
				</CollapseTransition>
			</slot>
			<te-row class="aside-con" @mouseenter="onMouseEnterMenu" @mouseleave="onMouseLeaveMenu">
				<el-col>
					<te-menu :collapse="collapse" :default-active="defaultActive" @open="groupOpen" @close="groupClose" v-bind="$attrs">
						<template v-for="(item, index) in menuList" :key="item.name">
							<te-sub-menu v-if="item.children && item.children.length > 0" :index="item.name">
								<template #title>
									<te-icon
										v-if="iconList.length"
										class="menu-group-img"
										:class="{
											'menu-group-img-active': selectedParentMenuName.indexOf(item.name) >= 0 && (!spreadingGroupMenuName.has(item.name) || collapse),
										}">
										<component :is="getIconComponent(item.meta.icon ?? '')" />
									</el-icon>
									<span
										v-show="!collapse"
										:class="{
											'menu-item-title-active': selectedParentMenuName.indexOf(item.name) >= 0 && !spreadingGroupMenuName.has(item.name),
										}">
										{{ item.meta.title }}
									</span>
								</template>
								<template v-for="subMenu in item.children" :key="subMenu.name">
									<!-- 有三级元素 -->
									<te-sub-menu v-if="subMenu.children && subMenu.children.length > 0" :index="subMenu.name">
										<template #title>
											<div class="sub-menu">
												<span
													v-show="!collapse"
													:class="{
														'menu-item-title-active': selectedParentMenuName.indexOf(subMenu.name) >= 0 && !spreadingGroupMenuName.has(subMenu.name),
													}">
													{{ subMenu.meta.title }}
												</span>
											</div>
										</template>
										<te-menu-item v-for="subSubMenu in subMenu.children" :index="subSubMenu.name" :key="subSubMenu.name" @click="goPage(subSubMenu)" style="padding-left: calc(60px - 24px)">
											<div class="sub-menu">
												<span
													:class="{
														'menu-item-title-active': activeMenuName == subSubMenu.name,
													}">
													{{ subSubMenu.meta.title }}
												</span>
											</div>
										</el-menu-item>
									</el-sub-menu>

									<!-- 无三级元素 -->
									<te-menu-item-group v-else>
										<te-menu-item :key="subMenu.name" :index="subMenu.name" style="padding-left: 44px" @click="goPage(subMenu)">
											<div>
												<span
													:class="{
														'menu-item-title-active': activeMenuName == subMenu.name,
													}">
													{{ subMenu.meta.title }}
												</span>
											</div>
										</el-menu-item>
									</el-menu-item-group>
								</template>
							</el-sub-menu>

							<template v-else>
								<te-menu-item v-if="!item.meta.floatEnable" class="single-menu" @click="goPage(item)">
									<te-icon v-if="iconList && iconList.length" class="menu-group-img" :class="{ 'menu-group-img-active': activeMenuName == item.name }">
										<component :is="getIconComponent(item.meta.icon ?? '')" />
									</el-icon>
									<span v-if="!collapse" :class="{ 'menu-item-title-active': activeMenuName === item.name }">{{ item.meta.title }}</span>
								</el-menu-item>

								<!-- 可触发悬浮操作的一级菜单 -->
								<div v-else class="te-menu-item single-menu" @mouseenter="onMouseEnterFloatMenuItem($event, item)" @mouseleave="onMouseLeaveFloatMenuItem(item)">
									<te-icon v-if="iconList && iconList.length" class="menu-group-img" :class="{ 'menu-group-img-collapse': collapse }">
										<component :is="getIconComponent(item.meta.icon ?? '')" />
									</el-icon>
									<span v-if="!collapse">{{ item.meta.title }}</span>
								</div>
							</template>
						</template>
					</el-menu>
				</el-col>
			</el-row>
			<div class="aside-btn" @click="onClickSpread">
				<img v-show="collapse" src="../../../assets/images/zhankai.svg" alt="展开" />
				<img v-show="!collapse" src="../../../assets/images/shousuo.svg" alt="收起" />
			</div>
		</el-aside>
		<div class="float-container" v-show="isFloat"></div>
	</div>
</template>

<script lang="ts">
	import { PropType, defineComponent, onMounted, onUnmounted, reactive, toRefs, watch, inject, Ref, ref, Component } from "vue";
	import { TeAside, TeCol, TeRow, TeMenu, TeMenuItem, TeSubMenu, TeMenuItemGroup, ElIcon, TeImage } from "element-plus";
	import logoUrl from "./img/logo.png";
	import { DELAYER_KEY } from "../../constant";
	import { useRoute } from "vue-router";
	import CollapseTransition from "./components/collapse-transition.vue";
	import { upperFirst, camelCase } from "lodash";
	type TreeNode<T> = {
		[P in keyof T]: T[P];
	} & {
		children?: Array<TreeNode<T>>;
	};

	interface menuListItem {
		meta: {
			title: string;
			icon: string;
			floatEnable: boolean;
		};
		name: string;
		parentName: string;
	}
	interface DataType {
		activeMenuName: string;
		// 选中item的父节点数组name,第一个元素表示一级节点，第二元素表示二级节点
		selectedParentMenuName: string[];
		// 当前展开的group节点数组name
		spreadingGroupMenuName: Set<string>;
		menuArrayData: Array<TreeNode<menuListItem>>;
		// 当前是否折叠状态
		collapse: boolean;
		// 是否悬浮状态
		isFloat: boolean;
	}

	export default defineComponent({
		name: "te-sidenav",
		props: {
			menuList: {
				required: true,
				type: Array as PropType<Array<TreeNode<menuListItem>>>,
			},
			iconList: {
				type: Array,
				default: () => {
					return [];
				},
			},
			defaultActive: {
				require: false,
				type: String,
			},
			sideNavLogo: {
				require: false,
				type: String,
				default: logoUrl,
			},
			sideNavName: {
				require: false,
				type: String,
			},
		},
		components: {
			TeAside,
			TeCol,
			TeRow,
			TeMenu,
			TeMenuItem,
			TeSubMenu,
			TeMenuItemGroup,
			ElIcon,
			TeImage,
			CollapseTransition,
		},

		/**
		 * collapse：是否折叠
		 * onSelectItem：item点击事件
		 */
		emits: ["collapse", "onSelectItem", "onMouseEnterFloatMenuItem", "onMouseLeaveFloatMenuItem"],
		setup(props, { emit }) {
			const Delayer: Ref<(arg: any) => void> = inject(DELAYER_KEY);
			// 组件内的数据
			const data = reactive<DataType>({
				activeMenuName: props.defaultActive,
				selectedParentMenuName: [],
				spreadingGroupMenuName: new Set(),
				menuArrayData: props.menuList,
				collapse: false,
				isFloat: false,
			});
			/**
			 * 当前侧边栏收起的状态
			 * false 关闭 true 展开
			 */
			const collapseStatus = ref(true);

			onMounted(() => {
				onSelectItem(props.defaultActive ?? "");
			});

			onUnmounted(() => {
				// 重置数据源
				data.menuArrayData = [];
			});

			/**
			 *根据url地址匹配对应的菜单
			 *@param key url地址
			 *@param prop 数组中对应的属性名
			 *@param list 菜单数组
			 */
			const findItemByKey = (key: string, prop: string, list?: Array<any>) => {
				if (list == null || undefined) {
					return null;
				}

				let res = list.find((item: any) => item[prop] === key);
				if (res) {
					return res;
				} else {
					for (const item of list) {
						if (item?.children instanceof Array && item?.children.length > 0) {
							res = findItemByKey(key, prop, item?.children);
							if (res) {
								return res;
							}
						}
					}
					return null;
				}
			};

			const onClickSpread = () => {
				data.isFloat = false;
				collapseStatus.value = !collapseStatus.value;
				switchSpread();
			};
			/**
			 * 触发页签改变事件
			 */

			const route = useRoute();
			const changeHandle = (): Promise<any> => {
				const match = route?.matched[route?.matched.length - 1];
				console.log(match?.leaveGuards.size > 0);
				if (match?.leaveGuards.size > 0) {
					return new Promise((resolve) => {
						Delayer.value = resolve;
					});
				} else {
					return Promise.resolve(true);
				}
			};
			/**
			 * 页面跳转
			 * 以下代码和watch中有重复，但是为了用户体验，在点击的时候就设置选中颜色
			 * watch中的代码主要是为了解决，浏览器刷新，前进后退，404的时候保障选中效果
			 */
			const goPage = async (menu: menuListItem) => {
				emit("onSelectItem", menu);
				const res = await changeHandle();
				if (!res) return;
				onSelectItem(menu.name, menu.parentName);
			};

			const onSelectItem = (name: string, parentName?: string) => {
				data.activeMenuName = name;
				if (parentName == null || parentName.length <= 0) {
					let menu = findItemByKey(name, "name", props.menuList);
					if (menu != null) {
						parentName = menu.parentName;
					}
				}
				let parentMenu = findItemByKey(parentName ?? "", "name", props.menuList);
				data.selectedParentMenuName.length = 0;
				if (parentMenu != null) {
					let topParentMenu = findItemByKey(parentMenu.parentName, "name", props.menuList);
					data.selectedParentMenuName.push(parentMenu.name);
					if (topParentMenu != null) {
						data.selectedParentMenuName.push(topParentMenu.name);
					}
				}
			};

			const groupOpen = (key: string, keyPath: string[]) => {
				keyPath.forEach((element) => {
					data.spreadingGroupMenuName.add(element);
				});
			};

			const groupClose = (key: string, keyPath: string[]) => {
				data.spreadingGroupMenuName.delete(key);
			};

			watch(
				() => props.menuList,
				(newValue: Array<any>) => {
					if (newValue && newValue.length > 0) {
						onSelectItem(props.defaultActive ?? "");
					}
				},
				{
					immediate: true,
				}
			);
			watch(
				() => props.defaultActive,
				(newValue: string) => {
					onSelectItem(newValue);
				},
				{
					immediate: true,
				}
			);

			/**
			 * 防抖函数
			 * @param func 执行函数
			 * @param delay 延迟时间 ms
			 * @param immediate 是否立即执行
			 */
			const debounce = (func: any, time: number, immediate = false) => {
				let timer: number | null = null;
				return (...args: any[]) => {
					if (timer) clearInterval(timer);
					if (immediate) {
						if (!timer) func.apply(this, args);
						timer = window.setTimeout(() => {
							timer = null;
						}, time);
					} else {
						timer = window.setTimeout(() => {
							func.apply(this, args);
						}, time);
					}
				};
			};

			/**
			 * 鼠标进入menu组件区域事件
			 * @param event
			 */
			const onMouseEnterMenu = debounce(() => {
				if (!data.collapse) {
					return;
				}
				data.isFloat = true;
				switchSpread();
			}, 200);

			/**
			 * 鼠标离开menu组件区域事件
			 * @param event
			 */
			const onMouseLeaveMenu = debounce(() => {
				if (data.collapse || !data.isFloat) {
					return;
				}
				data.isFloat = true;
				switchSpread();
			}, 200);

			const switchSpread = () => {
				data.collapse = !data.collapse;
				// 收起展开动效执行结束后回调事件
				setTimeout(() => {
					emit("collapse", data.collapse, collapseStatus.value);
				}, 500);
			};

			/**
			 * 鼠标进入可弹出悬浮操作item区域事件
			 * @param event
			 */
			const onMouseEnterFloatMenuItem = debounce((e: any, menu: { name: string; parentName: string }) => {
				if (e.target && e.target.clientWidth < 200) {
					// 折叠状态下触发两次事件过滤处理
					return;
				}
				emit("onMouseEnterFloatMenuItem", menu);
			}, 200);

			/**
			 * 鼠标离开可弹出悬浮操作item区域事件
			 * @param event
			 */
			const onMouseLeaveFloatMenuItem = debounce((menu: { name: string; parentName: string }) => {
				emit("onMouseLeaveFloatMenuItem", menu);
			}, 200);
			// 获取icon组件
			const getIconComponent = (icon: string) => {
				const iconKey = icon.includes("Icon") ? icon : `Icon${upperFirst(camelCase(icon))}`;
				return props.iconList.find((i: Component) => i.name === iconKey);
			};
			return {
				...toRefs(data),
				goPage,
				groupOpen,
				groupClose,
				onMouseEnterMenu,
				onClickSpread,
				onMouseLeaveMenu,
				onMouseEnterFloatMenuItem,
				onMouseLeaveFloatMenuItem,
				getIconComponent,
			};
		},
	});
</script>

<style scoped lang="less">
	.mr15 {
		margin-right: 15px;
	}
	.aside {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--te-color-white);
		box-shadow: 2px 0px 8px 0px rgba(0, 0, 0, 0.15);
		border-right: 1px solid var(--te-border-color-divider-light);
		transition: width 0.5s;
		-moz-transition: width 0.5s; /* Firefox 4 */
		-webkit-transition: width 0.5s; /* Safari and Chrome */
		-o-transition: width 0.5s; /* Opera */
		overflow-x: hidden;

		.aside-logo {
			width: 100%;
			height: 64px;
			line-height: 64px;
			text-align: center;
			box-sizing: border-box;
			padding: 0 10px;
			overflow: hidden;
			border-bottom: 1px solid var(--te-border-color-divider-light);
			display: flex;
			align-items: center;

			img {
				position: relative;
				top: -2px;
				left: 0;
			}
			span {
				margin-left: 8px;
				font-size: 16px;
				font-weight: 600;
				color: var(--te-text-color-primary);
			}
		}
	}
	.float-container {
		margin-right: 50px;
	}
	.spread {
		width: 224px;
	}
	.spread-float:extend(.spread all) {
		position: absolute;
		top: 0px;
		bottom: 0px;
		z-index: 99;
	}

	.fold {
		width: 56px;
	}

	.fold-float:extend(.fold all) {
		position: absolute;
		top: 0px;
		bottom: 0px;
		z-index: 99;
	}

	.aside-btn {
		display: flex;
		height: 44px;
		align-items: center;
		padding-left: 15px;
		cursor: pointer;

		img {
			width: 24px;
			height: 24px;
		}
	}

	.aside-con {
		display: flex;
		width: 100%;
		flex-grow: 1;
		height: 0;
		background-color: var(--te-color-white);
		text-align: left;
		margin-bottom: 0 !important;
		overflow: scroll;
		padding: 20px 0px;

		.menu-group-img {
			width: 16px !important;
			height: 16px;
			margin-right: 8px;
		}

		.menu-group-img-active {
			color: var(--te-color-primary);
		}

		.third-menu-item:extend(:deep(.te-menu-item) all) {
			background-color: var(--te-fill-color-lighter);
		}

		.menu-item-title-active {
			color: var(--te-color-primary);
		}

		.sub-menu {
			display: flex;
			height: 48px;
			padding-left: 24px;

			.menu-item-title-active {
				color: var(--te-color-primary);
			}
		}

		.single-menu {
			padding-left: 20px !important;
			height: 48px;
		}

		:deep(.te-menu) {
			border-right: none;
		}

		:deep(.te-menu--collapse) {
			width: 56px;
		}

		:deep(.te-menu-item-group__title) {
			display: none;
		}

		:deep(.te-sub-menu__title) {
			height: 48px;
			line-height: 48px;
			padding-left: var(--te-menu-base-level-padding) !important;
		}
		:deep(.te-sub-menu .te-menu-item) {
			height: 48px;
			line-height: 48px;
			min-width: 200px;
		}

		:deep(.te-menu-item:hover) {
			background-color: var(--te-menu-hover-bg-color);
		}

		:deep(.te-menu--collapse > .te-sub-menu > .te-sub-menu__title [class^="te-icon"]) {
			width: 16px;
		}
	}

	.aside-con::-webkit-scrollbar {
		display: none;
	}
</style>
