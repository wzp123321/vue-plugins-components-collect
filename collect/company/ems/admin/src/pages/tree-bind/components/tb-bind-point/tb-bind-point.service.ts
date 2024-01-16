import { ref } from 'vue';
import {
  EPath,
  Tb_ICommonVO,
  Tb_IDataListObj,
  Tb_IGetDeviceParams,
  Tb_IGetPointParams,
  Tb_IPointInfoListInfo,
} from './tb-bind-point.api';
import { postRequest } from '@/services/request';

class TbBindPointService {
  //场站
  private _stationObj = ref<Tb_IDataListObj<Tb_ICommonVO[]>>({
    loading: true,
    checkedId: -1,
    dataList: [],
  });
  public get stationObj() {
    return this._stationObj.value;
  }
  public set stationObj(val) {
    this._stationObj.value = val;
  }

  //设备
  private _deveiceObj = ref<Tb_IDataListObj<Tb_ICommonVO[]>>({
    loading: true,
    checkedId: -1,
    dataList: [],
  });
  public get deveiceObj() {
    return this._deveiceObj.value;
  }
  public set deveiceObj(val) {
    this._deveiceObj.value = val;
  }

  //点位
  private _pointObj = ref<Tb_IDataListObj<Tb_IPointInfoListInfo[]>>({
    loading: true,
    checkedId: -1,
    dataList: [],
  });
  public get pointObj() {
    return this._pointObj.value;
  }
  public set pointObj(val) {
    this._pointObj.value = val;
  }

  //获取场站的参数
  private _getStationParams = ref<{ standardPointCode: string }>({
    standardPointCode: '',
  });
  public get getStationParams() {
    return this._getStationParams.value;
  }
  public set getStationParams(val) {
    this._getStationParams.value = val;
  }

  //获取设备的参数
  private _getDeviceParams = ref<Tb_IGetDeviceParams>({
    standardPointCode: '',
    concentratorId: -1,
  });
  public get getDeviceParams() {
    return this._getDeviceParams.value;
  }
  public set getDeviceParams(val) {
    this._getDeviceParams.value = val;
  }
  //获取点位的参数
  private _getPointParams = ref<Tb_IGetPointParams>({
    energyCode: '',
    id: -1,
  });
  public get getPointParams() {
    return this._getPointParams.value;
  }
  public set getPointParams(val) {
    this._getPointParams.value = val;
  }

  //已选列表
  private _checkedList = ref<Tb_IPointInfoListInfo[]>([]);
  public get checkedList() {
    return this._checkedList.value;
  }
  public set checkedList(val) {
    this._checkedList.value = val;
  }

  /**
   * 获取场站数据
   */
  public getStationData = async () => {
    try {
      this._stationObj.value.loading = true;
      const res: HttpRequestModule.ResTemplate<Tb_ICommonVO[]> = await postRequest(
        EPath.获取集中器数据,
        this._getStationParams.value,
      );
      if (res.code === 200 && res.success && res.data) {
        this._stationObj.value.dataList = res.data;
        this._stationObj.value.checkedId = res.data?.length ? res.data[0].id : -1;
        this._stationObj.value.loading = false;
      } else {
        this._stationObj.value.dataList = [];
        this._stationObj.value.loading = false;
      }
    } catch (error) {
      this._stationObj.value.dataList = [];
      this._stationObj.value.loading = false;
    }
  };

  /**
   * 根据集中器id获取设备列表
   * @param params
   */
  public getDeviceDataList = async () => {
    try {
      this._deveiceObj.value.loading = true;
      const res: HttpRequestModule.ResTemplate<Tb_ICommonVO[]> = await postRequest(
        EPath.根据集中器ID获取设备列表,
        this._getDeviceParams.value,
      );
      if (res.code === 200 && res.success && res.data) {
        this._deveiceObj.value.dataList = res.data;
        this._deveiceObj.value.checkedId = res.data?.length ? res.data[0].id : -1;
        this._deveiceObj.value.loading = false;
      } else {
        this._deveiceObj.value.dataList = [];
        this._deveiceObj.value.loading = false;
      }
    } catch (error) {
      this._deveiceObj.value.dataList = [];
      this._deveiceObj.value.loading = false;
    }
  };
  /**
   * 根据设备id获取点位列表
   * @param params
   */
  public getPointDataList = async () => {
    try {
      this._pointObj.value.loading = true;
      const res: HttpRequestModule.ResTemplate<Tb_IPointInfoListInfo[]> = await postRequest(
        EPath.根据设备ID获取点位列表,
        this._getPointParams.value,
      );
      if (res.code === 200 && res.success && res.data) {
        this._pointObj.value.dataList = res.data.map((item) => {
          item.isChecked = false;
          return item;
        });
        this._pointObj.value.loading = false;
      } else {
        this._pointObj.value.dataList = [];
        this._pointObj.value.loading = false;
      }
    } catch (error) {
      this._pointObj.value.dataList = [];
      this._pointObj.value.loading = false;
    }
  };
}
export default TbBindPointService;
