import ValueItem from './ValueItem';
import CellValueConfig from './CellValueConfig';
import { PrintTemplateComponentTypeEnum } from './PrintTemplateComponentTypeEnum';

export default class PrintTemplateComponentConfig {
  // 控件id
  id: Nullable<string>;
  // 控件类型
  type: Nullable<PrintTemplateComponentTypeEnum>;
  // 控件名称
  name: Nullable<string>;
  // 数据内容配置
  valueConfig: Nullable<ValueItem[]>;
  // 表格组件-单元格数据内容配置
  cellsValueConfig: Nullable<CellValueConfig[]>;
  // 控件的样式相关配置信息
  styleConfig: Nullable<string>;
}
