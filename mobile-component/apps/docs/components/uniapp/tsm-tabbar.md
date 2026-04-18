# Tabbar 组件

底部导航组件，用于页面底部导航切换，支持固定在底部、胶囊样式等配置。

## 平台支持

| H5  | 微信小程序 | App |
| --- | ---------- | --- |
| ✅  |            | ✅  |

## 示例代码

<ExampleSourceCode />

## Props

### Tabbar 属性

| 属性名             | 说明                                 | 类型    | 是否必填 | 默认值  |
| ------------------ | ------------------------------------ | ------- | -------- | ------- |
| v-model:modelValue | 当前选中项的索引                     | number  | 否       | 1       |
| fixed              | 是否固定在底部                       | boolean | 否       | true    |
| bgColor            | 背景颜色，可选值：default \| capsule | string  | 否       | default |
| customClass        | 自定义类名                           | string  | 否       | -       |
| customStyle        | 自定义样式                           | object  | 否       | {}      |

### TabbarItem 属性

| 属性名      | 说明                            | 类型                | 是否必填 | 默认值 |
| ----------- | ------------------------------- | ------------------- | -------- | ------ |
| text        | 标签文字                        | string              | 否       | -      |
| icon        | 图标路径或组件                  | string \| Component | 否       | -      |
| badge       | 角标数量                        | number              | 否       | 0      |
| badgeType   | 角标类型，可选值：dot \| circle | string              | 否       | dot    |
| customClass | 自定义类名                      | string              | 否       | -      |
| customStyle | 自定义样式                      | object              | 否       | {}     |

## 事件

| 事件名 | 说明             | 参数          |
| ------ | ---------------- | ------------- |
| change | 选中项改变时触发 | index: number |

## 插槽

| 插槽名  | 说明            |
| ------- | --------------- |
| default | TabbarItem 内容 |

## 注意事项

1. Tabbar 组件最多显示 5 个 TabbarItem，超过 5 个时，第 5 个会显示为"更多"按钮
2. TabbarItem 组件必须配合 Tabbar 组件使用
3. icon 属性支持字符串路径或 Vue 组件
4. badge 属性大于 0 时才会显示角标
5. badgeType 为 circle 时，badge 数值超过 99 会显示为 "99+"
