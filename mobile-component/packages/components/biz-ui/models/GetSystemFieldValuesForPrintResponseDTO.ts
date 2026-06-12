import MarketCodeValueDetail from './MarketCodeValueDetail';
export default class GetSystemFieldValuesForPrintResponseDTO {
  // 各天溯码对应的系统字段/扫码内容值列表
  details: Nullable<MarketCodeValueDetail[]>;
}
