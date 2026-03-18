---
name: "vue-ts-naming-convention"
description: "定义 Vue 项目中 TypeScript 类型（Interface/Type）的命名规范。在定义公共类型或业务模型时调用此技能。"
---

# TypeScript 类型命名规范 (TypeScript Naming Conventions)

本技能定义了项目中 TypeScript 类型（接口、类型别名）的统一命名规则，以确保代码的可读性和模块化识别。

## 1. 公共类型 (Common Types)
公共类型是指在全局范围内通用、不属于特定业务逻辑的类型。
- **前缀**: `ICommon`
- **规则**: 以 `ICommon` 开头，后接描述性名称。
- **示例**:
  ```typescript
  // 键值对通用类型
  interface ICommonKeyValue<T> {
    key: T;
    value: string;
  }

  // 通用分页响应
  interface ICommonPageResult<T> {
    list: T[];
    total: number;
  }
  ```

## 2. 业务类型 (Business Types)
业务类型是指属于特定功能模块或页面的数据模型。
- **前缀**: `I` + `[业务前缀缩写]`
- **规则**:
  1. 以 `I` 开头。
  2. 紧接业务模块名称的缩写（通常为各单词首字母，或模块名缩写）。
  3. 后接具体的对象名称和后缀（如 `VO`, `DTO`, `Param`）。
- **示例**:
  - **用户管理 (User Manage)**: 缩写为 `Um`
    ```typescript
    // 用户对象
    interface IUmUserVO {
      id: string;
      username: string;
    }

    // 用户查询参数
    interface IUmUserQueryParam {
      keywords: string;
      roleId?: number;
    }
    ```
  - **设备监控 (Device Monitor)**: 缩写为 `Dm`
    ```typescript
    // 设备详情
    interface IDmDeviceDetail {
      deviceId: string;
      status: 'online' | 'offline';
    }
    ```

## 3. 适用场景
- **定义 API 响应**: 在 `apis/**/index.api.ts` 中定义接口返回数据结构时。
- **定义组件 Props**: 为业务组件定义 `Props` 类型时。
- **定义 Store 状态**: 在 Pinia store 中定义 `State` 类型时。

## 4. 优势
- **即时识别**: 通过前缀一眼看出类型是全局通用的还是特定业务的。
- **避免冲突**: 业务缩写有效减少了不同模块间重名类型的冲突风险。
