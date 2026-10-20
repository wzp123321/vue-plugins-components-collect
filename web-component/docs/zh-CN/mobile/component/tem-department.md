---
title: 部门选择
lang: zh-CN
---

## 基础用法

使用的 mock 接口数据，数据展示不准确

:::demo

mobile/tem-department/index

:::

## API

### 属性（props）

| 属性名                 | 说明                                           | 类型                | 是否必要 | 默认值   |
| ---------------------- | ---------------------------------------------- | ------------------- | -------- | -------- |
| v-model:selected       | 选中部门：[{ id:xxx,...}]                      | array               | 是       | -        |
| http                   | Request 实例                                   | Request             | 是       | -        |
| tenantId               | tenantId                                       | string              | 是       | -        |
| organizationId         | 组织 id                                        | string              | 否       | -        |
| title                  | 顶部标题                                       | string              | 否       | 选择部门 |
| multiple               | 是否多选                                       | boolean             | 否       | false    |
| multiple-limit         | 多选场景下最多可以选择的项目数，最大 500       | number              | 否       | 500      |
| history-storage-key    | 历史选择缓存的 key，有值时搜索时会展示历史选择 | string              | 否       | -        |
| history-num-limit      | 历史选择展示数量                               | number              | 否       | 8        |
| default-check-strictly | 多选时默认任选 (传 false 则默认联选)           | boolean             | 否       | true     |
| data-permission-check  | 部门树接口数据权限参数                         | DataPermissionCheck | 否       | -        |

## 方法

| 方法称名 | 说明 | 参数 |
| -------- | ---- | ---- |
| open     | 打开 | -    |
| close    | 关闭 | -    |

## 类型声明

<details>
  <summary>显示类型声明</summary>

```ts
interface DataPermissionCheck {
  // 应用实例id
  appInstanceId: Nullable<string>;
  // 员工id，如果header的携带了用户token优先识别token值
  employeeId: Nullable<string>;
  // 数据权限作用域
  scopeCode: Nullable<string>;
}
```

</details>
