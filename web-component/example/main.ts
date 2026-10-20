import { createApp } from "vue";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";

import "../packages/dist/styles/index.css";
// import ElementPlus from 'element-plus'
// import 'components/styles/index.scss'
import "@/components/styles/index.scss";
// import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ColSettingBtn, TeTableButtonGroup, TeModuleTable, Te401 } from "@/components/lib";
const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/401",
			component: () => Te401,
		},
		{
			path: "/",
			name: "Index",
			component: () => import("./layout.vue"),
			redirect: "/test1",
			children: [
				{
					path: "/test1",
					name: "test1",
					component: () => import("./HelloWorld.vue"),
					meta: {
						hidden: false,
						keepAlive: true,
						title: "测试1",
					},
				},
				{
					path: "/test2",
					name: "test2",
					component: () => import("./HelloWorld1.vue"),
					meta: {
						hidden: false,
						keepAlive: true,
						title: "测试2",
						key: "test2",
					},
				},
				{
					path: "/test3",
					name: "test3",
					component: () => import("./HelloWorld2.vue"),
					meta: {
						hidden: false,
						keepAlive: true,
						title: "测试3",
						key: "test3",
					},
				},
			],
		},
	],
	scrollBehavior: () => ({ left: 0, top: 0 }),
});
router.beforeEach((to) => {
	console.log(to);
});
const app = createApp(App);
app.use(router);
// app.use(TSUI)
// app.use(ElementPlus, { locale: zhCn } as any)

app.mount("#app");

class Control {
	private state: any;
}

interface SubControl extends Control {
	slect(): void;
}

class Button extends Control implements SubControl {
	slect(): void {}
}

class Image implements SubControl {
	slect(): void {}
}
