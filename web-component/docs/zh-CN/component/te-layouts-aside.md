---
title: 侧边栏菜单组件
lang: zh-CN
---

## 基础用法

:::demo

te-layouts-aside/basic

:::

## API

### 属性（props）

| 属性名        | 说明                | 类型                       | 是否必要 | 默认值 |
| ------------- | ------------------- | -------------------------- | -------- | ------ |
| sideNavLogo   | 菜单顶部图片        | 图片源地址，同原生属性一致 | 否       | 无     |
| sideNavName   | 菜单顶部标题        | string                     | 否       | 无     |
| menuList      | 数据源数组          | ^[Array]`menuListItem[]`   | 是       | 无     |
| iconList      | 一级菜单 icon 数组  | ^[Array]`component[]`      | 否       | 无     |
| defaultActive | 默认选中节点的 name | string                     | 否       | 无     |

### 插槽（slots）

| 插槽名 | 说明     | 作用域 |
| ------ | -------- | ------ |
| head   | 头部插槽 | 无     |

### 事件（events）

| 事件名                    | 说明                                                    | 接受参数                                       |
| ------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| collapse                  | 是否折叠状态 float：鼠标移入状态、 status：鼠标点击状态 | ^[Function]`(float: bool,status:bool) => void` |
| onSelectItem              | 选中节点事件                                            | ^[Function]`(item: menuListItem) => void`      |
| onMouseEnterFloatMenuItem | 鼠标进入可弹出悬浮操作 item 区域事件                    | ^[Function]`(item: menuListItem) => void`      |
| onMouseLeaveFloatMenuItem | 鼠标离开可弹出悬浮操作 item 区域事件                    | ^[Function]`(item: menuListItem) => void`      |

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
```

</details>
