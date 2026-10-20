<template>
	<TeLayoutOne
		ref="layoutRef"
		navTitle="运营平台"
		:hospitalConfig="data.hospitalConfig"
		:userinfoConfig="data.userinfoConfig"
		v-model:tags="list"
		logo=""
		sideNavName="患者服务"
		:keep-alives="keepAlives"
		:menuList="menuList"
		@onSelectItem="selectMenu($event)"
		:sideNavLogo="logoUrl"
		:iconList="iconList"
		@collapse="collapse"
		:onTagClickFn="onTagClickFn"
		@close="close">
	</TeLayoutOne>
</template>

<script lang="ts" setup>
	import { TeLayoutOne } from "@/components/lib";
	import "@/components/styles/index.scss";
	import logoUrl from "./tsLogo.png";
	import { IconAlarm, IconOperation, IconSwitchButton, IconOfficeBuilding, IconYuanqu, IconService, IconWorkBench } from "@arco-iconbox/vue-te/esm";
	import { reactive, markRaw, ref, shallowRef, Component } from "vue";
	import { useRouter } from "vue-router";
	const router = useRouter();
	const layoutRef = ref();
	const hospitalChanged = (hospitalList: []) => {};
	const iconList = shallowRef<Array<Component>>([]);
	const onTagClickFn = (item) => {
		console.log(item);
		if (iconList.value.length) {
			iconList.value = [];
		} else {
			iconList.value = [IconWorkBench];
		}
	};

	const selectMenu = (val) => {
		router.push({
			path: val.path,
		});
	};
	const collapse = (flag, status) => {
		console.log(flag, status);
	};
	const menuList = ref([
		{
			name: "DiagnosisPathManage",
			parentName: null,
			meta: {
				hidden: false,
				icon: "work_bench",
				title: "诊疗路径管理",
			},
			children: [
				{
					path: "/test1",
					name: "DiagnosisNodeManage",
					parentName: "DiagnosisPathManage",
					meta: {
						hidden: false,
						icon: null,
						title: "诊疗节点管理",
					},
				},
				{
					path: "/test2",
					name: "PathPlan",
					parentName: "DiagnosisPathManage",
					meta: {
						hidden: false,
						icon: null,
						title: "路径规划",
					},
				},
			],
		},
	]);
	const rightMenuConfig = [
		{
			type: "alarm",
			icon: IconAlarm,
			count: 100,
			list: [
				{
					type: "critical",
					title: "严重告警",
					count: 80,
				},
				{
					type: "major",
					title: "重要告警",
					count: 70,
				},
			],
		},
	];

	const data = reactive({
		leftConfig: [
			{
				type: "zhongshan1",
				title: "服务",
				icon: markRaw(IconService),
				checked: true,
			},
			{
				type: "zhongshan2",
				title: "工作台",
				icon: markRaw(IconWorkBench),
			},
		],
		hospitalConfig: {
			type: "hospital",
			icon: markRaw(IconYuanqu),
			title: "院区",
			count: 100,
			list: [
				{
					title: "中山院区",
					checked: true,
				},
				{
					title: "中山院区22",
				},
			],
		},
		userinfoConfig: {
			nickname: "超级管理员",
			avatar: "",
			organizationList: [
				{
					type: "zhongshan1",
					title: "中山医院组织1",
					icon: markRaw(IconOfficeBuilding),
					checked: true,
				},
				{
					type: "zhongshan2",
					title: "中山医院组织2",
					icon: markRaw(IconOfficeBuilding),
				},
			],
			configList: [
				{
					type: "zhongshan",
					divided: true,
					title: "偏好设置",
					icon: markRaw(IconOperation),
				},
				{
					type: "zhongshan",
					title: "退出登录",
					icon: markRaw(IconSwitchButton),
				},
			],
		},
	});
	const list = ref([
		{
			fullPath: "/test1",
			path: "/test1",
			query: {},
			hash: "",
			name: "test1",
			params: {},
			meta: {
				hidden: false,
				keepAlive: true,
				title: "测试1",
			},
		},
		{
			fullPath: "/test2",
			path: "/test2",
			query: {},
			hash: "",
			name: "test2",
			params: {},
			meta: {
				hidden: false,
				keepAlive: true,
				title: "测试2",
			},
		},
		{
			fullPath: "/test3",
			path: "/test3",
			query: {},
			hash: "",
			name: "test3",
			params: {},
			meta: {
				hidden: false,
				keepAlive: true,
				title: "测试3",
			},
		},
	]);
	const keepAlives = ref(["Acom", "Bcom"]);
	const close = (item) => {
		console.log(item);
	};
</script>
