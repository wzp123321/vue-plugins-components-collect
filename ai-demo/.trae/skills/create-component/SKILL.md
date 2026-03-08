---
name: create-component
description: 指导在前端项目中按团队规范创建和拆分 Vue3 组件，包括目录结构、文件命名、样式与主题变量使用。当前端需要新增或重构组件时使用本技能。
---

# 创建与拆分组件

## 使用场景

当你需要：

- 新增一个**可复用通用组件**
- 为某个页面新增**页面级组件**
- 拆分过大的页面/组件文件

请使用本技能，并同时遵守 `.agents/rules/03-项目结构.md` 与 `.agents/rules/04-组件规范.md`。

---

## 组件放在哪里？

详见 `.agents/rules/04-组件规范.md` 中的"组件放置决策树"。

- **通用组件**（跨页面复用）：`src/components/<component-name>/`
- **页面级组件**（只在单页使用）：`src/views/<page>/components/`

命名约定：

- 目录名：`kebab-case`，例如 `error-boundary`
- Vue 组件名：`camelCase`，例如 `errorBoundary`

---

## 标准目录结构

通用组件示例：

```text
src/components/userButton/
  ├─ index.vue
  └─ style.scss
```

页面级组件示例：

```text
src/views/home/components/header/
  ├─ index.vue
  └─ style.scss
```

---

## 步骤 1：创建组件骨架

```vue
<!-- src/components/userButton/index.vue -->
<template>
  <te-button :type="type" :size="size" :class="buttonClass" @click="onClick">
    <slot />
  </te-button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonProps } from '@tiansu/element-plus'

interface UserButtonProps {
  type?: ButtonProps['type']
  size?: ButtonProps['size']
  className?: string
}

interface UserButtonEmits {
  click: [event: Event]
}

const props = withDefaults(defineProps<UserButtonProps>(), {
  type: 'primary',
  size: 'medium'
})

const emit = defineEmits<UserButtonEmits>()

const buttonClass = computed(() => {
  return ['user-button', props.className].filter(Boolean).join(' ')
})

const onClick = (event: Event) => {
  emit('click', event)
}
</script>

<style scoped lang="scss">
.user-button {
  // 样式定义
}
</style>
```

并在 `src/components/index.ts` 中集中导出：

```ts
// src/components/index.ts
export { default as UserButton } from './userButton/index.vue'
```

---

## 步骤 2：样式与主题变量

在 `style.scss` 中：

```scss
// src/components/userButton/style.scss
.user-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;

  // 使用 Element Plus 的主题变量
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
}
```

**原则：**

- 必须使用 SCSS：`.scss` 文件
- 自定义颜色必须使用主题 CSS 变量：
  - Element Plus 变量：`var(--el-color-primary)`、`var(--el-color-text)` 等
  - 自定义变量：`var(--user-primary-color)`、`var(--user-border-radius)` 等
- 禁止在组件样式中直接硬编码主色，如 `#1677ff`。

**样式还原检查**：涉及 UI 还原的组件样式开发，请参考对应的 UI 分析文档。

---

## 步骤 3：组件职责与拆分

- 单个 `.vue` 文件建议不超过 **400 行**，超过时优先考虑拆分为子组件。
- 拆分时遵循：
  - **页面级组件**：只在一个路由使用 → 放在该路由的 `components/` 下。
  - **通用组件**：在多个路由使用 → 提取到 `src/components`。
- 一个组件应聚焦单一职责（一个明确的 UI 区块或交互单元）。

---

## 步骤 4：与 @tiansu/element-plus 协同

通用交互控件应基于 @tiansu/element-plus 进行二次封装：

```vue
<template>
  <te-button :type="type" v-bind="$attrs">
    <slot />
  </te-button>
</template>

<script setup lang="ts">
import type { ButtonProps } from '@tiansu/element-plus'

interface Props extends ButtonProps {
  // 可以扩展一些自定义属性
}

defineProps<Props>()
</script>
```

---

## 快速检查清单

- [ ] 组件目录是否放在了正确位置（通用 vs 页面级）？
- [ ] 是否使用了 `index.vue + style.scss` 的结构？
- [ ] 是否通过 `src/components/index.ts` 集中导出通用组件？
- [ ] 样式是否全部使用 SCSS，且颜色使用主题变量？
- [ ] 组件文件是否过大，是否需要拆分子组件？
- [ ] 是否使用了 `<script setup lang="ts">` 语法？
- [ ] 组件名是否使用了小驼峰命名法？
- [ ] 是否正确使用了 @tiansu/element-plus 组件？
