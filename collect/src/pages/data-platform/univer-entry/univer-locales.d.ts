// @univerjs/preset-* 语言包的类型垫片
// ============================================================================
// 为什么需要：语言包的 import 走 package.json 的 exports 通配（"./locales/*"），
// 而本仓库 tsconfig 用 moduleResolution: "Node"（node10）不解析 exports 映射，
// TS 会报 "Cannot find module '@univerjs/preset-xxx/locales/zh-CN'"。
// 运行时由 Vite 按 exports 正常解析，故这里只补类型声明，不改变运行时行为。
// ============================================================================

declare module '@univerjs/preset-sheets-core/locales/zh-CN' {
  const locale: any;
  export default locale;
}

declare module '@univerjs/preset-sheets-sort/locales/zh-CN' {
  const locale: any;
  export default locale;
}

declare module '@univerjs/preset-sheets-filter/locales/zh-CN' {
  const locale: any;
  export default locale;
}

declare module '@univerjs/preset-sheets-find-replace/locales/zh-CN' {
  const locale: any;
  export default locale;
}

declare module '@univerjs/preset-sheets-data-validation/locales/zh-CN' {
  const locale: any;
  export default locale;
}

declare module '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN' {
  const locale: any;
  export default locale;
}
