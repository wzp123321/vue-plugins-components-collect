---
title: 快速开始
lang: zh-CN
---

# @tiansu/ts-mobile-package 组件库

### 快速开始

#### 1.安装组件库

配置npm以tiansu开头的包走私服镜像：

```bash
npm config set @tiansu:registry=http://192.168.20.200:7049/repository/npm-public/
```

安装：

```bash
npm i @tiansu/ts-mobile-package
```

#### 2.引用组件库

```javascript
// 引入样式
import '@tiansu/ts-mobile-package/dist/styles/index.css';

// 按需单个引入 需要的模块的ts中
<script>
import { TemButton } from '@tiansu/ts-mobile-package';
export default {
  components: {
    TemButton
  },
  setup() {
  },
};
</script>
```

