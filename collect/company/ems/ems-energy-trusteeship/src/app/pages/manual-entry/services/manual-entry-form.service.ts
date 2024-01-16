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
  formQuickTime,
  manualEntryParam,
  getObjectEnery,
} from '../manual-entry.api';
import { ManualEntryTableDataService } from './manual-entry-table-data.service';
import { ManualEntryService } from './manual-entry.service';

const PATH = {
  人工录入查询历史能耗值: '/energy/ems-api/manualentry/queryPreviewValue',
  人工录入新增: '/energy/ems-api/manualentry/add',
};

@Injectable()
export class ManualEntryFormService {
  // 时间类型
  private shortCutData: formQuickTime[] = [
    { id: 1, name: '按日' },
    { id: 2, name: '按月' },
  ];
  public get getShortCutData(): formQuickTime[] {
    return this.shortCutData;
  }
  public set setShortCutData(data: formQuickTime[]) {
    this.shortCutData = data;
  }
  constructor(
    private http: HttpClient,
    private nzMessage: NzMessageService,
    private meService: ManualEntryService,
    private meTableDataService: ManualEntryTableDataService
  ) {}

  // 人工录入查询历史能耗值 显示、数据
  private entryValueHistory: number = null;
  // 保存开关
  private submittingFlag: boolean = false;

  public get getEntryValueHistory(): number {
    return this.entryValueHistory;
  }
  public set setEntryValueHistory(data: number) {
    this.entryValueHistory = data;
  }

  private isHistroyShow: boolean = false;
  public get getIsHistroyShow(): boolean {
    return this.isHistroyShow;
  }
  public set setIsHistroyShow(data: boolean) {
    this.isHistroyShow = data;
  }

  private entryItem = new Subject<any>();
  entryCodeItemChange = this.entryItem.asObservable();
  getEnergyItemChange(data: any) {
    this.entryItem.next(data);
  }

  /**
   * 人工录入查询历史能耗值
   * @param param
   */
  public getObjectEnery(param: getObjectEnery): void {
    const flag = this.verificationObjectEnergy(param);
    let params: any = {};
    const keys = [
      'allocationFlag',
      'allocationRule',
      'dateType',
      'endDate',
      'energyCode',
      'entryType',
      'entryValue',
      'objectId',
      'objectName',
      'objectType',
      'pointNumber',
      'standardPointCode',
      'startDate',
      'tenantCode',
    ];
    Object.entries(param).forEach(([k, v]) => {
      if (keys.includes(k)) {
        params[k] = v;
      }
    });
    if (!flag) {
      this.entryValueHistory = null;
      this.isHistroyShow = false;
      return;
    }
    this.http
      .post<IRes<any>>(PATH.人工录入查询历史能耗值, params)
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          return {
            Total: data.total,
            Unit: data.unit,
          };
        })
      )
      .subscribe({
        next: ({ Total }) => {
          this.entryValueHistory = Total;
          this.isHistroyShow = true;
        },
        error: (error) => {
          console.warn(`查询人工录入查询历史能耗值 -> ${error}`);
          this.entryValueHistory = null;
          this.isHistroyShow = false;
        },
      })
      .add(() => {});
  }
  /**
   * 人工录入查询历史能耗值参数验证
   * @param param
   * @returns
   */
  verificationObjectEnergy(param: getObjectEnery) {
    //console.log('验证',param)
    if (!param.energyCode) {
      this.nzMessage.error('请选择能源类型！');
      return false;
    }
    if (!param.objectId) {
      this.nzMessage.error('请选择录入对象！');
      return false;
    }
    if (!param.energyType) {
      this.nzMessage.error('请选择录入值类型！');
      return false;
    }
    if (!param.startDate || !param.endDate) {
      this.nzMessage.error('请选择数据时间！');
      return false;
    }
    return true;
  }

  // 新增成功之后关闭弹窗
  private isShowForm = new Subject<boolean>();
  getIsShowForm = this.isShowForm.asObservable();
  formOpen(data: boolean) {
    this.isShowForm.next(data);
  }
  /**
   * 人工录入新增
   * @param param
   */
  public getSaveObjectEnery(param: manualEntryParam): void {
    if (this.submittingFlag) {
      return;
    }
    this.submittingFlag = true;

    const flag = this.verificationSaveObjectEnergyParam(param);
    if (!flag) {
      return;
    }
    this.http
      .post<IRes<any>>(PATH.人工录入新增, param)
      .pipe(
        map((res) => {
          const data: any = FResHandler(res);
          return {
            str: data,
          };
        })
      )
      .subscribe({
        next: ({ str }) => {
          if (str === 1) {
            this.nzMessage.success(
              '等待后台服务进行处理，请稍候查询节点能耗确认数据是否录入成功。'
            );
          }
          this.formOpen(true);
          this.meService.getSearchParamList.subscribe((data) => {
            if (!data.objectId) {
              const valueInputType = [
                { value: '1', name: '消耗值' },
                { value: '2', name: '表头值' },
              ];
              this.meService.setInputValueType = valueInputType;
            } else {
              if (data.objectType === '1') {
                const valueInputType = [{ value: '1', name: '消耗值' }];
                this.meService.setInputValueType = valueInputType;
              } else {
                const valueInputType = [
                  { value: '1', name: '消耗值' },
                  { value: '2', name: '表头值' },
                ];
                this.meService.setInputValueType = valueInputType;
              }
            }
          });

          this.meTableDataService.Data_Table_Index = 1;
          this.meTableDataService.Data_Table_Size = 10;
          this.meTableDataService.Event_Table_PaginationChange.emit();

          this.submittingFlag = false;
        },
        error: (error) => {
          console.warn(`人工录入录入-> ${error}`);
          if (!error?.includes('login')) {
            this.nzMessage.error(error);
          }
          // this.formOpen(true);
          this.submittingFlag = false;
        },
      })
      .add(() => {});
  }
  /**
   * 人工录入新增参数
   * @param param
   * @returns
   */
  verificationSaveObjectEnergyParam(param: manualEntryParam) {
    if (!param.objectId) {
      this.nzMessage.error('请选择录入对象！');
      return false;
    }
    if (!param.energyCode) {
      this.nzMessage.error('请选择能源类型！');
      return false;
    }
    if (!param.entryType) {
      this.nzMessage.error('请选择录入值类型！');
      return false;
    }
    if (param.entryType === '1') {
      if (param.allocationFlag === '1' && !param.allocationRule) {
        this.nzMessage.error('请选择分摊规则！');
        return false;
      }
    }
    if (!param.endDate || !param.startDate) {
      this.nzMessage.error('请选择数据时间！');
      return false;
    }

    if (Number(param.entryValue) <= 0) {
      this.nzMessage.error('请输入大于0的录入值！');
      return false;
    }

    return true;
  }
}
