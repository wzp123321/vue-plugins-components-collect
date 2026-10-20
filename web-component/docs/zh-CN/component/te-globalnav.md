---
title: Search 搜索框
lang: zh-CN
---

## 基础用法

:::demo

te-globalnav/basic

:::

## API

### 属性（props）

| 属性名      | 说明               | 类型   | 是否必要 | 默认值 |
| ----------- | ------------------ | ------ | -------- | ------ |
| logo | logo标志 | string | 是       | ''    |
| title | 标题 | string | 是       | ''    |
| leftMenuConfig | 左侧菜单列表，内部元素类型：导入类型`import type { globalnavMenuItem } from '@tiansu/ts-web-package';` | array | 否    | 无    |
| rightMenuConfig | 右侧菜单列表，内部元素类型：导入类型`import type { globalnavMenuItem } from '@tiansu/ts-web-package';` | array | 否    | 无    |
| hospitalConfig | 院区配置：导入类型`import type { globalnavMenuItem } from '@tiansu/ts-web-package';` | object | 否    | 无    |
| userinfoConfig | 用户信息配置：'{avatar: string, nickname: string, organizationList（组织列表配置）: [导入类型`import type { globalnavMenuItem } from '@tiansu/ts-web-package';`], configList（设置、退出登录等配置）: [导入类型`import type { globalnavMenuItem } from '@tiansu/ts-web-package';`]}' | object | 否    | 无    |

### 事件（events）

| 事件名 | 说明                 | 接受参数 |
| ------ | -------------------- | -------- |
| menuChanged  | 菜单选中状态切换事件 | 当前选中菜单节点对象{} |
| hospitalChanged  | 院区复选确定事件 | 当前选中院区集合[] |

### 插槽（slot）

| 插槽名              | 说明                                                                                     | 子标签 |
| ------------------- | ---------------------------------------------------------------------------------------- | ------ |
| globalnav-right-custom | 右侧菜单区插槽 | ——     |
| globalnav-project-custom | 右侧院区选择插槽，但以hospitalConfig优先 | ——     |
| globalnav-user-custom | 右侧用户信息插槽，但以userinfoConfig优先 | ——     |

## 类型声明

<details>
  <summary>显示类型声明</summary>

```ts
import type { globalnavMenuItem } from '@tiansu/ts-web-package';

export enum globalnavChooseMode {
    multiple = "multiple", // 多选
    single = "single" // 单选
}

export type globalnavMenuItem = {
    type: string, // 唯一类型表示
    title: string, // 标题
    count: number, // 数量
    icon: Component, // icon图标
    divided: boolean, // 是否展示分割线
    checked: boolean, // 是否选中
    chooseMode?: globalnavChooseMode, // 选择模式
    list?: globalnavMenuItem[] // 下拉列表
}

type navUserinfo = {
    avatar?: string,
    nickname: string,
    organizationList?: globalnavMenuItem[],
    configList: globalnavMenuItem[]
}
```

</details>