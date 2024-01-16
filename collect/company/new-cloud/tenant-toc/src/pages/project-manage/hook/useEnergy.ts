import { ref } from 'vue';
import { EnergyCode } from '../services/project-manage.api';
import projectManageService from '../services/project-manage.service';
import { FResHandler } from '@/pages/management-analysis/ma-home/services';

export const useEnergyList = () => {
  // 能源类型
  const energyCodeList = ref<EnergyCode[]>([]);
  // code-name Map
  const energyCodeNameMap = ref<Map<string, string>>(new Map());
  // code-unit Map
  const energyCodeUnitMap = ref<Map<string, string>>(new Map());
  // name-unit Map
  const energyNameUnitMap = ref<Map<string, string>>(new Map());
  /**
   * 查询能源类型
   */
  const queryEnergyList = async () => {
    try {
      const res = await projectManageService.queryAllEnergyCode();
      const result = FResHandler(res);
      energyCodeList.value = result ?? [];
      energyCodeList.value?.forEach((item) => {
        energyCodeNameMap.value.set(item.code, item.name);
        energyCodeUnitMap.value.set(item.code, item.unit);
        energyNameUnitMap.value.set(item.name, item.unit);
      });
    } catch (error) {
      energyCodeList.value = [];
    }
  };

  return {
    energyCodeList,
    energyCodeNameMap,
    energyCodeUnitMap,
    energyNameUnitMap,
    queryEnergyList,
  };
};
