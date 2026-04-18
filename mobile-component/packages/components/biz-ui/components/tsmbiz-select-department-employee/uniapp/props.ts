/**
 * 选择部门/员工组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export enum ORGANIZATION_TYPE {
  LOCAL = 'local',
  SHARED = 'shared'
}
export interface Department {
  id: string;
  name: string;
  parentId?: string;
  count?: number;
  path?: string;
  organization?: string;
}

export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  organization: string;
  jobTitle?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: ORGANIZATION_TYPE;
}

export interface SelectDepartmentEmployeeProps {
  /** 控制组件显示/隐藏 */
  show?: boolean;
  /** 组件标题 */
  title?: string;
  /** 确认按钮文本 */
  confirmText?: string;
  /** 取消按钮文本 */
  cancelText?: string;
  /** 默认选中的数据 */
  defaultSelected?: Array<{
    id: string;
    name: string;
    type: 'department' | 'employee';
  }>;
  /** 选择模式：single-单选，multiple-多选 */
  mode?: 'single' | 'multiple';
  /** 是否可关闭 */
  closeable?: boolean;
  /** 机构列表 */
  organizations?: Organization[];
  /** 部门列表 */
  departments?: Department[];
  /** 人员列表 */
  employees?: Employee[];
  /** 近期选择列表 */
  recentSelected?: Employee[];
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  title: '选择人员',
  confirmText: '确定',
  cancelText: '取消',
  defaultSelected: () => [],
  mode: 'multiple',
  closeable: true,
  organizations: () => [
    { id: '1', name: '本机构', type: ORGANIZATION_TYPE.LOCAL },
    { id: '2', name: '共享机构', type: ORGANIZATION_TYPE.SHARED }
  ],
  departments: () => [
    { id: 'dept1', name: '南京天溯', count: 16, organization: '本机构' },
    { id: 'dept2', name: '产品体验设计部', count: 16, organization: '本机构' }
  ],
  employees: () => [
    { id: 'emp1', name: '戴云', avatar: '', department: '技术架构与数据部', organization: '本机构' },
    { id: 'emp2', name: '戴云', avatar: '', department: '技术架构与数据部', organization: '本机构' },
    { id: 'emp3', name: '戴云', avatar: '', department: '技术架构与数据部', organization: '本机构' }
  ],
  recentSelected: () => [
    { id: 'emp1', name: '戴云', avatar: '', department: '技术架构与数据部', organization: '本机构' },
    { id: 'emp2', name: '戴云', avatar: '', department: '技术架构与数据部', organization: '本机构' },
    { id: 'emp3', name: '戴云', avatar: '', department: '技术架构与数据部', organization: '本机构' }
  ],
  customClass: '',
  customStyle: () => ({}),
} as const;
