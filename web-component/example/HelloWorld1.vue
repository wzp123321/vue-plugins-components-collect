<template>
	<div class="wrap">
		<te-layout-tree :tree-data="data" @add-item="handleAdd" :level-expand-btn="true">
			<template #content="{ searchValue, allExpand, levelExpand }">
				<te-tree-edit :data="data" :props="defaultProps" :search-value="searchValue" :all-expand="allExpand" :level-expand="levelExpand" :check-on-click-node="true" @node-click="handleClickTree">
					<template #more-action="{ node, data }">
						<el-dropdown-menu>
							<te-dropdown-item @click="handleRename(node, data)">重命名1</el-dropdown-item>
							<el-dropdown-item>编辑1</el-dropdown-item>
							<el-dropdown-item>删除</el-dropdown-item>
						</el-dropdown-menu>
					</template>
					<template #item-icon="{ node }">
						<icon-folder-opened v-if="node.expanded" class="tree-line-left-icon" />
						<icon-folder v-else class="tree-line-left-icon" />
					</template>
				</te-tree-edit>
			</template>
			<template #right-content>
				<div class="right-content"></div>
			</template>
		</te-layout-tree>
	</div>
</template>
<script lang="ts" setup>
	import { IconFolderOpened, IconFolder } from "@arco-iconbox/vue-te";
	import { TeLayoutTree, TeTreeEdit, DELAYER_KEY } from "@/components/lib";
	import { ElDropdownMenu, ElDropdownItem, ElTag } from "element-plus";
	import { onBeforeRouteLeave } from "vue-router";
	import { defineComponent, reactive, toRefs, ref, inject } from "vue";
	interface Tree {
		name: string;
		notShow?: boolean;
		children?: Tree[];
	}
	const delayer: any = inject(DELAYER_KEY);
	onBeforeRouteLeave((_to, _from, next) => {
		console.log(5);
		delayer?.value(true);
		next();
	});
	const defaultProps = {
		children: "children",
		label: "name",
		notShowMore: "notShow",
	};

	const data: Tree[] = [
		{
			name: "当升科技放得开地缚少年可复美莲富大厦",
			notShow: true,
			children: [
				{
					name: "健康的呃呃热情恶客即可认可考核热",
					children: [
						{
							name: "较大可抵扣你的男的女的教科文口味额额呢我就",
							children: [
								{
									name: "经典复刻经济负担就能发手打你见客户",
									children: [
										{
											name: "经典复刻经济负担就能发手打你见客户",
											children: [
												{
													name: "经典复刻经济负担就能发手打你见客户",
													children: [
														{
															name: "经典复刻经济负担就能发手打你见客户",
															children: [
																{
																	name: "经典复刻经济负担就能发手打你见客户",
																	children: [
																		{
																			name: "经典复刻经济负担就能发手打你见客户",
																		},
																	],
																},
															],
														},
													],
												},
											],
										},
									],
								},
							],
						},
					],
				},
			],
		},
		{
			name: "Level one 2",
			children: [
				{
					name: "Level two 2-1",
					children: [
						{
							name: "Level three 2-1-1",
						},
					],
				},
				{
					name: "Level two 2-2",
					children: [
						{
							name: "Level three 2-2-1",
						},
					],
				},
			],
		},
		{
			name: "Level one 3",
			children: [
				{
					name: "Level two 3-1",
					children: [
						{
							name: "Level three 3-1-1",
						},
					],
				},
				{
					name: "Level two 3-2",
					children: [
						{
							name: "Level three 3-2-1",
						},
					],
				},
			],
		},
	];

	const handleRename = (node, data) => {
		console.log(11, node, data);
	};

	const handleAdd = () => {
		alert("点击新增");
	};

	const handleClickTree = (a, b, c, d) => {
		console.log(a, b, c, d);
	};
</script>

<style scoped lang="less">
	.wrap {
		display: flex;
		flex-direction: row;
		height: 500px;
	}
	.right-content {
		background: rgb(16, 142, 233);
		width: 100%;
		height: 100%;
	}
</style>
