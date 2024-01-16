import { FResHandler } from '@/utils/index';
import { postRequest } from '@/services/request';
import { ref } from 'vue';
import { RA_GPM_IDeviceInfo, RA_GPM_IPointInfo, RA_GPM_IPointSelectInfo } from './ra-gpm-point-select.api';

enum EPath {
  查询设备列表 = '/admin/correlation/device/query',
}

class RaPointSelectService {
  //#region
  private _visible = ref<boolean>(false);

  private _deviceList = ref<RA_GPM_IDeviceInfo[]>([]);

  private _pointList = ref<RA_GPM_IPointInfo[]>([]);

  private _selectDetail = ref<RA_GPM_IPointSelectInfo>({
    deviceId: '',
    deviceName: '',
    pointId: '',
    pointName: '',
  });

  private _originSelectDetail = ref<RA_GPM_IPointSelectInfo>({
    deviceId: '',
    deviceName: '',
    pointId: '',
    pointName: '',
  });

  private _deviceLoading = ref<boolean>(false);

  private _pointLoading = ref<boolean>(false);

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get deviceList(): RA_GPM_IDeviceInfo[] {
    return this._deviceList.value;
  }

  public get pointList(): RA_GPM_IPointInfo[] {
    return this._pointList.value;
  }

  public get selectDetail(): RA_GPM_IPointSelectInfo {
    return this._selectDetail.value;
  }

  public get originSelectDetail(): RA_GPM_IPointSelectInfo {
    return this._originSelectDetail.value;
  }

  public get deviceLoading(): boolean {
    return this._deviceLoading.value;
  }

  public get pointLoading(): boolean {
    return this._pointLoading.value;
  }
  //#region

  show(deviceId: string, deviceName: string, pointId: string, pointName: string, standardPointCode: string) {
    this._selectDetail.value.deviceId = deviceId;
    this._selectDetail.value.deviceName = deviceName;
    this._selectDetail.value.pointId = pointId;
    this._selectDetail.value.pointName = pointName;

    this._originSelectDetail.value.deviceId = deviceId;
    this._originSelectDetail.value.deviceName = deviceName;
    this._originSelectDetail.value.pointId = pointId;
    this._originSelectDetail.value.pointName = pointName;

    this._deviceList.value = [];
    this._pointList.value = [];

    this._visible.value = true;

    this.queryDeviceList(standardPointCode ?? '');
  }

  async queryDeviceList(standardPointCode: string) {
    try {
      this._deviceLoading.value = true;
      const res = await postRequest(EPath.查询设备列表, { standardPointCode });
      const result = FResHandler<RA_GPM_IDeviceInfo[]>(res);
      if (result?.length) {
        this._deviceList.value = result;
      }
    } catch (error) {
      this._deviceList.value = [];
      this._pointList.value = [];
      this._pointLoading.value = false;
    } finally {
      this._deviceLoading.value = false;
    }
  }

  handleSubmit() {
    this._originSelectDetail.value = this._selectDetail.value;

    this._visible.value = false;
  }

  handleClose() {
    this._visible.value = false;
  }
}

export default new RaPointSelectService();
