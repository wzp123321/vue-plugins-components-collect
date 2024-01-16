import { PFE_EFixedType, PFE_ESymbolType } from '../../enums';
import { PFE_IIndexVO } from '../../pm-formula-editor.api';

/**
 * 查询指标列表入参
 */
export interface PFE_IQueryIndexListParams {
  /**
   * 租户id
   */
  tenantId: number;
  /**
   * 指标类型：0基础指标 1定值指标 2运算指标
   */
  indexType: string;
}

/**
 * 查询收益分享模式各项指标列表
 */
export interface PFE_IIndexListResponse {
  /**
   * 指标列表
   */
  indexList: PFE_IIndexVO[];
}

// 编辑指标信息
export interface PIL_IEditIndexStore {
  // id
  id?: string;
  // 标识
  serialNumber: string;
  // 原始值
  originName: string;
  // 最新值
  indexName: string;
}
// 弹出层位置
export interface PIL_IPopoverPosition {
  top: string;
  left: string;
}
/**
 * 新增&编辑指标参数
 */
export interface PIL_IIndexAddEditParams {
  /**
   * 指标id
   */
  id?: string;
  /**
   * 租户id
   */
  tenantId: number;
  /**
   * 指标类型：0基础指标 1定值指标 2运算指标
   */
  indexType: string;
  /**
   * 指标名称
   */
  indexName: string;
  /**
   * 指标公式号（空则代表新增）
   */
  serialNumber?: string;
}

/**
 * 根据指标&符号类型返回对应样式
 * @param type
 * @returns
 */
export const mapTagStyle = (type: PFE_ESymbolType) => {
  let style = {};
  switch (type) {
    case PFE_ESymbolType.基础:
      style = {
        color: 'var(--te-color-primary)',
        backgroundColor: 'var(--te-color-primary-light-9)',
        border: '1px solid var(--te-color-primary-light-8)',
      };
      break;
    case PFE_ESymbolType.定值:
      style = {
        color: 'var(--te-color-success)',
        backgroundColor: 'var(--te-color-success-light-9)',
        border: '1px solid var(--te-color-success-light-8)',
      };
      break;
    case PFE_ESymbolType.运算:
      style = {
        color: 'var(--te-color-warning)',
        backgroundColor: 'var(--te-color-warning-light-9)',
        border: '1px solid var(--te-color-warning-light-8)',
      };
      break;
    case PFE_ESymbolType.判断符:
      style = {
        color: 'var(--te-color-primary)',
        backgroundColor: 'var(--te-fill-color-blank)',
        border: '1px solid var(--te-color-primary-light-5)',
      };
      break;
    case PFE_ESymbolType.数字:
    case PFE_ESymbolType.运算符:
      style = {
        color: 'var(--te-color-info)',
        backgroundColor: 'var(--te-fill-color-blank)',
        border: '1px solid var(--te-color-info-light-5)',
      };
      break;
    default:
      style = {
        color: 'var(--te-color-info)',
        backgroundColor: 'var(--te-fill-color-blank)',
        border: '1px solid var(--te-color-info-light-5)',
      };
      break;
  }
  style = {
    ...style,
    fontSize: 'var(--te-font-size-b14)',
  };

  return style;
};
