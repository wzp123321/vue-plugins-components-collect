---
name: project-skills-index
description: 项目的本地技能索引，帮助代理在具体开发场景下选择合适的技能文件。
---

# 项目技能索引

项目在 `.agents/skills` 下定义了一些与 RULE 配套的技能，用于承载**具体实践步骤与示例代码**，避免在 RULE 中塞入过多细节。

## 自封装技能列表

- `create-api`：创建与维护 HTTP 接口（配合 `05-API规范` 使用）
- `create-component`：创建与拆分通用组件/页面级组件（配合 `03/04` 使用）
- `create-route`：创建与维护路由目录与 Loader/Page（配合 `06-路由规范` 使用）
- `create-store`：使用 Zustand 创建与维护全局状态（配合 `07-状态管理` 使用）
- `theme-variables`：正确使用 Antd 与自定义主题 CSS 变量（配合 `09-样式规范` 使用）
- `create-proposal`：指导创建提案的要求，同时完成哪些工作
- `design-analysis`：指导如何分析设计稿
- `ui-verification`：指导如何进行 UI 验收

## 第三方技能列表

- `vercel-react-best-practices`：react 最佳实践
- `vercel-composition-patterns`：react 复合组件最佳实践
- `web-design-guidelines`：主流网页设计指导
- `find-skills`：查找开源 skills
- `skill-creator`：创建 skill 指导

后续如有新的实践场景（例如：测试用例编写、文档撰写模板等），也建议以新的技能目录形式补充到本目录中。
