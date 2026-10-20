---
title: Avatar 头像组件
lang: zh-CN
---

# Avatar 头像组件

Avatar 组件是一个用于显示头像的视图组件，支持自定义尺寸、形状和内容类型（图片或文字）。

## 基础用法

:::demo

mobile/avatar/basic

:::

## Avatar 属性

| 属性名 | 类型   | 默认值 | 描述                                                                                                                    |
| ------ | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| size   | String | medium | 设置头像尺寸，可选值：`medium` 或 `large`                                                                               |
| shape  | String | circle | 设置头像形状，可选值：`circle`（圆形）或 `square`（方形）                                                               |
| src    | String | ''     | 设置头像图片地址                                                                                                        |
| alt    | String | ''     | 设置头像图片的 `alt` 属性，提供给辅助技术识别图片内容                                                                   |
| srcSet | String | ''     | 设置头像图片的 `srcSet` 属性，用于响应式加载不同分辨率的图片                                                            |
| text   | String | ''     | 设置文字头像内容                                                                                                        |
| fit    | String | cover  | 控制图片如何适应其容器，仅在使用图片头像时有效。可选值包括但不限于：`contain`, `cover`, `fill`, `none`, `scale-down` 等 |
