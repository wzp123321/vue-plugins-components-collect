/**
 * 选择部门/员工组件 Props 定义
 */
import type { CSSProperties } from 'vue';
import type { dataProps } from '../../../common/list-cell/props';
import HttpRequest from 'luch-request';
import { TreeNodeQueryStrategyEnum } from '../../../models/TreeNodeQueryStrategyEnum';
import { OrganizationIdentityTypeEnum } from '../../../models/OrganizationIdentityTypeEnum';
import DataPermissionCheck from '../../../models/DataPermissionCheck';

export enum ORGANIZATION_TYPE {
  /** 所有机构 */
  ALL = 'ALL_CHOICE',
  /** 本地机构 */
  LOCAL = 'CHOSEN_FROM_LOCAL',
  /** 共享机构 */
  SHARED = 'CHOSEN_FROM_SHARED',
}

export interface SelectDepartmentEmployeeProps {
  /** 控制组件显示/隐藏 */
  show?: boolean;
  /** 自定义请求实例 */
  http?: HttpRequest;
  /** 租户ID */
  tenantId: string;
  /** 机构ID */
  organizationId: string;
  /** 选择模式：single-单选，multiple-多选 */
  multiple?: boolean;
  /** 多选时最大选择数量 */
  multipleLimit?: number;
  /** 限定根部门id */
  rootDeptId?: string;
  /** 限定根部门查询策略 */
  rootDeptStrategy?: TreeNodeQueryStrategyEnum;
  /** 数据权限校验 */
  dataPermissionCheck?: DataPermissionCheck;
  /** 是否共享机构 */
  shareOrg?: boolean;
  /** 近期选择的缓存key，空则不使用近期选择 */
  latelyKey?: string;
  /** 院区id */
  campusIds?: string[];
  /** 组织属性 */
  orgIdentityType?: OrganizationIdentityTypeEnum[];
  /** 选中项 */
  selected?: Array<dataProps>;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  http: undefined,
  selected: () => [],
  multiple: true,
  multipleLimit: 500,
  shareOrg: true,
  customClass: '',
  customStyle: () => ({}),
} as const;
