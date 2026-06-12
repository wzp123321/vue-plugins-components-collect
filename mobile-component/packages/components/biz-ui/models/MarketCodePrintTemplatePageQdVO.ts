import PageQd from './PageQd';
export default class MarketCodePrintTemplatePageQdVO extends PageQd {
  // 模板名称模糊匹配
  keywordLike: Nullable<string>;
  // 资产码
  assetCodeEq: Nullable<string>;
}
