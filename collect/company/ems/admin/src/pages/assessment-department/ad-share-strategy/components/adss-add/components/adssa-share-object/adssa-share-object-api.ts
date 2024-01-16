import { postRequest } from '@/services/request';

export const ObjectService = {
  /**
   * 获取分摊对象
   * @param params
   * @returns
   */
  async getShareObjectObject(param: { treeType: string }): Promise<HttpRequestModule.ResTemplate<TreeItem[]>> {
    const res = await postRequest('/admin/tree/energySave/list', param);
    return res;
  },

  /**
   * 获取快捷选择
   * @returns
   */
  async getQuickSelectList(): Promise<HttpRequestModule.ResTemplate<QuickSelectVO[]>> {
    const res = await postRequest('/admin/apportion/scope/queryAll');
    return res;
  },
};

export interface TreeItem {
  id: string;
  treeName: string;
  childTree: TreeItem[];
}

export interface QuickSelectVO {
  id: string;
  name: string;
}

export enum ObjectType {
  树选择 = '0',
  快捷选择 = '1',
}
