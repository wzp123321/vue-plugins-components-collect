<template>
	<te-tree ref="treeRef" class="te-tree-edit" :filter-node-method="filterNode" :highlight-current="true" :props="props.props" :="$attrs">
		<template #default="{ node, data }">
			<div class="tte-line" @mouseenter="handleEnter($event, node)" @mouseleave="handleLeave($event)">
				<div class="tte-line-left">
					<!-- 自定义icon图标插槽 -->
					<slot name="item-icon" v-bind="{ node, data }"></slot>
					<te-tooltip :visible="labelTooltipShowId === node.data.$treeNodeId" placement="top-start" :content="data[props.props.label]">
						<div @mouseenter="handleCellMouseEnter($event, node.data.$treeNodeId)" @mouseleave="handleCellMouseLeave($event, node.data.$treeNodeId)" class="tte-line-left-text">
							{{ data[props.props.label] }}
						</div>
					</el-tooltip>
				</div>
				<div class="tte-line-right" :class="node.data.$treeNodeId === mouseEnterNodeId && !data[props.props.notShowMore] ? '' : 'view-hidden'" @click.stop>
					<el-dropdown>
						<el-icon><icon-more-filled /></el-icon>
						<template #dropdown>
							<div @mouseenter="handleEnter($event, node)" @mouseleave="handleLeave($event)">
								<!--  此处插槽为 te-dropdown-menu  -->
								<slot name="more-action" v-bind="{ node, data }"></slot>
							</div>
						</template>
					</el-dropdown>
				</div>
			</div>
		</template>
		<template #empty>
			<div class="tte-empty">
				<img class="tte-empty-img" src="../../../assets/images/tree-edit-empty.svg" alt="" />
				<div class="tte-empty-text">暂无内容</div>
			</div>
		</template>
	</el-tree>
</template>
<script lang="ts" setup>
	import { ref, watch } from "vue";
	import { ElTree, ElDropdown, ElIcon, ElTooltip } from "element-plus";
	import { IconMoreFilled } from "@arco-iconbox/vue-te";
	import type Node from "element-plus/es/components/tree/src/model/node";
	import type { TreeOptionProps } from "element-plus/es/components/tree/src/tree.type";

	interface TreeOptionPropsCustom extends TreeOptionProps {
		label: string;
		notShowMore: string;
	}

	interface Tree {
		[key: string]: any;
	}

	const props = withDefaults(
		defineProps<{
			props: TreeOptionPropsCustom;
			searchValue?: string;
			allExpand?: boolean;
			levelExpand?: string;
		}>(),
		{
			props: () => {
				return {
					label: "label",
					notShowMore: "notShowMore",
				};
			},
			searchValue: "",
			allExpand: false,
			levelExpand: "0",
		}
	);

	//正在悬浮的nodeId,没有悬浮为-1
	const mouseEnterNodeId = ref(-1);
	//是否有目标处于正在悬浮状态
	let mouseState = false;

	/**
	 * 鼠标hover到tree-item
	 * @param _ev
	 * @param node
	 */
	const handleEnter = (_ev: MouseEvent, node: Node) => {
		mouseState = true;
		mouseEnterNodeId.value = node.data.$treeNodeId;
	};

	/**
	 * 鼠标离开
	 * @param _ev
	 * @param node
	 */
	const handleLeave = (_ev: MouseEvent) => {
		mouseState = false;
		let timer: number | null = null;
		clearTimeout(timer);
		timer = window.setTimeout(() => {
			if (mouseState === false) {
				mouseEnterNodeId.value = -1;
			}
		}, 100);
	};

	/**
	 * 根据搜索值过滤
	 */
	const filterNode = (value: string, data: Tree) => {
		if (!value) return true;
		let name = props.props.label || "label";
		if (!data[name]) {
			return false;
		}
		return data[name].includes(value);
	};

	const treeRef = ref<InstanceType<typeof ElTree>>();

	watch(
		() => props.searchValue,
		(val) => {
			treeRef.value?.filter(val);
		}
	);

	/**
	 * 展开折叠所有节点
	 * @param val
	 */
	const setAllFold = (val: boolean) => {
		if (!treeRef.value) {
			return;
		}
		for (var i = 0; i < treeRef.value.store._getAllNodes().length; i++) {
			treeRef.value.store._getAllNodes()[i].expanded = val;
		}
	};

	watch(
		() => props.allExpand,
		(val) => {
			setAllFold(val);
		}
	);

	/**
	 * 展开/折叠指定层级
	 * @param val
	 */
	const setNumFold = (val: string) => {
		if (!treeRef.value) {
			return;
		}
		for (var i = 0; i < treeRef.value.store._getAllNodes().length; i++) {
			treeRef.value.store._getAllNodes()[i].expanded = false;

			if (treeRef.value.store._getAllNodes()[i].level <= parseInt(val)) {
				treeRef.value.store._getAllNodes()[i].expanded = true;
			}
		}
	};
	watch(
		() => props.levelExpand,
		(val) => {
			!!val && setNumFold(val);
		}
	);

	interface ToElement {
		scrollWidth: number;
		offsetWidth: number;
	}
	/**
	 * 当字符串被截断显示时，才展示tooltip
	 */
	const labelTooltipShowId = ref("");
	const handleCellMouseEnter = (e: MouseEvent, id: string) => {
		let el = e.target as HTMLElement;
		let state = el.scrollWidth > el.offsetWidth;
		if (state) {
			labelTooltipShowId.value = id;
		}
	};
	const handleCellMouseLeave = (_e: MouseEvent, id: string) => {
		labelTooltipShowId.value = "";
	};
</script>

<style scoped lang="less">
	.te-tree-edit {
		// 使用element-plus中的下拉菜单dropdown,当鼠标放上去后出现一个黑框，点击也会出现黑框，点击外面则会消失，怎么去掉这个黑框
		:deep(:focus-visible) {
			outline: none;
		}

		:deep(.te-tree-node.is-current > .te-tree-node__content) {
			background: var(--te-fill-color-light);
			color: var(--te-color-primary);
		}

		.view-hidden {
			visibility: hidden;
		}
		.tte-line {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			height: 100%;
			flex: 1;
			overflow: hidden;
			.tte-line-left {
				display: flex;
				flex-direction: row;
				align-items: center;
				flex: 1;
				overflow: hidden;
				.tte-line-left-text {
					margin-left: 6px;
					flex: 1;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					line-height: 22px;
				}
			}
			.tte-line-right {
				padding: 0 5px 0 5px;
				height: 100%;
				display: flex;
				flex-direction: row;
				align-items: center;
			}
		}
		.tte-empty {
			margin-top: 30%;
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.tte-empty-img {
				width: 160px;
				height: 160px;
				object-fit: contain;
			}
			.tte-empty-text {
				margin: 16px;
				color: var(--te-color-info-light-5);
				font-size: var(--te-font-size-b14);
				line-height: 22px;
			}
		}
	}
</style>
