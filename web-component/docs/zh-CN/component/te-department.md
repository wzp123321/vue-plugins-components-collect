---
title: 部门选择
lang: zh-CN
---

## 单选

:::demo

te-department/single

:::

## 多选 任选

:::demo

te-department/multiple

:::

## 多选 联选（父子节点联动选中）

:::demo

te-department/relative-multiple

:::

## API

### 属性（props）

| 属性名               | 说明                                     | 类型                | 是否必要 | 默认值 |
| -------------------- | ---------------------------------------- | ------------------- | -------- | ------ |
| v-model:visible      | 弹窗是否显示                             | boolean             | 是       | false  |
| v-model:selected     | 选中部门：[{ id:xxx,...}]                | array               | 是       | -      |
| axiosInstance        | axios 实例                               | axios               | 是       | -      |
| tenantId             | tenantId                                 | string              | 是       | -      |
| organizationId       | 组织 id                                  | string              | 否       | -      |
| multiple             | 是否多选                                 | boolean             | 否       | false  |
| multiple-limit       | 多选场景下最多可以选择的项目数，最大 500 | number              | 否       | 500    |
| defaultCheckStrictly | 多选时默认任选 (传 false 则默认联选)     | boolean             | 否       | true   |
| dataPermissionCheck  | 部门树接口数据权限参数                   | DataPermissionCheck | 否       | -      |

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
