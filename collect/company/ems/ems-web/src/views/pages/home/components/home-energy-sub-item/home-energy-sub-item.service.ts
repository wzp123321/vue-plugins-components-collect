/*
 * @Author: yut
 * @Date: 2023-11-18 15:38:14
 * @LastEditors: yut
 * @LastEditTime: 2023-11-29 11:13:18
 * @Descripttion:
 */
import { ref } from 'vue';
import {
  EPath,
  HESI_CompParams,
  HESI_IEnergyItem,
  HESI_IEnergyItemRatio,
  HESI_IFlag,
} from './home-energy-sub-item.api';
import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';
import message from '@/utils/message';

class HomeEnergySubItemService {
  /**
   * 能源类型列表
   */
  private _energyTypeList = ref<HESI_IEnergyItem[]>([]);
  public get energyTypeList() {
    return this._energyTypeList.value;
  }

  /**
   * 上一级树id
   */
  private _prevTreeId = ref<number | null>(null);
  public get prevTreeId() {
    return this._prevTreeId.value;
  }
  public set prevTreeId(val) {
    this._prevTreeId.value = val;
  }

  /**
   * loading
   */
  private _loading = ref(true);
  public get loading() {
    return this._loading.value;
  }

  /**
   * nodata
   */
  private _noData = ref<HESI_IFlag>({
    flag: false,
    msg: '',
  });
  public get noData() {
    return this._noData.value;
  }

  /**
   * noNode
   */
  private _noNode = ref(false);
  public get noNode() {
    return this._noNode.value;
  }

  /**
   * noConfig
   */
  private _noConfig = ref<HESI_IFlag>({
    flag: false,
    msg: '',
  });
  public get noConfig() {
    return this._noConfig.value;
  }
  public set noConfig(val) {
    this._noConfig.value = val;
  }

  /**
   * 查询组件参数
   */
  private _queryParams = ref<HESI_CompParams>({
    componentId: '',
    energyCode: '',
    treeId: null,
  });
  public get queryParams() {
    return this._queryParams.value;
  }
  public set queryParams(val) {
    this._queryParams.value = val;
  }

  /**
   * 饼图数据
   */
  private _pieChartData = ref<HESI_IEnergyItemRatio>();
  public get pieChartData() {
    return this._pieChartData.value;
  }

  /**
   * 获取能源类型列表
   */
  public getEnergyTypeList = async () => {
    try {
      const res: HttpRequestModule.ResTemplate<HESI_IEnergyItem[]> = await postRequest(EPath.获取能源类型列表);
      if (res.code === 200 && res.success && res.data) {
        this.convert(res.data);
      } else {
        this._energyTypeList.value = [];
      }
    } catch (error) {
      this._energyTypeList.value = [];
    }
  };

  private convert = (data: HESI_IEnergyItem[]) => {
    this._energyTypeList.value = data.map(item => {
      return {
        code: item.code,
        name: item.name,
      };
    });
    this._queryParams.value.energyCode = this._energyTypeList.value[0]?.code;
  };

  getPieChartData = async () => {
    try {
      this._loading.value = true;
      const res: HttpRequestModule.ResTemplate<HESI_IEnergyItemRatio> = await postRequest(EPath.获取饼图数据, {
        ...getCampusParams(),
        ...this._queryParams.value,
      });
      if (res.code === 200 && res.success && res.data) {
        this._pieChartData.value = res.data;
        if (res.data.pieChartDataList.length) {
          this._noData.value.flag = false;
        } else {
          this._noData.value.flag = true;
          this._noData.value.msg = '暂无数据';
        }
        this._noNode.value = false;
      } else {
        this._pieChartData.value = undefined;
        this._noData.value.flag = false;
        this._noConfig.value.flag = false;
        if (res?.message.includes('未配置数据源')) {
          this._noConfig.value.flag = true;
          this._noNode.value = false;
        } else if (res?.message.includes('所选择的节点暂无子节点')) {
          this._noNode.value = true;
          message.error(res.message);
        } else {
          this._noData.value.flag = true;
          this._noNode.value = false;
        }
        this._noConfig.value.msg = res?.message.includes('未配置数据源')
          ? '暂未配置'
          : res.message.includes('操作失败')
          ? '暂无数据'
          : res.message;
        this._noData.value.msg = res?.message.includes('未配置数据源')
          ? '暂未配置'
          : res.message.includes('操作失败')
          ? '暂无数据'
          : res.message;
      }
    } catch (error) {
      this._loading.value = false;
    } finally {
      this._loading.value = false;
    }
  };
}

export default HomeEnergySubItemService;
