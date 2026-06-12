# UniApp X 与 UniApp 差异

UniApp X 是基于 UniApp 的升级版本，采用 UTS 作为编程语言。UTS 是一门为编译为原生语言（Kotlin/Swift）而设计的强类型语言，相比传统 Web 技术栈的 UniApp，UTS 在语法、类型系统、CSS 等方面有诸多限制。

本文档详细记录 UniApp X（UTS）与 UniApp（TS）之间的差异，方便开发者在迁移和适配时参考。

## 一、UTS 与 TypeScript 差异

参考 UniApp 官方文档 <https://doc.dcloud.net.cn/uni-app-x/uts/uts_diff_ts.html>

### 1. UTSObject 与 UTSJSONObject

这是 UTS 中最重要的类型概念区别：

| 类型              | 说明                                                 |
| ----------------- | ---------------------------------------------------- |
| **UTSObject**     | UTS 中的对象类型，编译时类型确定，支持强类型属性访问 |
| **UTSJSONObject** | 类似 JS 的普通对象，编译时类型为动态 JSON 对象       |

```typescript
// UTSJSONObject - 所有没有明确类型的对象字面量
const obj1 = { name: 'test', age: 18 }; // 推导为 UTSJSONObject

// UTSObject - 明确声明 type
type Person = { name: string; age: number };
const obj2: Person = { name: 'test', age: 18 }; // UTSObject
```

**注意事项**：

- 对象字面量默认为 `UTSJSONObject`，不支持强类型属性访问
- `JSON.parse()` 返回值为 `UTSJSONObject`
- 需使用 `type` 定义对象结构，才能获得强类型支持

### 2. 类型系统

| 特性                 | TS       | UTS                          |
| -------------------- | -------- | ---------------------------- |
| 静态类型             | 可选     | 必须                         |
| undefined            | 支持     | 不支持，用 `null`            |
| 强类型 `any`         | 任意类型 | 仅表示非空类型，需转换后使用 |
| 结构化类型           | 支持     | 不支持，需用继承/实现关系    |
| `unknown`            | 支持     | 仅限泛型中使用               |
| `interface` 作为类型 | 支持     | 不支持，需用 `type`          |

### 3. 对象和类型声明

```typescript
// TS ✅ | UTS ❌
interface Props {
  name: string;
} // 不支持
type Props = { name: string }; // 支持

// TS ✅ | UTS ❌
const obj: { name: string } = { name: 'test' }; // 不支持
type Obj = { name: string };
const obj: Obj = { name: 'test' }; // 支持

// 嵌套对象需拆分为独立 type
type Inner = { b: number };
type Outer = { inner: Inner }; // 支持
type Outer = { inner: { b: number } }; // 不支持
```

### 4. 类和对象

| 特性            | 说明                                    |
| --------------- | --------------------------------------- |
| `#private` 字段 | 不支持，用 `private` 关键字             |
| 索引访问字段    | 不支持 `obj[field]`，只能用 `obj.field` |
| 静态块          | 不支持，用构造函数实现                  |
| `class` 作为值  | 不支持                                  |
| `implements`    | 类不允许 `implements`，只有接口可以     |
| 接口继承类      | 不支持，接口只能继承接口                |

### 5. 函数

| 特性                       | 说明                   |
| -------------------------- | ---------------------- |
| 函数声明作为值             | 不支持，用函数表达式   |
| `Function.apply/call/bind` | 不支持                 |
| 函数属性                   | 不支持                 |
| 构造函数类型               | 不支持，用 lambda 函数 |

### 6. 特殊语法

| 特性              | 说明                     |
| ----------------- | ------------------------ |
| `Symbol()`        | 不支持                   |
| `index signature` | 不支持，用数组替代       |
| `as const`        | 不支持                   |
| `is` 运算符       | 不支持，用 `instanceof`  |
| 类型转换          | 仅支持 `as T` 语法       |
| 声明合并          | 不支持                   |
| 生成器函数        | 不支持，用 `async/await` |
| JSX               | 不支持                   |
| `with` 语句       | 不支持                   |
| `globalThis`      | 不支持                   |
| `delete` 运算符   | 不支持                   |
| 赋值返回值        | 不支持 `if (a = b)`      |

### 7. 条件与运算

| 特性          | 说明                       |
| ------------- | -------------------------- |
| 隐式类型转换  | 不支持，条件必须为布尔类型 |
| `!` 断言      | 不支持确定赋值断言         |
| `?.` 链式调用 | 部分支持                   |
| `??` 空值合并 | 支持                       |

### 8. 模块

| 特性        | 说明                    |
| ----------- | ----------------------- |
| `namespace` | 不支持，用 class 或模块 |
| `require`   | 不支持，用 `import`     |
| `export =`  | 不支持，用 `export`     |

### 9. 实用工具类型

UTS 不支持 TypeScript 的 Utility Types，包括：
`Partial`、`Required`、`Readonly`、`Pick`、`Omit`、`Exclude`、`Extract`、
`NonNullable`、`Parameters`、`ReturnType`、`InstanceType`、`Record` 等。

### 10. 其他限制

- 变量必须先声明后使用（无 hoisting）
- `type`/`interface` 不能出现在局部作用域
- `throw` 只支持 `Error` 类
- 数组越界在 Kotlin/Swift 平台会抛异常
- Enum 初始化器仅支持数字或字符串
- Enum 必须是顶级声明

## 二、CSS 限制

<!-- 待补充 -->

1. color,font-size等作用于文字的样式只对\<text>标签包裹的文字起作用

## 三、总结

1. **用** **`type`** **替代** **`interface`** 定义对象类型
2. **用** **`null`** **替代** **`undefined`**
3. **条件语句使用显式布尔值**
4. **用** **`class`** **替代具有 call/construct signature 的类型**
5. **避免使用 TS 特有语法**：`as const`、`is`、`?.` 链式需谨慎
6. **嵌套对象拆分**为独立 type
7. **注意** **`UTSJSONObject`** **与** **`UTSObject`** **的区别**，需要强类型时用 `type` 声明
8. uniapp-x不支持img标签，需要使用image标签
