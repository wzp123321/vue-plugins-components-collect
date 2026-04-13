# Navbar 组件

navbar 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| safeAreaInsetTop | 是否开启顶部安全区适配 | boolean | 否 | true |
| placeholder | 固定在顶部时，是否生成一个等高元素，以防止塌陷 | boolean | 否 | false |
| fixed | 导航栏是否固定在顶部 | boolean | 否 | false |
| border | 导航栏底部是否显示下边框 | boolean | 否 | false |
| leftIcon | 左边返回图标的名称 | string | 否 | 'arrow-left' |
| leftText | 左边的提示文字 | string | 否 | - |
| rightText | 右边的提示文字 | string | 否 | - |
| rightIcon | 右边返回图标的名称 | string | 否 | - |
| title | 导航栏标题 | string | 否 | - |
| bgColor | 导航栏背景设置 | string | 否 | '#ffffff' |
| titleWidth | 导航栏标题的最大宽度 | string \| number | 否 | '400rpx' |
| height | 导航栏高度 | string \| number | 否 | '44px' |
| leftIconSize | 左侧返回图标的大小 | string \| number | 否 | '20px' |
| leftIconColor | 左侧返回图标的颜色 | string | 否 | '#303133' |
| autoBack | 点击左侧区域，是否自动返回上一页 | boolean | 否 | false |
| titleStyle | 标题的样式 | object \| string | 否 | - |
| customClass | 自定义类名 | string | 否 | - |
| customStyle | 自定义样式 | object | 否 | {} |

<style>
table {
  width: 100%;
  table-layout: fixed;
}
table th,
table td {
  word-break: break-all;
}
</style>