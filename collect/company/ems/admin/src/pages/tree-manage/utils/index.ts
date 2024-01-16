import { TM_ILocationVO } from '../tree-manage.api';
import commonService from '@/services/common/common';
import { FResHandler } from '@/utils/index';

/**
 * 根据节点类型、树类型、树节点返回空间列表
 * @param nodeType
 * @param treeType
 * @param treeId
 * @returns
 */
export function querySpaceCenterListByType(
  nodeType: string,
  treeType: string,
  treeId?: string,
): Promise<TM_ILocationVO[]> {
  return new Promise(async resolve => {
    try {
      let params: any = {
        nodeType: nodeType === '' ? ' ' : nodeType,
        treeType,
      };
      // 如果有treeId
      if (treeId) {
        params = {
          ...params,
          treeId,
        };
      }
      const res = await commonService.geLocationListByType(params);
      const result = FResHandler<TM_ILocationVO[]>(res);
      if (result?.length) {
        resolve(result);
      } else {
        resolve([]);
      }
    } catch (error) {
      resolve([]);
    }
  });
}
