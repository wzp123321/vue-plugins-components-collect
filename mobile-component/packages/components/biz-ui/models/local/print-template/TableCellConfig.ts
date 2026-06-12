import ValueItem from '../../ValueItem';
import TextStyle from './TextStyle';

export default class TableCellConfig {
  public id: string = '';
  // 数据内容配置
  public valueConfig: Nullable<ValueItem[]>;
  // 文本样式
  public textStyle: Nullable<TextStyle>;
  // 单元格宽度
  public width: Nullable<number>;
  // 单元格高度
  public height: Nullable<number>;
  // 单元格所在行序号
  public rowIndex: Nullable<number>;
  // 单元格所在列序号
  public colIndex: Nullable<number>;
  // 单元格合并配置-合并行数
  public rowSpan: Nullable<number>;
  // 单元格合并配置-合并列数
  public colSpan: Nullable<number>;
}
