import { ref, nextTick } from 'vue';
import { postRequest } from '@/service/request';

import { cloneDeep } from 'lodash';
import message from '@/utils/message';

import {
  CostAccountingQueryPageRequest,
  CostAccountingQueryPageResponse,
  CostAccountingUpdateRequest,
  CostAccountingLineVOList,
  CPAD_IRes,
  CPAD_EEditType,
} from './cost-pre-accounting-deviation.api';
import { Item } from 'ant-design-vue/lib/menu';
import { getTenant } from '@/utils';

enum EPath {
  查询表格数据 = 'costAccounting/queryPage',
  编辑表格数据 = 'costAccounting/update',
  成本预核算偏差编辑按钮权限查询 = '/costAccounting/auth/edit',
}
class CpAdService {
  private _dataSource = ref<CostAccountingQueryPageResponse>({
    incomeCostInfo: {},
    incomeCostTable: {
      titleList: [],
      lineVOList: [],
    },
    directCostInfo: {},
    directCostTable: {
      titleList: [],
      lineVOList: [],
    },
    operateCostInfo: {},
    operateCostTable: {
      titleList: [],
      lineVOList: [],
    },
    totalCostInfo: {},
    monthConcern: [],
    logList: [],
    logListTop5: [],
    commentList: [],
  });

  public get dataSource() {
    return this._dataSource.value;
  }

  private _queryParams = ref<CostAccountingQueryPageRequest>({});
  public get queryParams(): CostAccountingQueryPageRequest {
    return this._queryParams.value;
  }

  private _loading = ref<boolean>(true);
  public get loading(): boolean {
    return this._loading.value;
  }

  private _elTableKey = ref<number>();
  public get elTableKey(): number {
    return this._elTableKey.value as number;
  }
  public set elTableKey(val: number) {
    this._elTableKey.value = val;
  }

  // 日志记录超过5个，多余的隐藏
  private _showAllLimit = ref<number>();
  public get showAllLimit(): number {
    return this._showAllLimit.value as number;
  }
  public set showAllLimit(val: number) {
    this._showAllLimit.value = val;
  }

  private _editParams = ref<CostAccountingUpdateRequest>({});

  /**
   * 是否有权限
   */
  private _editAuthFlag = ref(false);
  public get editAuthFlag() {
    return this._editAuthFlag.value;
  }

  constructor() {
    this._dataSource.value = {
      incomeCostInfo: {
        name: '',
      },
      incomeCostTable: {
        titleList: [],
        lineVOList: [],
      },

      directCostInfo: {
        name: '',
        predictCost: '',
        actualCost: '',
        deviation: '',
        deviationRate: '',
      },
      directCostTable: {
        titleList: [],
        lineVOList: [],
      },
      operateCostInfo: {
        name: '',
        predictCost: '',
        actualCost: '',
        deviation: '',
        deviationRate: '',
      },
      operateCostTable: {
        titleList: [],
        lineVOList: [],
      },
      totalCostInfo: {
        name: '',
        predictCost: '',
        actualCost: '',
        deviation: '',
        deviationRate: '',
      },
      monthConcern: [],
      logList: [],
      logListTop5: [],
      commentList: [],
    };
  }

  public query = async (params: CostAccountingQueryPageRequest, type?: CPAD_EEditType) => {
    this._queryParams.value = params;
    try {
      this._loading.value = true;
      const res: HttpRequestModule.ResTemplate<CostAccountingQueryPageResponse> = await postRequest(
        EPath.查询表格数据,
        params,
      );
      if (type) {
        this._dataSource.value[type] = res.data[type];
        switch (type) {
          case CPAD_EEditType.项目收入:
            this._dataSource.value.incomeCostInfo = res?.data?.incomeCostInfo;
            break;
          case CPAD_EEditType.直接成本:
            this._dataSource.value.directCostInfo = res?.data?.directCostInfo;
            break;
          case CPAD_EEditType.运营成本:
            this._dataSource.value.operateCostInfo = res?.data?.operateCostInfo;
            break;
          default:
            break;
        }
        this._dataSource.value.commentList = res?.data?.commentList ?? [];
        this._dataSource.value.logList = res?.data?.logList ?? [];
        this._dataSource.value.monthConcern = res?.data?.monthConcern ?? [];
        this._dataSource.value.totalCostInfo = res?.data?.totalCostInfo;
      } else {
        this._dataSource.value = {
          incomeCostInfo: res?.data?.incomeCostInfo,
          incomeCostTable: {
            titleList: res?.data?.incomeCostTable?.titleList,
            lineVOList: res?.data?.incomeCostTable?.lineVOList,
          },
          directCostInfo: res?.data?.directCostInfo,
          directCostTable: {
            titleList: res?.data?.directCostTable?.titleList ?? [],
            lineVOList: res?.data?.directCostTable?.lineVOList ?? [],
          },
          operateCostInfo: res?.data?.operateCostInfo,
          operateCostTable: {
            titleList: res?.data?.operateCostTable?.titleList ?? [],
            lineVOList: res?.data?.operateCostTable?.lineVOList ?? [],
          },
          totalCostInfo: res?.data?.totalCostInfo,
          monthConcern: res?.data?.monthConcern ?? [],
          logList: res?.data?.logList ?? [],
          commentList: res?.data?.commentList ?? [],
        };
      }

      this._dataSource.value.logListTop5 = [];
      this._elTableKey.value = Math.random();
      // this.mapElTableCellStyle();
    } catch (error) {
      console.log(error);
      this._dataSource.value = {
        incomeCostInfo: {},
        incomeCostTable: {
          titleList: [],
          lineVOList: [],
        },
        directCostInfo: {},
        directCostTable: {
          titleList: [],
          lineVOList: [],
        },
        operateCostInfo: {},
        operateCostTable: {
          titleList: [],
          lineVOList: [],
        },
        totalCostInfo: {},
        monthConcern: [],
        logList: [],
        logListTop5: [],
        commentList: [],
      };
    } finally {
      this._loading.value = false;
      this.editAuth();
    }
  };

  /**
   * 成本预核算偏差-编辑按钮权限查询
   */
  editAuth = async () => {
    try {
      const res: CPAD_IRes<boolean> = await postRequest(EPath.成本预核算偏差编辑按钮权限查询);
      if (res && res.code === 200 && res.success) {
        this._editAuthFlag.value = res.data;
      } else {
        this._editAuthFlag.value = false;
      }
    } catch (error) {
      this._editAuthFlag.value = false;
    }
  };

  public setEditStore = (val: string) => {
    if (val === '直接成本') {
      this._editParams.value.directCostTable = cloneDeep(this._dataSource.value.directCostTable?.lineVOList);
    }
    if (val === '运营成本') {
      this._editParams.value.operateCostTable = cloneDeep(this._dataSource.value.operateCostTable?.lineVOList);
    }
    if (val === '项目收入(不含税)') {
      this._editParams.value.incomeCostTable = cloneDeep(this._dataSource.value.incomeCostTable?.lineVOList);
    }
  };

  public editSubmit = async (type: CPAD_EEditType) => {
    try {
      this._loading.value = true;
      let params = {};
      switch (type) {
        case CPAD_EEditType.项目收入:
          this._dataSource.value.incomeCostTable?.lineVOList?.map((item) => {
            let key: keyof CostAccountingLineVOList;
            for (key in item) {
              if (item[key] == '') {
                item[key] = null;
              }
            }
          });
          params = {
            incomeList: this._dataSource.value.incomeCostTable.lineVOList,
          };
          break;
        case CPAD_EEditType.直接成本:
          this._dataSource.value.directCostTable?.lineVOList?.map((item) => {
            let key: keyof CostAccountingLineVOList;
            for (key in item) {
              if (item[key] == '') {
                item[key] = null;
              }
            }
          });
          params = {
            directCostList: this._dataSource.value.directCostTable.lineVOList,
          };
          break;
        case CPAD_EEditType.运营成本:
          this._dataSource.value.operateCostTable?.lineVOList?.map((item) => {
            let key: keyof CostAccountingLineVOList;
            for (key in item) {
              if (item[key] == '') {
                item[key] = null;
              }
            }
          });
          params = {
            operateCostList: this._dataSource.value.operateCostTable.lineVOList,
          };
          break;
        default:
          break;
      }
      // this.mapElTableCellStyle();
      const res: HttpRequestModule.ResTemplate<boolean> = await postRequest(EPath.编辑表格数据, {
        ...getTenant(),
        year: new Date(this._queryParams.value.startTime!).getFullYear(),
        month: new Date(this._queryParams.value.startTime!).getMonth() + 1,
        ...params,
      });
      if (res.code === 200 && res.success && res.data) {
        await this.query(this._queryParams.value, type);
        message.success(res?.message ?? '操作成功');
      } else {
        ((this._dataSource.value as { [key: string]: any })[type].lineVOList as any) = (
          this._editParams.value as { [key: string]: any }
        )[type];
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      console.log(error, '编辑失败');
    } finally {
      this._loading.value = false;
    }
  };

  public editCancel = (val: string) => {
    // this.mapElTableCellStyle();
    if (val === '直接成本') {
      (this._dataSource.value.directCostTable.lineVOList as any) = this._editParams.value.directCostTable;
    }
    if (val === '运营成本') {
      (this._dataSource.value.operateCostTable.lineVOList as any) = this._editParams.value.operateCostTable;
    }
    if (val === '项目收入(不含税)') {
      (this._dataSource.value.incomeCostTable.lineVOList as any) = this._editParams.value.incomeCostTable;
    }
  };

  public mapElTableCellStyle = () => {
    nextTick(() => {
      Array.from(document.getElementsByClassName('cell-chidren'))
        .concat(Array.from(document.getElementsByClassName('waring-cell')))
        .forEach((item) => {
          (item.childNodes[0].childNodes[2] as HTMLDivElement).style.maxHeight =
            (item as HTMLTableCellElement).rowSpan * 48 - 8 + 'px';
          (item.childNodes[0].childNodes[2] as HTMLDivElement).style.webkitLineClamp = `${
            (item as HTMLTableCellElement).rowSpan * 2
          }`;
          if ((item as HTMLTableCellElement).rowSpan === 1) {
            (item.childNodes[0].childNodes[2] as HTMLDivElement).style.webkitLineClamp = `${
              (item as HTMLTableCellElement).rowSpan * 1
            }`;
            (item.childNodes[0].childNodes[2] as HTMLDivElement).style.lineHeight = 40 + 'px';
          }
          if ((item as HTMLTableCellElement).innerText === '-') {
            (item.childNodes[0].childNodes[2] as HTMLDivElement).style.lineHeight =
              (item as HTMLTableCellElement).rowSpan * 48 - 8 + 'px';
          }
        });
    });
  };
}

export default CpAdService;
