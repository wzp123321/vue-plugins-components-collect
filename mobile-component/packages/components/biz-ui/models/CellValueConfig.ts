import ValueItem from './ValueItem';
export default class CellValueConfig {
  // 单元格id
  id: Nullable<string>;
  // 行号
  rowNo: Nullable<number>;
  // 列号
  columnNo: Nullable<number>;
  // 数据内容配置
  valueConfig: Nullable<ValueItem[]>;
}
