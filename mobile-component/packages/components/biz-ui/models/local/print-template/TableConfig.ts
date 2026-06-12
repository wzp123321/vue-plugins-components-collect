import TableCellConfig from './TableCellConfig';

export default class TableConfig {
  // 行数
  public rows: Nullable<number>;
  // 列数
  public cols: Nullable<number>;
  // 边框宽度
  public borderWidth: Nullable<number>;
  // 单元格配置
  public cells: Nullable<TableCellConfig[][]>;
}
