# Text 组件

text 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| type | 主题颜色 | 'primary' \| 'success' \| 'warning' \| 'error' \| 'info' | 否 | undefined |
| show | 是否显示 | boolean | 否 | true |
| text | 显示的值 | string \| number | 否 | - |
| prefixIcon | 前置图标 | string | 否 | - |
| suffixIcon | 后置图标 | string | 否 | - |
| mode | 文本处理模式 | 'text' \| 'price' \| 'phone' \| 'link' | 否 | 'text' |
| href | mode=link下，配置的链接 | string | 否 | - |
| bold | 是否粗体 | boolean | 否 | false |
| block | 是否块状 | boolean | 否 | false |
| lines | 文本显示的行数 | number | 否 | undefined |
| color | 文本颜色 | string | 否 | - |
| size | 字体大小 | string \| number | 否 | 15 |
| decoration | 文字装饰 | 'none' \| 'underline' \| 'line-through' | 否 | 'none' |
| margin | 外边距 | string \| number | 否 | 0 |
| lineHeight | 文本行高 | string \| number | 否 | undefined |
| align | 文本对齐方式 | 'left' \| 'center' \| 'right' | 否 | 'left' |
| wordWrap | 文字换行 | 'break-word' \| 'normal' \| 'anywhere' | 否 | 'normal' |
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