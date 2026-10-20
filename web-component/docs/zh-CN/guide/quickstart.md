---
title: 快速开始
lang: zh-CN
---

# @tiansu/ts-web-package 组件库

### 快速开始

#### 1.安装组件库

配置npm以tiansu开头的包走私服镜像：

```bash
npm config set @tiansu:registry=http://192.168.20.200:7049/repository/npm-public/
```

安装：

```bash
npm i @tiansu/ts-web-package
```

#### 2.引用组件库

```javascript
// 全局全部引入  main.ts
import '@tiansu/ts-web-package/dist/styles/index.css';
import TSUI from '@tiansu/ts-web-package';
createApp(App).use(TSUI);

//全局单个引入 main.ts
import { TeButton } from '@tiansu/ts-web-package'; 或  import { TeButton } from '@tiansu/ts-web-package/ts-card';
createApp(App).use(TeButton);

// 按需单个引入 需要的模块的ts中
<script>
import { TeButton } from '@tiansu/ts-web-package'; 
export default {
  components: {
    TeButton
  },
  setup() {
  },
};
</script>
```

#### 3.暗黑模式处理

需导入以下样式：
```js
import '@tiansu/ts-web-package/dist/styles/element/dark.css'
```

#### 4.注意事项

使用 `@tiansu/element-plus`基础库组件和样式常量时，要以 `te`开头

```javascript
<te-dropdown>
    <span class="te-dropdown-link">
      Dropdown List
      <te-icon class="te-icon--right">
        <arrow-down />
      </te-icon>
    </span>
    <template #dropdown>
      <te-dropdown-menu>
        <te-dropdown-item>Action 1</te-dropdown-item>
        <te-dropdown-item>Action 2</te-dropdown-item>
        <te-dropdown-item>Action 3</te-dropdown-item>
        <te-dropdown-item disabled>Action 4</te-dropdown-item>
        <te-dropdown-item divided>Action 5</te-dropdown-item>
      </te-dropdown-menu>
    </template>
 </te-dropdown>
 ...
.te-dropdown-link {
  cursor: pointer;
  color: var(--te-color-primary); // 常量名
  display: flex;
  align-items: center;
}
```

