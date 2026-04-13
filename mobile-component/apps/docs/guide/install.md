# 安装

`phillUI` 是一款基于 UniApp 的优秀 UI 框架，支持 UniApp X 和普通 UniApp。

## NPM 安装

推荐使用 npm 安装，方便后期直接升级版本。

```bash
# 如果是在 npm 环境下
npm install phillui-ui
```

## 引入方式

### 1. 配置 easycom

在 `pages.json` 中配置 `easycom`：

```json
{
  "easycom": {
    "autoscan": true,
    "custom": {
      "^up-(.*)": "phillui-ui/components/up-$1/up-$1.vue"
    }
  },
  "pages": [
    // ...
  ]
}
```

> [!NOTE]
> 这只是一个基础示例，具体的引入路径取决于你的项目结构。

### 2. 主题根容器（推荐）

主题切换推荐使用 `tsm-theme-provider` 作为页面根容器，只需要在页面最外层包一层，不需要每个子组件单独挂 class。

```vue
<template>
  <tsm-theme-provider>
    <view class="page">
      <tsm-button type="primary">主要按钮</tsm-button>
      <tsm-text type="info" text="主题文本" />
      <tsm-tag type="success" text="成功标签" />
    </view>
  </tsm-theme-provider>
</template>
```

如果你想固定某个页面主题，可直接传 `mode`：

```vue
<tsm-theme-provider mode="dark">
  <view class="page">...</view>
</tsm-theme-provider>
```

### 3. 运行时切换主题

在页面或组件中直接引入 tokens API 进行切换：

```ts
import { setThemeMode } from '@/uni_modules/@tiansu/ts-mobile-token/index';

setThemeMode('dark');
setThemeMode('light');
```
