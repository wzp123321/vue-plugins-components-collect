# Esign 组件

esign 组件的描述信息

## 平台支持

| H5 | 微信小程序 | App |
| --- | --- | --- |
| ✅ | - | ✅ |

## 示例代码

<ExampleSourceCode />

## Props

| 属性名 | 说明 | 类型 | 是否必填 | 默认值 |
| --- | --- | --- | --- | --- |
| modelValue | 签名图地址（v-model） 支持：图片 URL / 本地临时路径(tempFilePath) / base64(data:image 前缀 或 裸 base64 均可回显) 空字符串表示未签名 | `string` | 否 | - |
| readonly | 是否只读（只读后不可点击进入签名；置空不可点场景应改用展示而非本组件）。只读且未签名时，展示区只渲染中性占位符 `-`，不铺底色也不撑高度 | `boolean` | 否 | false |
| height | 签名展示区域高度，支持 rpx/px，默认 300rpx（只读且未签名时不生效） | `string` | 否 | '300rpx' |
| placeholder | 展示区未签名提示文案（仅可编辑态展示；只读态未签名时固定展示 `-`） | `string` | 否 | '点击签名板签署名字' |
| editorTitle | 编辑层标题 | `string` | 否 | '签名' |
| hintText | 编辑层画布为空时的提示文案 | `string` | 否 | '请在空白区域签名' |
| cancelText | 取消按钮文案 | `string` | 否 | '取消' |
| clearText | 清除按钮文案 | `string` | 否 | '清除' |
| confirmText | 确定按钮文案 | `string` | 否 | '确定' |
| penColor | 笔迹颜色 | `string` | 否 | '#181D27' |
| lineWidth | 笔迹宽度(px) | `number` | 否 | 3 |
| backgroundColor | 签名纸(画布/展示区)底色 | `string` | 否 | '#F5F6F8' |
| exportScale | 导出放大倍数（用于提升清晰度），默认 2 | `number` | 否 | 2 |
| landscapeTopInset | 旋转横屏签字板顶部预留高度(px)，用于避开系统状态栏／刘海，详见「注意事项」 | `number` | 否 | 0 |
| teleportToBody | 编辑层是否 Teleport 到 body（仅 H5 生效，小程序/App 退化为页面内渲染）。页面内有 transform／overflow 等形成包含块的祖先时，页面内的 fixed 编辑层会被裁剪或被导航条·状态栏遮挡（iOS 上尤其明显），置 false 可退回页面内渲染 | `boolean` | 否 | true |
| customClass | 自定义类名 | `string` | 否 | - |
| customStyle | 自定义样式 | `object` | 否 | {} |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update | - | `modelValue': [value: string]` |
| change | - | `[value: string]` |
| confirm | - | `[value: string]` |
| clear | - | `-` |
| cancel | - | `-` |
| esign-landscape-change | 横屏签字态变化（进入/退出旋转横屏签名），参数为当前是否处于横屏签字 | `[value: boolean]` |


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