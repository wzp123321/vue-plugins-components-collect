/**
 * 契约类型 —— 严格对应 interface-contract.md v2
 * 本文件是契约在前端的类型投影，字段与契约逐字对齐，不允许自行增删。
 */

export type TeacherStatus = 'on' | 'off';

export const SUBJECT_OPTIONS = ['语文', '数学', '英语', '物理', '化学', '生物', '其他'] as const;
export type Subject = (typeof SUBJECT_OPTIONS)[number];

/** 契约 §2 IF-1/IF-2 的 Teacher 对象 */
export interface Teacher {
  id: string;
  name: string;
  code: string;
  phone: string;
  subject: Subject | string;
  status: TeacherStatus;
  hireDate: string;
  /** 乐观锁版本号，编辑时回传判定冲突（契约 §2 IF-4） */
  version: number;
}

/** 契约 §2 IF-1 请求参数 */
export interface TeacherListQuery {
  keyword?: string;
  subject?: string;
  status?: TeacherStatus | '';
  page?: number;
  size?: number;
}

/** 契约 §2 IF-1 响应 */
export interface TeacherListResult {
  list: Teacher[];
  total: number;
}

/** 契约 §2 IF-3 新增请求体 */
export interface TeacherCreatePayload {
  name: string;
  code: string;
  phone: string;
  subject: string;
  hireDate: string;
}

/** 契约 §2 IF-4 编辑请求体（多带 version） */
export interface TeacherUpdatePayload extends TeacherCreatePayload {
  version: number;
}

/** 契约 §2 IF-5a 响应 */
export interface TeacherReferences {
  courseCount: number;
  lessonCount: number;
}

/** 契约 §3 错误码 */
export type ApiErrorCode =
  | 'E_NOT_FOUND'
  | 'E_DUPLICATE_CODE'
  | 'E_VERSION_CONFLICT'
  | 'E_NO_PERM'
  | 'E_PARAM';

/** 契约 §3 错误码 → 前端默认文案映射 */
export const ERROR_MESSAGE: Record<ApiErrorCode, string> = {
  E_NOT_FOUND: '记录不存在或已删除',
  E_DUPLICATE_CODE: '工号已存在',
  E_VERSION_CONFLICT: '数据已被他人更新，请刷新后重试',
  E_NO_PERM: '无操作权限',
  E_PARAM: '参数校验失败',
};
