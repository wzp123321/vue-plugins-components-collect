import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { map, Subject, switchMap } from 'rxjs';
import {
  FBlobHandler,
  FConvertToBoolean,
  FConvertToNumber,
  FGetUploadFile,
  FResHandler,
  IRes,
} from 'src/app/common/services/communication/communication.api';
import {
  treeType,
  TypeTree,
  typeTreeOld,
  deviceParam,
  deviceDataList,
  selectDdeviceType,
} from '../manual-entry.api';
import { ManualEntryService } from './manual-entry.service';
import * as lodash from 'lodash';

const PATH = {
  能源类型: '/energy/ems-api/admin/energy/code/queryAsTree',
  树结构: '/energy/ems-api/admin/tree/listTreeByEnergyCodeWithoutAuthority',
  树设备: '/energy/ems-api/admin/tree/bind/point/detail',
};

@Injectable()
export class ManualEntryObjectService {
  constructor(
    private http: HttpClient,
    private nzMessage: NzMessageService,
    private meService: ManualEntryService
  ) {
    // console.log(console.log(this.meService.getEnergyCode))
  }
  // 分类分项
  public get energyCode() {
    return this.meService.getEnergyCode;
  }

  // 录入对象类型
  private treeTypeClass: treeType = {
    selectValue: 1,
    data: [
      { value: 1, label: '区域' },
      { value: 2, label: '业态' },
      { value: 3, label: '支路' },
    ],
  };
  public get treeClassId(): treeType {
    return this.treeTypeClass;
  }

  public set setTreeClassId(data: number) {
    this.treeTypeClass.selectValue = data;
  }
  private typeTreeData: any = [];
  public get getTypeTreeList(): any {
    return this.typeTreeData;
  }
  public set setTypeTreeList(data: any) {
    this.typeTreeData = data;
  }
  private typeExpandKeys: any = [];
  public get typeExpandKeyData(): any {
    return this.typeExpandKeys;
  }
  public set setTypeExpandKeyData(data: any) {
    this.typeExpandKeys = data;
  }

  private loading: boolean = false;
  public get getLoading(): boolean {
    return this.loading;
  }
  public set setLoading(item: boolean) {
    this.loading = item;
  }
  public getTypeList(energyCode: string): void {
    this.loading = true;
    const param = {
      treeType: this.treeTypeClass.selectValue,
      energyCode: energyCode,
      expandLevel: 2,
      wholeHospitalFlag: true,
    };
    this.http
      .post<IRes<TypeTree>>(PATH.树结构, param)
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          const expandKeys: number[] = [];
          const handler = (node: TypeTree, index: number): typeTreeOld => {
            if (!node.id) {
              //  return;
            }

            if (node.treeLevel <= 2) {
              expandKeys.push(node.id);
            }

            return {
              key: node.id,
              title: node.treeName,
              isLeaf: !node.childTree?.length,
              disabled: false,
              parentId: node.parentIds?.split(',').map((v) => v) ?? [],
              children:
                node.childTree?.map((child) => handler(child, index)) ?? [],
            };
          };
          return {
            expandKeys: data?.expandTreeIds,
            treeList: data.data?.map((node: TypeTree, index: number) =>
              handler(node, index)
            ),
          };
        })
      )
      .subscribe({
        next: ({ expandKeys, treeList }) => {
          this.typeTreeData = treeList || [];
          this.typeExpandKeys = expandKeys || [];
          const dataTree = {
            typeTreeData: this.typeTreeData,
            typeExpandKeys: this.typeExpandKeys,
          };
          this.loadTypeTreeData(dataTree);
        },
        error: (error) => {
          console.warn(`查询树列表 -> ${error}`);
          this.typeTreeData = [];
          this.typeExpandKeys = [];
          const dataTree = {
            typeTreeData: lodash.cloneDeep(this.typeTreeData),
            typeExpandKeys: lodash.cloneDeep(this.typeExpandKeys),
          };
          this.loadTypeTreeData(dataTree);
          // this.nzMessage.error(`查询失败，${error}`);
        },
      })
      .add(() => {
        this.loading = false;
      });
  }

  // 初始化获得树节点
  private typetreeDataList = new Subject<any>();
  getTypeDataList = this.typetreeDataList.asObservable();
  loadTypeTreeData(data: any) {
    this.typetreeDataList.next(data);
  }

  /*
   *  设备开始
   */
  private deviceLoading: boolean = false;
  public get getDeviceLoading(): boolean {
    return this.deviceLoading;
  }
  public set setDeviceLoading(item: boolean) {
    this.deviceLoading = item;
  }

  private deviceData: deviceDataList[] = [];
  public get getDeviceData(): deviceDataList[] {
    return this.deviceData;
  }

  public set setDeviceData(data: deviceDataList[]) {
    this.deviceData = data;
  }

  private deviceNodataMsg: string =
    '请先选择' + this.treeTypeClass.selectValue + '节点';
  public get getDeviceNodataMsg(): string {
    return this.deviceNodataMsg;
  }
  public set setDeviceNodataMsg(item: string) {
    this.deviceNodataMsg = item;
  }
  public getDeviceList(param: deviceParam): void {
    this.deviceLoading = true;
    this.http
      .post<IRes<TypeTree>>(PATH.树设备, param)
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          return {
            treeId: data.treeId,
            treeName: data.treeName,
            energyCode: data.formulaInfoList[0]?.energyCode || '',
            pointInfoList: data.formulaInfoList[0]?.pointInfoList || [],
          };
        })
      )
      .subscribe({
        next: ({ treeId, treeName, energyCode, pointInfoList }) => {
          this.deviceData = pointInfoList ?? [];
          if (pointInfoList.length === 0) {
            this.deviceNodataMsg = '该节点下无设备';
          }
        },
        error: (error) => {
          console.warn(`查询设备列表 -> ${error}`);
          this.deviceData = [];
          this.deviceNodataMsg = '该节点下无设备';
        },
      })
      .add(() => {
        this.deviceLoading = false;
      });
  }

  // 初始化设备
  private deviceList = new Subject<any>();
  getDeviceListData = this.deviceList.asObservable();
  deviceDataList(data: any) {
    this.deviceList.next(data);
  }

  // 选中的设备
  private selectDeviceList = new Subject<selectDdeviceType>();
  getSelectDeviceListData = this.selectDeviceList.asObservable();
  selectDdeviceDataList(data: selectDdeviceType) {
    this.selectDeviceList.next(data);
  }
}
