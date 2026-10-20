---
title: "更新日志"
lang: zh-CN
---

<style scoped lang="scss">
@at-root .hero-content {
  padding: 32px;
}
</style>

# 更新日志

## 1.2.23

- [Select 选择器[te]](/zh-CN/component/te-select-sub-content.md)添加渲染数据控制属性

## 1.2.21

- [Table 表格](/zh-CN/component/table.md#行拖拽排序)添加拖拽排序功能
- [Tag 标签](/zh-CN/component/tag.md#tag-attributes)扩展`type`属性选项
- [样式变量变更](/zh-CN/guide/package-style-list.md#_3-样式修改：)

## 1.2.20

- [Select 选择器](/zh-CN/component/select.md#select-attributes)增加`max-width`属性
- [Message Box 消息弹出框](/zh-CN/component/message-box.md#配置项)增加`left-button`系列配置
- [LayoutOne 布局组件](/zh-CN/component/te-layout-one.md#事件（events）)`collapse`事件增加悬浮状态参数`float`

## v1.2.19

- [页面标签栏组件](/zh-CN/component/te-module-pagetab.md) 增加标题带说明的功能
- [单向穿梭框组件](/zh-CN/component/te-immediate-transfer.md)增加 Tab 切换样式
- [导入组件](/zh-CN/component/import.md)增加导入按钮 loading 状态

## v1.2.18

- 修改流程引擎组件报错问题 <font color="#FF0000"> （Uncaught TypeError: Cannot read properties of undefined (reading 'Graph')）</font> <br />

## v1.2.17-alpha.6

- 新增[layoutOne 组件增加默认插槽](/zh-CN/component/te-layout-one.md#插槽（slots）)

## v1.2.17-alpha.1

- 新增[可拖拽的布局组件](/zh-CN/component/te-layout-drag.md)
- 新增[实时穿梭框组件](/zh-CN/component/te-immediate-transfer.md)
- 新增[空间选择器组件](/zh-CN/component/space-select.md)
- 新增[二维码模版打印组件](/zh-CN/component/print-qr.md)
- 新增[工具库 api 说明](/zh-CN/tools/quickstart.md)

<!-- ## v1.2.17-beta09

- `te-layout-one`组件支持组件多根节点的情况、修复页签删除 bug
- `te-sidenav`组件顶部 logo 错误加载处理、增加 alt 属性
- 新增文件导入组件`te-import`

## v1.2.17-beta05

- 新增全局布局组件`te-layout-one`
- 新增全局导航组件`te-globalnav`
- 新增模块表格组件`te-module-table`
- 新增分段控制器组件`te-segmented`
- 适配 webpack4.x 及以下版本项目 -->

## v1.2.17

- 侧边栏组件`te-sidenav`父级菜单是否可展示条件判断补全
- `te-input`组件新增`specialCharDisabled`属性
- `te-tablebar`组件新增`input`具名插槽，用于自定义输入框部分

## v1.2.15

- 修改表单组件`te-form`点击标题会触发对应输入框或下拉框获得焦点问题
- 修改侧边栏菜单组件`te-sidenav`三级菜单左侧 padding
- 修复树选择组件`te-tree-select`收齐选择器场景下偶现位置偏移的问题

## v1.2.14

- 修改基础组件`te-messagebox`内容区左侧 icon 和文字首行居中对齐
- 修改基础组件`te-dialog`关闭按钮同标题水平不居中问题
- 修改基础组件`te-messagebox`、`te-drawer`关闭按钮 hover 背景色
- 修改描述组件`te-descriptions`统一将单元格标题颜色设置为`--te-text-color-regular`，字重设置为`600`，统一将单元格描述内容颜色设置为`--te-text-color-regular`

## v1.2.13

- 修改基础样式`--te-text-color-primary`为`#18191A`
- 修改基础样式`--te-text-color-regular`为`#303133`
- 修复侧边栏组件切换折叠状态时菜单 icon 位置变动，产生视觉偏差问题

## v1.2.12

- 修复基础组件`te-button`点击后，鼠标移开点击态未重置问题
- 修改基础组件`te-messagebox`各区域通用间距为`20px`
- 修改基础组件`te-dialog`关闭按钮不居中问题
- 树结构组件输入框增加清空图标

## v1.2.11

#### 修改点：

- 修复上下布局组件`te-module-pagetab`导航切换的时候里面的字不应该动的问题
- 修改侧边栏菜单组件`te-sidenav`一级菜单 icon 尺寸、二级菜单左侧对齐一级菜单，增加`iconList`属性支持菜单 icon 从外部传入
- 扩展`te-sidenav`组件支持配置一级菜单鼠标移入弹出悬浮菜单操作
- `te-layout-tree`树组件增加插槽，完善文档
- 修复树编辑组件`te-tree-edit`较短字符串不展示 tooltip 问题
- 搜索布局组件`te-layout-with-search`更名为`te-tablebar`

#### 注意点：

- `te-tablebar`组件根元素 class 选择器名称做了同步修改，之前对该组件进行样式修改或覆盖的项目需要关注下样式是否正常

## v1.2.10

- 优化树结构编辑组件`te-layout-tree`的代码
- 修复侧边栏菜单组件`te-sidenav`偶现场景下菜单收齐未高亮问题
- 修改图片上传组件`te-upload-imagecropping`截图生成的图片格式保持和传入的图片一致

## v1.2.9

- 修复按需导入`te-module-pagetab`组件报错问题
- 切换组件库打包工具为`vite`，同时优化包体积大小
- 新增[树结构编辑布局组件](/zh-CN/component/te-layout-tree.md)：`te-layout-tree`

## v1.2.8

- 修改基础组件`te-tooltip`阴影为`--te-box-shadow-light`
- 修改基础组件`te-alert`标题`font-weight`为`500`，`font-size`为`16px`，描述字段`font-size`为`14px`
- 修改基础组件`te-message`阴影为`--te-box-shadow`
- 修改基础组件`te-dialog`标题`font-weight`为`500`，`font-size`为`20px`，底部按钮间距为`12px`，阴影为`--te-box-shadow-dark`
- 修改基础组件`te-messagebox`阴影为`--te-box-shadow-dark`，宽度固定为`400px`，标题`font-weight`为`500`
- 修改基础组件`te-drawer`标题`font-weight`为`500`、`font-size`为`20px`、`color`为`--te-text-color-primary`，阴影为`--te-box-shadow-dark-(left、right、up)`
- 修改基础组件`te-notification`标题`font-weight`为`500`
- 基础组件`te-popconfirm`type 属性新增`plain`类型，且设置为默认
- 基础组件`te-popper`新增设置`box-shadow`样式为`--te-box-shadow-light`
- 修改基础组件`te-dropdown`阴影为`--te-box-shadow-light`

## v1.2.5

- 修改阴影变量`box-shadow`的`default、light、lighter、dark`变量值，并且各新增三个方向的影响变量`up、left、right`，各变量名详见：[样式表](./package-style-list.md)
- `te-upload-imagecropping`组件增加`headers,limit-size,http-request`属性
- 修改分页器组件`te-pagination` `background`状态下按钮样式

## v1.2.4

- 修改基础组件库`@tiansu/element-plus`暗黑模式下 主要、成功、警示、危险四个大主题样式值
- 修改搜索布局组件`te-layout-with-search`增加搜索输入框功能

## v1.2.3

- 全局导入组件中文语言适配
- 新增依赖公共工具库`@tiansu/tools`

## v1.2.2

- 新增样式表说明
- 新增暗黑模式处理说明
- 新增侧边栏菜单组件`te-sidenav`

## v1.2.0

- 新增带防抖的输入框组件`te-search`
- 导入图标库`@arco-iconbox/vue-te`
- 导入网络请求库`axios`
- 新增间距变量`--te-space-80`
- 修改基础组件`te-dialog`弹窗顶部和底部间距为`--te-space-96`和`--te-space-48`
- 新增卡片形式展示的图片上传组件`te-upload-imagecropping`
- 新增上下布局组件`te-module-pagetab`
- 新增通用的`font-size`变量集合：`--te-font-size-b(x)`、`--te-font-size-h(x)`、`--te-font-size-oh(x)`

## v1.1.0

- 新增常用间距变量集合：`--te-space-xx`
- 修改头像组件`te-avatar`small、default、large 三种 size 下的尺寸值
- 修改单选框组件`te-radio`和复选框组件`te-checkbox`常态和选中态下的`font-weight`值
- 修改表单组件`label`标签和组件之间的垂直间距为`5px`
- 修改评分组件`te-rate`默认尺寸状态下`icon-size`为`16px`
- 新增带标题的上传组件`te-form-upload`
- 新增带标题的标签组件`te-form-tag`
- 新增搜索布局组件`te-layout-with-search`
- 新增通用选择器组件`te-select-sub-content`
- 修改`te-tree-select`组件选项卡高度为`32px`、文字行高设置为`22px`
- 修改`te-dialog`组件关闭按钮样式、标题字号、底部按钮间距

## v1.0.0

- 导入`d-din`和`d-din-bold`两套字体，使用时指定 font-family：`d-din`和`d-din-bold`
- 导入基础组件库`@tiansu/element-plus`（基于`element-plus v2.3.4`）
- 修改基础组件库`@tiansu/element-plus`命名空间为`te`
- 修改组件名前缀为`te`
- 修改基础组件库`@tiansu/element-plus`样式常量名称（颜色、字号等）前缀为`te`
- 修改基础组件库`@tiansu/element-plus`浅色模式下 主要、成功、警示、危险四个大类的样式值
- 修改基础组件库`@tiansu/element-plus`字体样式名称为`13`号字体的值变为`14`号大小
