import { Injectable } from '@angular/core';
import { RESTFULService } from '@src/app/common/services/communication/restful.service';
import {
  FCommonResponseHandler,
  FGetRequestBody,
  ICommonResponse,
  URL_PATH,
} from '@src/app/common/services/communication/communication.api';
import { IEnergyCode, IEventType, TEnergyEvent } from './energy-events.api';
import { ToastService } from 'ng-zorro-antd-mobile';

@Injectable({
  providedIn: 'root',
})
export class EnergyEventsService {
  constructor(private sRESTFUL: RESTFULService, private _toast: ToastService) {}

  // 能源事件类型下拉列表
  public async getEventTypeInfoList(): Promise<IEventType[]> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<IEventType[]>>(
        `${URL_PATH.EnergyEvent.getEventTypeInfoList}`
      );
      return FCommonResponseHandler<IEventType[]>(res);
    } catch (error) {
      throw error;
    }
  }

  // 能源事件下拉区域树
  public async getDropdownAntTreeList(body: {
    areaId?: number;
    areaName?: string;
    yardCodes?: string;
  }): Promise<any> {
    const param = {
      areaId: body.areaId,
      areaName: body.areaName,
      treeType: 1,
    };
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<any>>(
        `${URL_PATH.EnergyEvent.getDropdownAntTreeList}`,
        FGetRequestBody(param)
      );
      return FCommonResponseHandler<any>(res);
    } catch (error) {
      throw error;
    }
  }

  // 能源事件下拉业态树
  public async getBusinessNodeTreeList(
    { id, name }: { id?: number; name?: string } = { id: 0, name: '' }
  ): Promise<any> {
    const param = {
      areaId: id,
      areaName: name,
      treeType: 2,
    };
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<any>>(
        `${URL_PATH.EnergyEvent.getDropdownAntTreeList}`,
        FGetRequestBody(param)
      );
      return FCommonResponseHandler<any>(res);
    } catch (error) {
      throw error;
    }
  }

  // 新增(修改)能源事件
  public async saveEventForm(data: TEnergyEvent): Promise<boolean> {
    try {
      // const form: FormData = new FormData();
      // form.append('json', FGetRequestBody(data));
      const res = await this.sRESTFUL.post<ICommonResponse<boolean>>(
        `${URL_PATH.EnergyEvent.saveEventForm}`,
        FGetRequestBody(data)
      );
      return FCommonResponseHandler<boolean>(res);
    } catch (error) {
      this._toast.info('保存失败', 2000, null, true);
      throw error;
    }
  }

  // 分类分项列表
  public async getEnergyCodeList(): Promise<IEnergyCode[]> {
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<IEnergyCode[]>>(
        `${URL_PATH.EnergyEvent.getEnergyCodeList}`
      );
      return FCommonResponseHandler<IEnergyCode[]>(res);
    } catch (error) {
      throw error;
    }
  }

  // 设备列表
  public async getDropdownDeviceList(body: any): Promise<any> {
    let params: { [key: string]: any } = {};
    Object.keys(body).forEach((key) => {
      if (key !== 'pageIndex') {
        params[key] = body[key];
      }
    });
    params = {
      ...params,
      ...{
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        searchCount: true,
      },
      ...{
        pageNum: body.pageIndex,
      },
    };

    let param: FormData = new FormData();
    param.append('query', FGetRequestBody(params));
    try {
      const res = await this.sRESTFUL.post<ICommonResponse<void>>(
        URL_PATH.EnergyEvent.getDropdownDeviceList,
        FGetRequestBody(params)
      );
      return FCommonResponseHandler<any>(res);
    } catch (error) {
      throw error;
    }
  }
  //  sessionStorage监听
  sessionStorageFunction(key: string, newValue: string) {
    let setItemEvent: any = new Event('setItemEvent');
    setItemEvent.newValue = newValue;
    window.dispatchEvent(setItemEvent);
  }
}
