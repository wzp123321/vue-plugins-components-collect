import { reactive, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Deffer from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
import EnergyCodeService from '@/services/energycode-management/energycode-management.service';
import commonService from '@/services/common/common.service';

interface CommonRequestState {
  treeType: number;
}

/**
 * 公共模块
 * @returns
 */
export const useCommonController = () => {
  const { proxy } = useCurrentInstance();
  const route = useRoute();
  const router = useRouter();
  const commonRequestState = reactive<CommonRequestState>({
    treeType: 1,
  });
  const emitter = proxy && proxy.emitter;

  /**
   * 请求能源类型列表/分类分项列表--树结构
   */
  const getEnergyCodeTree = async () => {
    const deffer = new Deffer();
    try {
      const res = await commonService.queryEnergyFlagOneExcludeTotalTree();
      if (res && res.code === 200) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.reject(error);
    }
    return deffer.promise;
  };
  /**
   * 请求能源类型列表/分类分项列表--树结构
   */
  const queryEnergyFlagOneExcludeTotalTree = async () => {
    const deffer = new Deffer();
    try {
      const res = await commonService.queryEnergyFlagOneExcludeTotalTree();
      if (res && res.code === 200) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.reject(error);
    }
    return deffer.promise;
  };
  /**
   * 获取分类分项列表 平铺
   * @returns
   */
  const getEnergyCodeList = async () => {
    const deffer = new Deffer();
    try {
      const res = await EnergyCodeService.getAllEnergyCodeList();
      if (res && res.code === 200) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.reject(error);
    }
    return deffer.promise;
  };
  /**
   * 获取计入能耗分类分项顶级节点列表
   * @returns
   */
  const getEnergyTopLevelList = async () => {
    const deffer = new Deffer();
    try {
      const res = await EnergyCodeService.getEnergyTopLevelList();
      if (res && res.code === 200) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.reject(error);
    }
    return deffer.promise;
  };
  /**
   * 获取树列表---- 携带展开层级、节点列表
   * @returns
   */
  const getTreeListWithExpandKeys = async (
    treeType: number,
    energyCode: string,
    expandLevel: number = 2,
    wholeHospitalFlag: boolean = false,
    leLevel?: number,
  ) => {
    const deffer = new Deffer();
    try {
      const res = await commonService.getEmsTreeInfoWithExpandKeys({
        energyCode,
        treeType,
        expandLevel,
        leLevel,
        wholeHospitalFlag,
      });
      if (res && res.code === 200 && res.data) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve({});
      }
    } catch (error) {
      deffer.resolve({});
    }
    return deffer.promise;
  };
  /**
   * 请求分析对象列表/tree列表
   */
  const getTreeList = async () => {
    const deffer = new Deffer();
    const { treeType } = commonRequestState;
    try {
      const res = await commonService.getEmsTreeInfo({
        treeType,
      });
      if (res && res.code === 200 && res.data) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.reject(error);
    }
    return deffer.promise;
  };
  /**
   * 获取服务器时间
   */
  const getServerDate = async () => {
    const deffer = new Deffer();
    try {
      const res = await commonService.getServerDate();
      if (res) {
        deffer.resolve(res);
      } else {
        deffer.resolve(new Date());
      }
    } catch (error) {
      deffer.resolve(new Date());
    }
    return deffer.promise;
  };
  /**
   * 根据type获取字典
   */
  const getDictDataByCode = async (type: string) => {
    const deffer = new Deffer();
    try {
      const res = await commonService.getDictionaryData(type);
      if (res) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.resolve([]);
    }
    return deffer.promise;
  };

  return {
    ...toRefs(commonRequestState),
    proxy,
    emitter,
    route,
    router,
    getTreeListWithExpandKeys,
    getEnergyCodeTree,
    getTreeList,
    getServerDate,
    getEnergyCodeList,
    getEnergyTopLevelList,
    queryEnergyFlagOneExcludeTotalTree,
    getDictDataByCode,
  };
};
