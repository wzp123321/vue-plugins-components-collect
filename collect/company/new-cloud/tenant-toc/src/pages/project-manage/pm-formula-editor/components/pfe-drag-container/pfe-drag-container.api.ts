// api
import { PFE_IIndexVO } from '../../pm-formula-editor.api';

/**
 * 拖拽change回调参数
 */
export interface PDC_IDragChangeParams {
  added?: PDC_IDragAdded;
  moved?: PDC_IDragMoved;
}

/**
 * 拖拽新增回调参数
 */
export interface PDC_IDragAdded {
  element: PFE_IIndexVO;
  newIndex: number;
}

/**
 * 拖拽移动回调参数
 */
export interface PDC_IDragMoved {
  element: PFE_IIndexVO;
  newIndex: number;
  oldIndex?: number;
}
