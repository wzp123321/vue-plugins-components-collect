import { ref } from 'vue';
// api
import type { Common_ICodeName, Common_IHttpResponseImpl, Common_ITreeVO } from '@/api/model';
import type {
  Es_IBreadcrumb,
  Es_IQueryChildTreeParams,
  Es_IQueryHistoryParams,
} from '@/pages/energy-analysis/ea-search/ea-search.api';
import type { Esh_IHistoryVO } from '@/pages/energy-analysis/ea-search/es-search-history/es-search-history.api';
// 工具方法
import { FGetStorageData } from '@/utils/storage';
import { commonHttp } from '@/api/request';
import { FResHandler } from '@/utils';
// 配置
import { SESSION_KEY_USER_ID } from '@/config/session-key';
// 枚举
import { Common_EMenuId, Common_EPath } from '@/config/enum';
import { COMMON_DEFAULT_BREADCRUMB } from '@/config/config';

// 树模块-公共逻辑
export const useCommonTree = () => {
  // 树类型列表
  const treeTypeList = ref<Common_ICodeName<string>[]>([]);
  /**
   * 查询树类型
   */
  const queryTreeTypeList = async () => {
    const res: Common_IHttpResponseImpl<Common_ICodeName<string>[]> = await commonHttp.post<
      unknown,
      Common_ICodeName<string>[]
    >(Common_EPath.字典查询);
    const result = FResHandler<Common_ICodeName<string>[]>(res);
    treeTypeList.value = result ?? [];
  };

  // 树类型
  const treeType = ref<string>('');
  // 搜索内容
  const searchLabel = ref<string>('');
  // 面包屑
  const searchBreadCrumbList = ref<Es_IBreadcrumb[]>(COMMON_DEFAULT_BREADCRUMB);
  /**
   * 面包屑快捷选择
   * @param {number| null} treeId
   * @param {string} treeName
   */
  const handleSearchBreadSelect = (treeId?: number | null, treeName?: string) => {
    if (treeId !== null) {
      const index = searchBreadCrumbList.value.findIndex((item) => item.id === treeId);
      if (index !== -1) {
        searchBreadCrumbList.value = searchBreadCrumbList.value.slice(0, index + 1);
      } else {
        searchBreadCrumbList.value.push({
          id: treeId as number,
          treeName: treeName ?? '',
        });
      }
      console.log(searchBreadCrumbList.value, index, treeId, treeName);
    }
  };
  // 搜索历史
  const historyList = ref<Esh_IHistoryVO[]>([]);
  /**
   * 查询历史
   * @param {Common_EMenuId} menuId
   * @param {string} energyCode
   * @param {string} treeType
   * @returns {Promise<void>}
   */
  const queryHistoryList = async (menuId: Common_EMenuId, energyCode: string, treeType: string): Promise<void> => {
    historyList.value = [];
    const params: Es_IQueryHistoryParams = {
      energyCode,
      treeType,
      menuId,
      userId: FGetStorageData(SESSION_KEY_USER_ID) ? Number(FGetStorageData(SESSION_KEY_USER_ID)) : null,
    };
    const res: Common_IHttpResponseImpl<Esh_IHistoryVO[]> = await commonHttp.post<
      Es_IQueryHistoryParams,
      Esh_IHistoryVO[]
    >(Common_EPath.查询搜索关键字记录列表, params);
    const result = FResHandler<Esh_IHistoryVO[]>(res);
    historyList.value = result ?? [];
  };

  const loading = ref<boolean>(false);
  // 树列表
  const treeList = ref<Common_ITreeVO[]>([]);
  /**
   * 根据父节点id查询列表，不传则查顶级节点列表
   * @param {T} params
   * @param {string} path
   * @returns {Promise<void>}
   */
  const queryTreeList = async <T>(params: T, path: string): Promise<void> => {
    if (!params) {
      loading.value = false;
    }
    uni.showLoading({
      title: '加载中...',
    });
    loading.value = true;
    try {
      const res: Common_IHttpResponseImpl<Common_ITreeVO[]> = await commonHttp.post<T, Common_ITreeVO[]>(path, params);
      const result = FResHandler<Common_ITreeVO[]>(res);
      treeList.value = result ?? [];
      console.log('%c✨✨查询树节点列表✨✨', 'font-size: 24px', params);
    } catch (error) {
      treeList.value = [];
    } finally {
      loading.value = false;
      uni.hideLoading();
    }
  };

  /**
   * 根据父节点id查询列表，不传则查顶级节点列表
   * @param {T} params
   * @returns {Promise<Common_ITreeVO>}
   */
  const mapTreeList = async <T>(params: T): Promise<Common_ITreeVO> => {
    return new Promise(async (resolve, reject) => {
      try {
        const res: Common_IHttpResponseImpl<Common_ITreeVO> = await commonHttp.post<T, Common_ITreeVO>(
          Common_EPath.查询能耗分析顶级节点,
          params,
        );
        const result = FResHandler<Common_ITreeVO>(res);
        resolve(result);
      } catch (error) {
        treeList.value = [];
        reject(error);
      }
    });
  };

  /**
   * 获取当前树节点层级name
   */
  const getTreeNames = (): string => {
    return searchBreadCrumbList.value?.reduce((prev, cur, index) => {
      return index === 0 || index === searchBreadCrumbList.value.length - 1
        ? prev + cur.treeName
        : prev + cur.treeName + '/';
    }, '');
  };

  return {
    treeTypeList,
    treeType,
    searchLabel,
    treeList,
    loading,
    historyList,
    searchBreadCrumbList,
    queryTreeTypeList,
    handleSearchBreadSelect,
    queryTreeList,
    queryHistoryList,
    getTreeNames,
    mapTreeList,
  };
};
