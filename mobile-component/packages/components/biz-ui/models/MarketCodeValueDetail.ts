import ValueItemDetail from './ValueItemDetail';
export default class MarketCodeValueDetail {
  // 天溯码
  code: Nullable<string>;
  // 参数明细列表
  valueItems: Nullable<ValueItemDetail[]>;
}
