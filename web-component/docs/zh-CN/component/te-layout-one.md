---
title: 统一布局组件
lang: zh-CN
---

## 基础用法

:::demo

te-layout-one/basic

:::

## API

### 属性（props）

| 属性名          | 说明                         | 类型                                      | 是否必要 | 默认值                   |
| --------------- | ---------------------------- | ----------------------------------------- | -------- | ------------------------ |
| sideNavLogo     | 菜单顶部图片                 | 图片源地址，同原生厲性一致                | 否       | 无                       |
| sideNavName     | 菜单顶部标题                 | string                                    | 否       | 无                       |
| menuList        | 数据源数组                   | ^[Array]`menuListItem[]`                  | 是       | 无                       |
| iconList        | 一级菜单 icon 数组           | ^[Array]`component[]`                     | 否       | 无                       |
| defaultActive   | 默认选中节点的 name          | string                                    | 否       | 无                       |
| logo            | logo 标志                    | string                                    | 是       | ''                       |
| navTitle        | 标题                         | string                                    | 是       | ''                       |
| leftMenuConfig  | 左侧菜单列表                 | ^[Array]`globalnavMenuItem[]`             | 否       | 无                       |
| rightMenuConfig | 右侧菜单列表                 | ^[Array]`globalnavMenuItem[]`             | 否       | 无                       |
| hospitalConfig  | 院区配置                     | globalnavMenuItem                         | 否       | 无                       |
| v-model:tags    | 页签列表                     | ^[Array]`RouteLocationNormalizedLoaded[]` | 否       | 无                       |
| activeName      | 当前激活页签对应路由组件名称 | string                                    | 否       | 无                       |
| userinfoConfig  | 用户信息配置                 | navUserinfo                               | 否       | 无                       |
| components      | 子组件集合                   | string                                    | 否       | 'menu\|tagsView\|topNav' |
| keep-alives     | 需要缓存组件的 name          | string[]                                  | 否       | []                       |
| onTagClickFn    | 点击当前页签触发的函数       | Function                                  | 否       | null                     |

### 插槽（slots）

| 插槽名  | 说明     | 作用域 |
| ------- | -------- | ------ |
| head    | 头部插槽 | 无     |
| default | 默认插槽 | 无     |

### 事件（events）

| 事件名                    | 说明                                                    | 类型                                                      |
| ------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| collapse                  | 是否折叠状态 float：鼠标移入状态、 status：鼠标点击状态 | ^[Function]`(float: bool,status:bool) => void`            |
| onSelectItem              | 选中节点事件                                            | ^[Function]`(item: menuListItem) => void`                 |
| onMouseEnterFloatMenuItem | 鼠标进入可弹出悬浮操作 item 区域事件                    | ^[Function]`(item: menuListItem) => void`                 |
| onMouseLeaveFloatMenuItem | 鼠标离开可弹出悬浮操作 item 区域事件                    | ^[Function]`(item: menuListItem) => void`                 |
| tag-change                | 页签改变触发                                            | ^[Function]`(tag: RouteLocationNormalizedLoaded) => void` |
| refresh                   | 右键点击刷新触发                                        | ^[Function]`(tag: RouteLocationNormalizedLoaded) => void` |
| close                     | 关闭页签触发                                            | ^[Function]`(tag: RouteLocationNormalizedLoaded) => void` |

### 使用说明

** 案例详见脚手架模版工程 **

## 类型声明

<details>
  <summary>显示类型声明</summary>

```ts
import type { RouteLocationNormalizedLoaded } from "vue-router";

import type { globalnavMenuItem } from "@tiansu/ts-web-package";

interface menuListItem {
	meta: {
		title: string;
		icon: string;
		floatEnable: boolean;
	};
	name: string;
	parentName: string;
}

export enum globalnavChooseMode {
	multiple = "multiple", // 多选
	single = "single", // 单选
}

export type globalnavMenuItem = {
	type: string; // 唯一类型表示
	title: string; // 标题
	count: number; // 数量
	icon: Component; // icon图标
	divided: boolean; // 是否展示分割线
	checked: boolean; // 是否选中
	chooseMode?: globalnavChooseMode; // 选择模式
	list?: globalnavMenuItem[]; // 下拉列表
};

type navUserinfo = {
	avatar?: string;
	nickname: string;
	organizationList?: globalnavMenuItem[];
	configList: globalnavMenuItem[];
};
```

</details>
