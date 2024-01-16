import { postRequest } from '../../../services/request';

import {
  TM_ISearchTreeParams,
  TM_ITreeEditorParams,
  TM_IDepartmentHistoryVO,
  TM_ITreeManageVO,
  TM_AddNode,
} from '../tree-manage.api';

const treeManageService = {
  /**
   * 获取树列表
   */
  async getTreeList(params: TM_ISearchTreeParams): Promise<HttpRequestModule.ResTemplate<TM_ITreeManageVO[]>> {
    const res: HttpRequestModule.ResTemplate<TM_ITreeManageVO[]> = await postRequest('/admin/tree/list', params);
    return res;
  },

  /**
   * 获取树列表(懒加载)
   */
  async getTreeListLazy(params: TM_ISearchTreeParams): Promise<HttpRequestModule.ResTemplate<TM_ITreeManageVO[]>> {
    const res: HttpRequestModule.ResTemplate<TM_ITreeManageVO[]> = await postRequest('/admin/tree/list/lazy', params);
    return res;
  },

  /**
   * 根据id查询详情
   * @param treeId
   * @returns
   */
  async getTreeDetailById(treeId: string): Promise<HttpRequestModule.ResTemplate<TM_ITreeManageVO>> {
    const url = '/admin/tree/queryTreeDetail';
    const res: HttpRequestModule.ResTemplate<TM_ITreeManageVO> = await postRequest(url, treeId);
    return res;
  },

  /**
   * 删除树
   */
  async deleteTree(id: number) {
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest('/admin/tree/delete', id);
    return res;
  },
  /**
   * 新增树
   */
  async addTree(params: TM_AddNode) {
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest('/admin/tree/add', params);
    return res;
  },
  /**
   * 批量新增树
   */
  async addMultiTree(params: TM_AddNode) {
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest('/admin/tree/addMultiTree', params);
    return res;
  },
  /**
   * 获取树节点的父级节点类型
   */
  async getParentType(params: TM_AddNode) {
    const res: HttpRequestModule.ResTemplate<{ initSort: number; nodeType: string }> = await postRequest(
      '/admin/tree/maxSort',
      params,
    );
    return res;
  },
  /**
   * 编辑树
   */
  async editTree(params: TM_ITreeEditorParams) {
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest('/admin/tree/update', params);
    return res;
  },
  /**
   * 导入树
   */
  async uploadTree(params: any) {
    const res = await postRequest('/admin/tree/upload/template', params);
    return res;
  },
  /**
   * 查询当前树类型下是否为空数据
   * @param treeType
   * @returns
   */
  async checkTreeIsEmpty(treeType: string) {
    const res = await postRequest('/admin/tree/exist', treeType);
    return res;
  },

  /**
   * query树节点当前对应科室信息
   * @param treeId
   * @returns
   */
  async queryDepartmentTree(treeId: string): Promise<TM_IDepartmentHistoryVO> {
    const res: TM_IDepartmentHistoryVO = await postRequest('/admin/tree/query/current/department', treeId);
    return res;
  },
  /**
   * query树节点对应科室信息历史
   * @param treeId
   * @returns
   */
  async queryTreeDepartmentHistory(treeId: string) {
    const res = await postRequest('/admin/tree/query/department/rel/history', treeId);
    return res;
  },
  /**
   * 校验子节点是否有关联关系
   * @param treeId
   * @returns
   */
  async checkDepartmentRelExist(params: string) {
    const res = await postRequest('/admin/tree/query/department/rel/exist', params);
    return res;
  },
};

export default treeManageService;
