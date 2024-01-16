import { PFE_IIndexVO } from '../../pm-formula-editor.api';

// 不同类型的符号
export interface PTB_ITypeSymbolVO {
  type: string;
  typeName: string;
  symbolList: PFE_IIndexVO[];
}
