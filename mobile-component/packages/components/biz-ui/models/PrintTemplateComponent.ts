import PrintTemplateComponentConfig from './PrintTemplateComponentConfig';
import { PrintTemplateComponentTypeEnum } from './PrintTemplateComponentTypeEnum';
export default class PrintTemplateComponent {
  // 控件id
  id: Nullable<string>;
  // 控件类型
  type: Nullable<PrintTemplateComponentTypeEnum>;
  // 控件的其它各项配置信息
  componentConfig: Nullable<PrintTemplateComponentConfig>;
}
