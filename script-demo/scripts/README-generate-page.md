# 页面代码生成脚本使用说明

## 简介

`generate-page.js` 是一个代码生成脚本，用于根据 `userManage` 页面模板快速生成新的页面代码。

## 使用方法

### 方式一：使用 npm 脚本（推荐）

```bash
npm run generate-page <模块名称> [模块中文名]
```

### 方式二：直接使用 node

```bash
node scripts/generate-page.js <模块名称> [模块中文名>
```

## 参数说明

- **模块名称**（必需）：使用驼峰命名法，如 `orderManage`、`productManage`
- **模块中文名**（可选）：模块的中文名称，如 `订单管理`、`产品管理`。如果不提供，将使用模块名称

## 使用示例

```bash
# 生成订单管理页面
npm run generate-page orderManage 订单管理

# 生成产品管理页面（不提供中文名）
npm run generate-page productManage
```

## 生成的文件结构

脚本会在以下位置生成文件：

```
src/
├── views/
│   └── <模块名称>/
│       ├── index.vue              # 页面主文件
│       ├── constant.ts            # 常量文件
│       ├── modules/
│       │   ├── createForm.vue     # 创建表单组件
│       │   ├── detail.vue         # 详情组件（如果存在）
│       │   └── editForm.vue       # 编辑表单组件（如果存在）
│       ├── components/            # 组件目录
│       └── hooks/
│           └── useBtnHandles.ts   # 操作按钮 Hook（如果存在）
└── apis/
    └── <模块名称>/
        ├── index.ts               # API 主文件
        ├── index.api.ts           # API 类型定义
        └── index.mock.ts          # Mock 数据文件
```

## 生成后的手动工作

脚本生成代码后，你需要手动完成以下工作：

1. **修改表格列配置**
   - 编辑 `src/views/<模块名称>/index.vue`
   - 根据实际业务需求修改表格列配置

2. **修改搜索参数**
   - 编辑 `src/views/<模块名称>/constant.ts`
   - 根据实际业务需求修改 `SEARCH_PARAMS` 和 `TABLE_PARAMS`

3. **修改类型定义**
   - 编辑 `src/apis/<模块名称>/index.api.ts`
   - 根据实际业务需求修改 `FormData`、`QueryParams`、`ListRow` 接口

4. **修改 Mock 数据**
   - 编辑 `src/apis/<模块名称>/index.mock.ts`
   - 根据实际业务需求修改 Mock 数据和表格列配置

5. **修改表单字段**
   - 编辑 `src/views/<模块名称>/modules/createForm.vue`
   - 根据实际业务需求添加表单字段

6. **添加路由配置**
   - 在路由配置文件中添加新页面的路由

## 注意事项

1. 模块名称必须使用驼峰命名法（camelCase）
2. 脚本会自动处理命名转换：
   - 驼峰命名：`orderManage`
   - 帕斯卡命名：`OrderManage`
   - 短横线命名：`order-manage`
3. 如果模板文件不存在，脚本会跳过该文件的生成
4. 生成的文件会覆盖已存在的同名文件，请谨慎使用

## 模板说明

脚本基于 `userManage` 页面作为模板，包括：

- 完整的表格页面结构
- 搜索、新增、编辑、删除功能
- Mock 数据支持
- 表格列配置
- 表单组件

## 故障排除

如果遇到问题：

1. 确保模块名称使用正确的命名格式（驼峰命名）
2. 检查 `userManage` 模板文件是否存在
3. 查看控制台输出的错误信息

