import type { Common_EMenuId } from '@/config/enum';

// 通用查询树节点参数
export interface Es_IQueryChildTreeParams {
  treeId: number | null;
  treeType: string;
  energyCode: string;
  keyword: string;
  userId: number | null;
  menuId: number;
}

// 面包屑
export interface Es_IBreadcrumb {
  id: number;
  treeName: string;
}

// 查询历史记录参数
export interface Es_IQueryHistoryParams {
  energyCode: string;
  menuId: Common_EMenuId;
  userId: number | null;
  treeType: string;
}
