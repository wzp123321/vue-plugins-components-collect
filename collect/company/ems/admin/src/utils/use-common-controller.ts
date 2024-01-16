import { reactive, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Deffer from './index';
import useCurrentInstance from './use-current-instance';
import commonService from '../services/common/common';
// utils
import mitt from 'mitt';
const emitter = mitt();

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

  /**
   * 请求能源类型列表/分类分项列表--树结构
   */
  const getEnergyCodeTree = async () => {
    const deffer = new Deffer();
    try {
      const res = await commonService.getAllEnergyCodeTree();
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
  const getEnergyTree = async () => {
    const deffer = new Deffer();
    try {
      const res = await commonService.getEnergyCodeTree();
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
      const res = await commonService.getAllEnergyCodeList();
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
      const res = await commonService.getEnergyTopLevelList();
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
   * 获取分类分项列表无parent
   * @returns
   */
  const getEnergyCodeListNoParent = async () => {
    const deffer = new Deffer();
    try {
      const res = await commonService.getEnergyCodeListWithOutParent();
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
   * 请求分析对象列表/tree列表--不带空间中心
   */
  const getTreeWidthoutLocationList = async () => {
    const deffer = new Deffer();
    const { treeType } = commonRequestState;
    try {
      const res = await commonService.getEmsTreeListWidthoutLocation({
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
   * 请求分析对象列表/tree列表
   */
  const getListEnergyParentCodeExcludeTotal = async () => {
    const deffer = new Deffer();
    try {
      const res = await commonService.getEnergyParentCodeExcludeTotal();
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
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.reject(error);
    }
    return deffer.promise;
  };

  return {
    ...toRefs(commonRequestState),
    proxy,
    route,
    router,

    getTreeWidthoutLocationList,
    getEnergyCodeTree,
    getEnergyTree,
    getTreeList,
    getServerDate,
    getEnergyCodeList,
    getEnergyTopLevelList,
    getEnergyCodeListNoParent,
    getListEnergyParentCodeExcludeTotal,
  };
};

export default emitter;
