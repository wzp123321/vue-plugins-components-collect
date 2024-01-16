import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { getStorageData } from '@tiansu/tools';
import { map, Subject } from 'rxjs';
import {
  FResHandler,
  IRes,
} from 'src/app/common/services/communication/communication.api';
import {
  energyDataType,
  INodeTreeOld,
  quickTime,
  verificationParamType,
  selectDdeviceType,
} from '../manual-entry.api';
const PATH = {
  能源类型: '/energy/ems-api/admin/energy/code/queryEnergyAsTreeByTreeType',
  树结构: '/energy/ems-api/admin/tree/list',
  树设备: '/energy/ems-api/admin/tree/bind/point/detail',
  服务器时间: '/energy/ems-api/common/system/time',
};

@Injectable({
  providedIn: 'root',
})
export class ManualEntryService {
  constructor(private http: HttpClient, private nzMessage: NzMessageService) {
    // this.getEnergy();
    this.getSystemTime();
  }

  // 分类分项
  private energyExpandKeys: any = [];
  public get energyExpandKeyData(): any {
    return this.energyExpandKeys;
  }
  private energyList: any = [];
  public get energyData(): any {
    return this.energyList;
  }
  private energyCode: string = '';
  public get getEnergyCode(): string {
    return this.energyCode;
  }
  private energyCodeInit: string = '';
  public get getEnergyCodeInit(): string {
    return this.energyCodeInit;
  }

  public set setEnergyCode(item: string) {
    this.energyCode = item;
  }
  /**
   * 获得分类分项
   */
  public getEnergy(classId: number, flag: boolean): void {
    this.http
      .post<IRes<energyDataType>>(PATH.能源类型, classId)
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          const expandKeys: string[] = [];
          const handler = (node: energyDataType): INodeTreeOld => {
            if (!node.id) {
              //  return;
            }
            expandKeys.push(node.code);
            return {
              key: node.code,
              unit: node.unit,
              title: node.name,
              isLeaf: !node.childEnergyCode?.length,
              disabled: false,
              parentId: node.parentCode?.split(',').map((v) => v) ?? [],
              children:
                node.childEnergyCode?.map((child) => handler(child)) ?? [],
            };
          };
          return {
            defaultValue: data[0]?.code,
            unit: data[0]?.unit,
            expandKeys,
            treeList: data?.map((node: energyDataType) => handler(node)),
          };
        })
      )
      .subscribe({
        next: ({ defaultValue, unit, expandKeys, treeList }) => {
          this.energyList = treeList;
          this.energyExpandKeys = expandKeys;
          this.energyCode = defaultValue;
          this.energyCodeInit = defaultValue;
          this.getEnergyItem({
            code: defaultValue,
            unit,
            count: flag,
          });
        },
        error: (error) => {
          console.warn(`查询分类分项 -> ${error}`);
          this.getEnergyItem('');
          this.energyCodeInit = '';
          // this.nzMessage.error(`查询失败，${error}`);
        },
      })
      .add(() => {});
  }

  private entryItem = new Subject<any>();
  entryCodeItem = this.entryItem.asObservable();
  getEnergyItem(data: any) {
    this.entryItem.next(data);
  }

  // 录入值类型
  private inputValueType: any = [
    { value: '1', name: '消耗值' },
    { value: '2', name: '表头值' },
  ];
  public get getInputValueType(): any {
    return this.inputValueType;
  }
  public set setInputValueType(data: any) {
    this.inputValueType = data;
  }
  /**
   * 获取缓存数据
   * @param name
   * @returns
   */
  private FGetStorageData(name: string) {
    return getStorageData(name);
  }
  /**
   * 服务器时间
   */
  private systemTime: string = '';
  public get getSystemDate(): string {
    return this.systemTime;
  }
  public getSystemTime(): void {
    this.http
      .post<IRes<energyDataType>>(PATH.服务器时间, {
        tenantCode: this.FGetStorageData('energy-corpid') || '',
      })
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          return {
            time: data,
          };
        })
      )
      .subscribe({
        next: ({ time }) => {
          this.systemTime = time;
          this.getStartData(time);
        },
        error: (error) => {
          console.warn(`查询服务器时间 -> ${error}`);
          this.systemTime = '';
          this.getStartData('');
        },
      })
      .add(() => {});
  }
  private startData = new Subject<any>();
  startDataValue = this.startData.asObservable();
  getStartData(data: any) {
    this.startData.next(data);
  }

  /**
   * 快捷时间
   */
  private quickTimeList: quickTime[] = [
    { id: 2, name: '按日' },
    { id: 1, name: '按月' },
  ];
  public get getQuickTimeList(): quickTime[] {
    return this.quickTimeList;
  }

  /**
   * 查询参数
   */
  private searchParam = new Subject<verificationParamType>();
  getSearchParamList = this.searchParam.asObservable();
  getSearchDataList(data: verificationParamType) {
    this.searchParam.next(data);
  }

  /**
   * 验证参数
   * @param param
   */
  verificationParam(param: verificationParamType) {
    if (!param.energyCode) {
      this.nzMessage.error('请选择能源类型！');
      return false;
    }
    if (param.entryType === '0') {
      if (!param.startDate) {
        this.nzMessage.error('请选择开始时间！');
        return false;
      }
      if (!param.endDate) {
        this.nzMessage.error('请选择结束时间！');
        return false;
      }
    } else {
      if (!param.startDate && !param.endDate) {
        this.nzMessage.error('请选择数据时间！');
        return false;
      }
    }
    return true;
  }

  /**
   * 重置
   */
  private isReset = new Subject<any>();
  getIsResetType = this.isReset.asObservable();
  getIsReset(data: any) {
    this.isReset.next(data);
  }
  /**
   * 录入对象选中
   */
  private objectSelect = new Subject<selectDdeviceType>();
  getObjectSelect = this.objectSelect.asObservable();
  getObjectSelectData(data: selectDdeviceType) {
    this.objectSelect.next(data);
  }
}
