---
title: Card 卡片
lang: zh-CN
---

# Card 卡片

将信息聚合在卡片容器中展示。

## 基础用法

卡片包含标题，内容以及操作区域。

:::demo Card 组件由 `header` `body` 和 `footer`组成。 `header` 和 `footer`是可选的，其内容取决于一个具名的 slot。

card/basic

:::

## 简单卡片

卡片可以只有内容区域。

:::demo

card/simple

:::

## 有图片内容的卡片

可配置定义更丰富的内容展示。

:::demo 配置 `body-style` 属性来自定义 `body` 部分的样式。 在这个例子中我们还使用了 `te-col` 组件来布局。

card/with-images

:::

## 带有阴影效果的卡片

你可以定义什么时候展示卡片的阴影效果。

:::demo 通过 `shadow` 属性设置卡片阴影出现的时机。 该属性的值可以是：`always`、`hover` 或 `never`。

card/shadow

:::

## API

### Attributes

| 属性名                  | 说明                                                        | 类型                                  | 默认值    |
| -------------------- | --------------------------------------------------------- | ----------------------------------- | ------ |
| header               | 卡片的标题 你既可以通过设置 header 来修改标题，也可以通过 `slot#header` 传入 DOM 节点 | ^[string]                           | —      |
| footer ^(2.4.3)      | 卡片页脚。 你既可以通过设置 header 来修改标题，也可以通过 `slot#footer` 传入 DOM 节点 | ^[string]                           | —      |
| body-style           | body 的 CSS 样式                                             | ^[object]`CSSProperties`            | —      |
| body-class ^(2.3.10) | body 的自定义类名                                               | ^[string]                           | —      |
| shadow               | 卡片阴影显示时机                                                  | ^[enum]`always \| never \| hover` | always |

### Slots

| 插槽名     | 说明      |
| ------- | ------- |
| default | 自定义默认内容 |
| header  | 卡片标题内容  |
| footer  | 卡片页脚内容  |
