---
title: Popup 弹出层
lang: zh-CN
---

# Popup 弹出层

由其他控件触发，屏幕滑出或弹出一块自定义内容区域。

## 基础用法

:::demo

mobile/popup/basic

:::

## Popup 属性

|       属性名        |  类型   |  默认值  |                                                  说明                                                  |
| :-----------------: | :-----: | :------: | :----------------------------------------------------------------------------------------------------: |
|      animation      | Boolean |   true   |                                              是否开启动画                                              |
|        type         | String  | 'center' | 弹出方式，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层；left : 左侧弹出；right : 右侧弹出； |
|    is-mask-click    | Boolean |   true   |                                          蒙版点击是否关闭弹窗                                          |
|  background-color   | String  |  'none'  |                                              主窗口背景色                                              |
|      safe-area      | Boolean |   true   |                                           是否适配底部安全区                                           |
|   cancelBtnTitle    | String  |  '取消'  |                                              取消按钮标题                                              |
|   confirmBtnTitle   | String  |  '确定'  |                                              确定按钮标题                                              |
| showConfirmBtnIcon  | Boolean |  false   |                                            是否展示确定按钮                                            |
|   showBottomBtns    | Boolean |   true   |                                         是否展示底部操作按钮区                                         |
| showHeaderCloseIcon | Boolean |   true   |                                          是否展示头部关闭按钮                                          |
| init-trans-styles   | StyleObject |   {}   |                         弹出层的初始样式（动画开始前的默认样式）                                   |
| init-mask-styles    | StyleObject |   {}   |                         遮罩层的初始样式（动画开始前的默认样式）                                   |

## Popup 事件

| 事件称名  |         说明         |                 返回值                  |
| :-------: | :------------------: | :-------------------------------------: |
|   title   | 组件状态发生变化触发 | `e={show: true ｜ false,type:当前模式}` |
| maskClick |    点击遮罩层触发    |                    -                    |

## Popup 方法

| 方法称名 |    说明    |                     参数                     |
| :------: | :--------: | :------------------------------------------: |
|   open   | 打开弹出层 | open(String:type) ，如果参数可代替 type 属性 |
|  close   | 关闭弹出层 |                      -                       |

## Popup 插槽

|  名称   |    说明    |
| :-----: | :--------: |
| default | 自定义内容 |
