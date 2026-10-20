---
title: Icon 图标
lang: zh-CN
---

# Icon 图标

Element Plus 提供了一套常用的图标集合。

## 使用图标

- 如果你想像用例一样**直接使用**，你需要[全局注册组件](https://v3.vuejs.org/guide/component-registration.html#global-registration)，才能够直接在项目里使用。

- 如若需要查看所有可用的 SVG 图标请查阅 [@element-plus/icons-vue@1.x](https://unpkg.com/browse/@element-plus/icons-vue@1/dist/es/)[@element-plus/icons-vue@latest](https://unpkg.com/browse/@element-plus/icons-vue@latest/dist/types/components/) 和有关 [Icon Collection](#icon-collection) 的源码 [element-plus-icons](https://github.com/element-plus/element-plus-icons)

## 安装

### 使用包管理器

```shell
# 选择一个你喜欢的包管理器

# NPM
$ npm install @element-plus/icons-vue
# Yarn
$ yarn add @element-plus/icons-vue
# pnpm
$ pnpm install @element-plus/icons-vue
```

### 注册所有图标

您需要从 `@element-plus/icons-vue` 中导入所有图标并进行全局注册。

```ts
// main.ts

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```

您也可以参考 [此模板](https://codepen.io/sxzz/pen/xxpvdrg)。

### 浏览器直接引入

直接通过浏览器的 HTML 标签导入 Element Plus，然后就可以使用全局变量 `ElementPlusIconsVue`了。

根据不同的 CDN 提供商有不同的引入方式， 根据不同的 CDN 提供商有不同的引入方式， 我们在这里以 [unpkg](https://unpkg.com) 和 [jsDelivr](https://jsdelivr.com) 举例。 你也可以使用其它的 CDN 供应商。

#### 使用 unpkg

```html
<script src="//unpkg.com/@element-plus/icons-vue"></script>
```

#### 使用 jsDelivr

```html
<script src="//cdn.jsdelivr.net/npm/@element-plus/icons-vue"></script>
```

:::tip

我们建议使用 CDN 引入 Element Plus 的用户在链接地址上锁定版本，以免将来 Element Plus 升级时受到非兼容性更新的影响。 锁定版本的方法请查看 [unpkg.com](https://unpkg.com)。

:::

### 自动导入

使用 [unplugin-icons](https://github.com/antfu/unplugin-icons) 和 [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import) 从 iconify 中自动导入任何图标集。 您可以参考[此模板](https://github.com/sxzz/element-plus-best-practices/blob/db2dfc983ccda5570033a0ac608a1bd9d9a7f658/vite.config.ts#L21-L58)。

## 基础用法

:::warning

因为 HTML 标准已经定义了一个名为 [menu](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/menu) 的标签， 如果您注册的 `menu` 无法正常工作，您需要使用别名来渲染图标。

:::

```vue
<!-- 使用 te-icon 为 SVG 图标提供属性 -->
<template>
  <div>
    <te-icon :size="size" :color="color">
      <Edit />
    </te-icon>
    <!-- 或者独立使用它，不从父级获取属性 -->
    <Edit />
  </div>
</template>
```

<vp-script setup>
import { Edit, Share, Delete, Search, Loading } from '@element-plus/icons-vue'
</vp-script>

<TeRow>
  <div>
    <TeIcon :size="30">
      <Edit />
    </TeIcon>
    <Edit />
  </div>
</TeRow>

## 结合 te-icon 使用

`te-icon` 为 raw SVG 图标提供额外的属性, 提供的详细属性请继续阅读。

```vue
<template>
  <p>
    with extra class <b>is-loading</b>, your icon is able to rotate 360 deg in 2
    seconds, you can also override this
  </p>
  <te-icon :size="20">
    <Edit />
  </te-icon>
  <te-icon color="#409EFC" class="no-inherit">
    <Share />
  </te-icon>
  <te-icon>
    <Delete />
  </te-icon>
  <te-icon class="is-loading">
    <Loading />
  </te-icon>
  <te-button type="primary">
    <te-icon style="vertical-align: middle">
      <Search />
    </te-icon>
    <span style="vertical-align: middle"> Search </span>
  </te-button>
</template>
```

<TeRow>
  <p>
    通过添加额外的类名 <b>is-loading</b>，你的图标就可以在 2 秒内旋转 360 度，当然你也可以自己改写想要的动画。
  </p>
  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
    <TeIcon :size="20">
      <Edit />
    </TeIcon>
    <TeIcon color="#409EFC" class="no-inherit">
      <Share />
    </TeIcon>
    <TeIcon>
      <Delete />
    </TeIcon>
    <TeIcon class="is-loading">
      <Loading />
    </TeIcon>
    <TeButton type="primary">
      <TeIcon style="vertical-align: middle; color: #fff;">
        <Search />
      </TeIcon>
      <span style="vertical-align: middle;">  </span>
    </TeButton>
  </div>
</TeRow>

## 直接使用 SVG 图标

```vue
<template>
  <div style="font-size: 20px">
    <!-- 由于SVG图标默认不携带任何属性 -->
    <!-- 你需要直接提供它们 -->
    <Edit style="width: 1em; height: 1em; margin-right: 8px" />
    <Share style="width: 1em; height: 1em; margin-right: 8px" />
    <Delete style="width: 1em; height: 1em; margin-right: 8px" />
    <Search style="width: 1em; height: 1em; margin-right: 8px" />
  </div>
</template>
```

<TeRow>
  <div style="font-size: 20px;">
    <!-- Since svg icons do not carry any attributes by default -->
    <!-- You need to provide attributes directly -->
    <Edit style="width: 1em; height: 1em; margin-right: 8px;" />
    <Share style="width: 1em; height: 1em; margin-right: 8px;" />
    <Delete style="width: 1em; height: 1em; margin-right: 8px;" />
    <Search style="width: 1em; height: 1em; margin-right: 8px;" />
  </div>
</TeRow>

## 图标集合{#icon-collection}

:::tip

只要你安装了 @element-plus/icons-vue，**就可以在任意版本里使用 SVG 图标**。

**您可以点击图标复制代码。**

:::

<IconList />

## API

### Attributes

| 属性名   | 说明                    | 类型                    | 默认值    |
| ----- | --------------------- | --------------------- | ------ |
| color | svg 的 fill 颜色         | ^[string]             | 继承颜色   |
| size  | SVG 图标的大小，size x size | ^[number] / ^[string] | 继承字体大小 |

### Slots

| 名称      | 说明      |
| ------- | ------- |
| default | 自定义默认内容 |
