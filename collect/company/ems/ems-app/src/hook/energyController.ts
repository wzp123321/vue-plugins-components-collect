import { ref } from 'vue';
// 枚举
import { Common_EPath } from '@/config/enum';
// 接口
import type { Common_IEnergyVO, Common_IHttpResponseImpl } from '@/api/model';
// 工具方法
import { commonHttp } from '@/api/request';
import { FResHandler } from '@/utils';

// 能源类型、树查询公共逻辑
export const useCommonEnergy = () => {
  // 能源类型
  const energyCode = ref<string>('');
  // 能源类型列表
  const energyCodeList = ref<Common_IEnergyVO[]>([]);
  /**
   * 查询能源类型列表
   */
  const queryEnergyCodeList = async () => {
    const res: Common_IHttpResponseImpl<Common_IEnergyVO[]> = await commonHttp.post<unknown, Common_IEnergyVO[]>(
      Common_EPath.查询带总能耗的能源类型列表,
    );
    const result = FResHandler<Common_IEnergyVO[]>(res);
    console.log('%c✨✨查询能源类型✨✨', 'font-size: 24px', result);
    energyCodeList.value = result ?? [];
  };

  return {
    energyCode,
    energyCodeList,
    queryEnergyCodeList,
  };
};
