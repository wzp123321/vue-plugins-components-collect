---
title: DynamicTable 动态增删表格组件
lang: zh-CN
---

动态增删表格组件。

## 基础用法

:::demo

te-dynamic-table/basic

:::

## API

### 属性（props）

| 属性名       | 说明                                                                                                                                                                                                                                                                                                                                                                                                  | 类型                         | 是否必要 | 默认值 |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------- | ------ |
| v-model      | 绑定值，可绑定一个数组                                                                                                                                                                                                                                                                                                                                                                                | any[]                        | 是       | []     |
| mode         | 编辑模式，preview 仅提供最简单的预览，如需进行数据展示，请使用[TeModuleTable](/zh-CN/component/te-module-table.md)                                                                                                                                                                                                                                                                                    | edit \| preview              | 否       | edit   |
| columns      | 配置表格列，type 可指定渲染不同类型组件，内部封装了五种基本组件，如需自定义组件，可将 type 定义为`slot`，并通过插槽使用自定义组件。type 不属于五种类型之中的，会渲染成普通文本。其中 elementAttrs 可接受组件的属性，如 Input 的 placeholder、maxLength 等。columnAttrs 为表格列属性，配置同[TeTableColumn 属性](/zh-CN/component/table.md#table-column-属性)。详细类型定义见下方[类型声明](#类型声明) | Columns[]                    | 是       | []     |
| required     | 表格整体是否必填，若整体必填，则会至少保留一条数据，且不可删除                                                                                                                                                                                                                                                                                                                                        | boolean                      | 否       | 是     |
| maxCount     | 表格最大添加数量                                                                                                                                                                                                                                                                                                                                                                                      | number                       | 否       |        |
| showIndex    | 是否展示序号列                                                                                                                                                                                                                                                                                                                                                                                        | boolean                      | 否       | false  |
| showDragRow    | 是否开启行拖拽排序                                                                                                                                                                                                                                                                                                                                                                                        | boolean                      | 否       | false  |
| tableSize    | 表格尺寸                                                                                                                                                                                                                                                                                                                                                                                              | large \| default \| small    | 否       | large  |
| handleAdd    | 自定义添加方法，覆盖内部默认添加一行的操作                                                                                                                                                                                                                                                                                                                                                            | ^[Function]`() => void`      | 否       |
| handleDelete | 自定义删除方法，覆盖内部默认删除一行的操作                                                                                                                                                                                                                                                                                                                                                            | ^[Function]`(scope) => void` | 否       |

其余参数同[TeTable 属性](/zh-CN/component/table.md#table-%E5%B1%9E%E6%80%A7)

### 方法（method）

dynamicTableRef 可以调用的方法
| 方法名 | 说明 | 参数 |
| ----------- | ------------------ | -------- |
| validateData | 执行表格校验，可自行传入回调函数，回调函数中可获取校验结果、校验失败项、表格数据 | ^[Function]`validaetCallback:(valid:boolean,fields:FormValidateCallback,data:Array<any>) => void` |
| resetTable | 重置表格为初始状态且重置所有校验 | —— |

### 事件（events）

| 事件名    | 说明     | 接受参数                                          |
| --------- | -------- | ------------------------------------------------- |
| addRow    | 添加一行 | ^[当前表格的数据长度]`tableLength:number`         |
| deleteRow | 删除一行 | ^[删除的数据(包括行号)]`data:{$index,...rowData}` |

### Expose

| 名称        | 说明                               | 参数 |
| ----------- | ---------------------------------- | ---- |
| editFormRef | 内部表单 ref，可执行表单校验等操作 | ——   |
| tableRef    | 内部表格 ref，可获取表格 dom       | ——   |

表单 Ref 使用方式同[Form 表单 Expose](/zh-CN/component/form.md#form-exposes)

### 插槽（slot）

| 插槽名              | 说明                                                                                     | 子标签 |
| ------------------- | ---------------------------------------------------------------------------------------- | ------ |
| tablePropName(动态) | 自定义表格列，可传入自定义组件，并使用 v-model 绑定属性，详细用法见[代码示例](#基础用法) | ——     |
| header-tablePropName(动态) | 自定义表格头，可传入自定义组件 | ——     |

其他插槽同[TeTable 插槽](/zh-CN/component/table.md#table-%E6%8F%92%E6%A7%BD)

## 类型声明

<details>
  <summary>显示类型声明</summary>

```ts
// 常用的输入类型
export enum EditType {
  INPUT = "input",
  INPUT_NUMBER = "inputNumber",
  SELECT = "select",
  DATA_PICKER = "datePicker",
  SLOT = "slot",
}
// 组件属性（透传）
interface ElementAttrs {
  // 提示语
  placeholder?: string;
  // 下拉框是否多选
  mutilple?: boolean;
  // 透传组件的属性
  [prop: string]: any;
}

// 表格列属性
interface Columns {
  // 类型
  type: `${EditType}`;
  // 显示的标题
  label: string;
  // 表格列的属性
  prop: string;
  // 下拉框的数据源
  dataSource?: Array<{ id?: string | number; label: string; value: string }>;
  // tableColumn属性
  columnAttrs?: {
    [prop: string]: any;
  };
  // 组件属性
  elementAttrs?: ElementAttrs;
  // 表单校验规则
  rules?: FormRules[];
  listeners?: any;
}

// 动态表格传入参数
interface DynamicTableProps {
  modelValue: Array<any>;
  // 表格列属性
  columns: Array<Columns>;
  // 使用模式，编辑和预览
  mode?: `${MODE}`;
  // 表格尺寸
  tableSize?: `${TABLE_SIZE}`;
  // 可添加的最大数量
  maxCount?: number;
  // 表格是否必填，表格必填时将会默认保留一行不可删除
  required?: boolean;
  // 是否展示序号列
  showIndex?: boolean;
  // 添加和删除内部已经封装了默认行为，如需覆盖，可直接从props传入方法覆盖默认行为
  handleAdd?: () => void;
  handleDelete?: (scope) => void;
}
```

</details>
