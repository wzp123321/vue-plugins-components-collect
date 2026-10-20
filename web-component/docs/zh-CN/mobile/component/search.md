---
title: Search 搜索框
lang: zh-CN
---

# Search 搜索框

用于用户输入搜索信息，并进行页面内容搜索。

## 基础用法

:::demo

mobile/search/basic

:::

## Search 属性

|    属性名     |             类型              |  默认值   |                                          说明                                           |
| :-----------: | :---------------------------: | :-------: | :-------------------------------------------------------------------------------------: |
| value/v-model |         StringNumber          |           |                                      搜索栏绑定值                                       |
|  placeholder  |            String             |   搜索    |                                   搜索栏 Placeholder                                    |
|    radius     |            Number             |    10     |                                   搜索栏圆角，单位 px                                   |
|  clearButton  |            String             |   auto    | 是否显示清除按钮，可选值`always`-一直显示、`auto`-输入框不为空时显示、`none`-一直不显示 |
| cancelButton  |            String             |   auto    | 是否显示取消按钮，可选值`always`-一直显示、`auto`-输入框不为空时显示、`none`-一直不显示 |
|  cancelText   |            String             |   取消    |                                     取消按钮的文字                                      |
|    bgColor    |            String             |  #F8F8F8  |                                     输入框背景颜色                                      |
|   maxlength   |            Number             |    100    |                                      输入最大长度                                       |
|     focus     |            Boolean            |   false   |                                      是否自动聚焦                                       |
|  filterShow   |            Boolean            |   false   |                                 是否自展示右侧过滤 icon                                 |
|     size      | ^[enum]`default\medium\large` | 'default' |                                   组件搜索框大小 icon                                   |

## Search 事件

|   事件称名    |                                  说明                                  |      返回参数      |
| :-----------: | :--------------------------------------------------------------------: | :----------------: |
|   @confirm    |  uniSearchBar 的输入框 confirm 事件，返回参数为 uniSearchBar 的 value  | `e={value:Number}` |
|    @input     | uniSearchBar 的 value 改变时触发事件，返回参数为 uniSearchBar 的 value |     `e=value`      |
|    @cancel    |        点击取消按钮时触发事件，返回参数为 uniSearchBar 的 value        | `e={value:Number}` |
|    @clear     |        点击清除按钮时触发事件，返回参数为 uniSearchBar 的 value        | `e={value:Number}` |
|    @focus     |       input 获取焦点时触发事件，返回参数为 uniSearchBar 的 value       | `e={value:Number}` |
|     @blur     |       input 失去焦点时触发事件，返回参数为 uniSearchBar 的 value       | `e={value:Number}` |
| @handleFilter |                          右侧过滤按钮点击事件                          |         -          |

## Search 插槽

|  插槽称名  |        说明        |
| :--------: | :----------------: |
| searchIcon | 替换组件的搜索图标 |
| clearIcon  | 替换组件的清除图标 |
|   filter   |  右侧过滤 icon 区  |
