import globalParameterService from './ra-global-parameter-manage/service/ra-global-parameter-manage.service';
import { AssociateDeviceDetail } from './relation-analysis.api';

const useRelationAnalysisController = () => {
  /**
   * 获取设备列表
   * @param standardPointCode
   * @returns 设备列表
   */
  const getDeviceList = (standardPointCode: string): Promise<AssociateDeviceDetail[]> => {
    return new Promise(async (resolve) => {
      try {
        const res = await globalParameterService.getAssociateDeviceList({
          standardPointCode,
        });
        if (res && res.code === 200 && res.success) {
          const list = res.data;
          resolve(list);
        } else {
          resolve([]);
        }
      } catch (error) {
        resolve([]);
      }
    });
  };

  return { getDeviceList };
};

export default useRelationAnalysisController;
