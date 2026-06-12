import { PrintTemplateDatasourceTypeEnum } from './PrintTemplateDatasourceTypeEnum';
import PrintTemplateComponentConfig from './PrintTemplateComponentConfig';
export default class PrintTemplateConfig {
  // 模板名称
  name: Nullable<string>;
  // 数据源类型
  datasourceType: Nullable<PrintTemplateDatasourceTypeEnum>;
  // 资产码
  assetCode: Nullable<string>;
  // 宽度
  width: Nullable<number>;
  // 高度
  height: Nullable<number>;
  // 更多设置
  extraConfig: Nullable<string>;
  // 打印模板中各控件配置的集合
  labelItems: Nullable<PrintTemplateComponentConfig[]>;
}
