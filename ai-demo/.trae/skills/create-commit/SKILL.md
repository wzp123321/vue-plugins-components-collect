---
name: create-commit
description: 指导撰写符合团队规范的 Git 提交信息（commit message），包含类型选择、范围、主题、正文、尾部以及禅道问题单关联。
---

# 编写规范化提交信息

## 使用场景

当你需要：

- 为一次功能、修复、重构等变更编写提交说明
- 关联问题单（Closes、bug、task）并生成可读变更记录
- 声明 BREAKING CHANGE 与迁移说明

请使用本技能，并遵守 `.agents/rules/12-提交规范.md`。

---

## 步骤 1：确定 type 与 scope（scope 必须为当前开发分支名）

- 选择 type：feat / fix / docs / style / refactor / perf / test / build / ci / chore / revert
- scope 必填，取值为当前开发分支名，如：`feature/user-export`、`bugfix/auth-401`、`hotfix/v1.2.3`
- 分支命名建议：`feature/xxx`、`bugfix/xxx`、`hotfix/xxx`、`chore/xxx`、`release/x.y.z`

示例：

```
feat(feature/user-export): ...
fix(bugfix/auth-401): ...
```

## 步骤 2：撰写 subject

- 命令式、现在时（做什么，而非已做什么）
- 首字母不大写，结尾不加句号
- 控制在 72 字符内

示例（scope 为当前分支名）：

```
feat(feature/user-export): 新增用户导出功能
```

## 步骤 3：撰写 body（可选）

- 说明动机、关键改动、与旧行为差异
- 可以使用列表分点描述

示例：

```
实现基于后端导出接口的前端触发与状态提示
- 新增导出按钮与进度反馈
- 增加失败重试与取消
```

## 步骤 4：撰写 footer（可选）

- BREAKING CHANGE：非兼容性改动与迁移说明
- 关闭问题：Closes #123 或多个：Closes #123, #456
- 禅道关联：
  - bug 单：`bug #BUG单号 描述`
  - 多 bug：`bug #BUG单号1,BUG单号2 描述`
  - task 单：`task #TASK编号 描述`
  - 多 task：`task #TASK编号1,TASK编号2 描述`

示例：

```
BREAKING CHANGE: 移除旧版导出入口，请改用 settings -> export
Closes #456
bug #1001 修复导出失败后状态未重置
task #1024 优化导出流程
```

---

## 提交信息模板

将以下模板粘贴到编辑器中，按需填写（scope=当前开发分支名）：

```
<type>(<scope>): <subject>

<body 可选，说明动机、改动点、对比、影响>

<footer 可选：BREAKING CHANGE: ...>
<footer 可选：Closes #123, #456>
<footer 可选：bug #BUG1,BUG2 描述>
<footer 可选：task #TASK1,TASK2 描述>
```

---

## 快速示例

```
feat(feature/user-export): 新增批量导出用户数据

支持导出当前筛选条件结果，提供进度反馈与失败重试

Closes #456
task #1024 完成导出流程优化
```

```
fix(bugfix/auth-401): 修复token过期后跳转循环

调整401拦截逻辑，避免短时间内多次重定向

bug #1002 登录状态异常修复
```

```
refactor(build): 重构打包脚本并抽离通用配置

- 提取公用 vite 配置
- 合并环境差异化参数

BREAKING CHANGE: 移除旧版 scripts/build:legacy，请改用 scripts/build
```

---

## 检查清单

- [ ] 是否选择了正确的 type
- [ ] subject 是否命令式、现在时、<= 72 字符
- [ ] scope 是否必要且简洁明确
- [ ] body 是否说明动机与关键改动（若必要）
- [ ] 是否包含 BREAKING CHANGE 与迁移说明（若存在不兼容改动）
- [ ] 是否正确关联 Closes / bug / task（编号、逗号分隔格式正确）
