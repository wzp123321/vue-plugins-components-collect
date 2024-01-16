/*
 * @Author: yut
 * @Date: 2023-08-30 17:02:28
 * @LastEditors: yut
 * @LastEditTime: 2023-12-18 09:56:51
 * @Descripttion: 能耗核算
 */
import { postRequest } from '@/service/request';
import { ref } from 'vue';
import {
  ECA_IAccountingRow,
  ECA_IQueryVO,
  EPath,
  ECA_IConvertAccountingTypeVO,
  ECA_IBaseHeadQueryHostingPeriodsResponse,
  ECA_IAccountTypeRes,
  EAccountingType,
  ECA_IAccountingTypeVO,
  Eca_IEditParams,
  Eca_IAcountUpdateParams,
  ECA_TABLE_KEYS,
} from './energy-consumption-accounting.api';
import { getTenant } from '@/utils';
import message from '@/utils/message';
import { EFileDownloadType, useFileDownload } from '@/core/file';

class EnergyConsumptionAccountingService {
  private _dateList = ref<ECA_IBaseHeadQueryHostingPeriodsResponse[]>([]);
  public get dateList() {
    return this._dateList.value;
  }

  /**
   * 能耗核算数据
   */
  private _dataSource = ref<ECA_IConvertAccountingTypeVO<ECA_IAccountingRow[]>[]>([]);
  public get dataSource() {
    return this._dataSource.value;
  }

  /**
   * 托管期
   */
  private _date = ref(-1);
  public get date() {
    return this._date.value;
  }
  public set date(val) {
    this._date.value = val;
  }

  /**
   * 加载
   */
  private _loading = ref(true);
  public get loading() {
    return this._loading.value;
  }

  /**
   * 当前展开折叠面板
   */
  private _activeCollapse = ref<string[]>([]);
  public get activeCollapse() {
    return this._activeCollapse.value;
  }
  public set activeCollapse(val) {
    this._activeCollapse.value = val;
  }

  /**
   * 导出禁用状态
   */
  private _exportDisable = ref(false);
  public get exportDisable() {
    return this._exportDisable.value;
  }

  /**
   * 当前编辑的参数
   */
  private _editParams = ref<Eca_IEditParams>({
    moduleIndex: '',
    itemCode: '',
    areaId: -1,
    id: '',
  });
  public get editParams() {
    return this._editParams.value;
  }

  /**
   * 查询参数
   */
  private _queryParams = ref<ECA_IQueryVO>({
    hostingPeriodIndex: -1,
    startTime: '',
    endTime: '',
    months: '',
  });
  public get queryParams() {
    return this._queryParams.value;
  }
  public set queryParams(val) {
    this._queryParams.value = val;
  }

  /**
   * 查询托管周期
   */
  queryHostingPeriods = async () => {
    try {
      const res: HttpRequestModule.ResTemplate<ECA_IBaseHeadQueryHostingPeriodsResponse[]> = await postRequest(
        EPath.查询托管周期,
        getTenant(),
      );
      if (res.code === 200 && res.success && res.data) {
        this._dateList.value = res.data;
        this._dateList.value?.forEach((item) => {
          if (item.status) {
            this._date.value = item?.code;
            this._queryParams.value.startTime = this.mapTime(item.start.year, item.start.monthOfYear);
            this._queryParams.value.endTime = this.mapTime(item.end.year, item.end.monthOfYear);
            this._queryParams.value.months = item.months;
          }
        });
      } else {
        this._dateList.value = [];
        message.error(res.message || '获取托管周期失败');
      }
    } catch (error) {
      this._dateList.value = [];
      message.error('获取托管周期失败');
    }
  };

  /**
   * 根据托管期拼接时间
   * @param year
   * @param month
   * @returns
   */
  mapTime = (year: number, month: number) => {
    return `${year}-${month > 9 ? month : '0' + month}`;
  };

  /**
   * 是否编辑
   * @param row 行数据
   * @param moduleIndex 对应模块
   * @returns Boolean 是否能编辑
   */
  mapIsEditing = (row: ECA_IAccountingRow, moduleIndex: string) => {
    return (
      this._editParams.value.areaId === row.areaId &&
      this._editParams.value.itemCode === row.itemCode &&
      this._editParams.value.moduleIndex === moduleIndex &&
      this._editParams.value.id === row.id
    );
  };

  /**
   * 编辑操作
   * @param row 行数据
   * @param moduleIndex 对应模块
   */
  ecaEdit = (row: ECA_IAccountingRow, moduleIndex: string) => {
    this._editParams.value.areaId = row.areaId;
    this._editParams.value.itemCode = row.itemCode;
    this._editParams.value.id = row.id;
    this._editParams.value.moduleIndex = moduleIndex;
  };

  /**
   * 获取能耗核算数据
   */
  getEnergyConsumptionAccountingData = async () => {
    try {
      this._queryParams.value.hostingPeriodIndex = this._date.value;
      this._loading.value = true;
      this._dataSource.value = [];
      const res: HttpRequestModule.ResTemplate<ECA_IAccountTypeRes<ECA_IAccountingRow>> = await postRequest(
        EPath.获取能耗核算数据,
        this._queryParams.value,
      );
      if (res.code === 200 && res.success && res.data) {
        this.convert(res.data);
        this._loading.value = false;
      } else {
        this._loading.value = false;
      }
    } catch (error) {
      this._loading.value = false;
    }
  };

  /**
   * 更新备注信息
   * @param params
   */
  updateRemark = async (params: Eca_IAcountUpdateParams) => {
    try {
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.编辑能耗核算数据, params);
      if (res.code === 200 && res.success) {
        message.success('编辑成功');
      } else {
        message.error(res.message || '编辑失败');
        this.getEnergyConsumptionAccountingData();
      }
    } catch (error) {
      message.error('编辑失败');
    }
  };

  /**
   * 编辑备注
   * @param row 行数据
   * @param moduleIndex 对应模块
   */
  changeRemark = (row: ECA_IAccountingRow, moduleIndex: string) => {
    this.updateRemark({
      ...getTenant(),
      hostingPeriodIndex: this._date.value,
      moduleIndex,
      energyCode: row.energyCode,
      hostingAreaId: row.areaId,
      areaName: row.areaName,
      itemCode: row.itemCode,
      remark: row.remark,
    });
    this.blurEvt();
  };

  /**
   * 失焦
   */
  blurEvt = () => {
    this._editParams.value.areaId = -1;
    this._editParams.value.id = '';
    this._editParams.value.itemCode = '';
    this._editParams.value.moduleIndex = '';
  };

  /**
   * 导出
   */
  export = async () => {
    this._exportDisable.value = true;
    await useFileDownload(this._queryParams.value, EPath.能耗核算表页面导出, EFileDownloadType.导出);
    this._exportDisable.value = false;
  };

  /**
   * 处理折叠面板展开
   */
  private useRenderMap(typeName: string) {
    this._activeCollapse.value.push(typeName);
  }

  /**
   * 将接口数据转化为页面需要数据
   * @param value 接口返回数据
   * @returns
   */
  private convert = (value: ECA_IAccountTypeRes<ECA_IAccountingRow>) => {
    if (Object.keys(value).length === 0) {
      this._dataSource.value = [];
      return;
    }

    Object.keys(value).forEach((k) => {
      let newObj = {};
      if ((value as any)[k] !== null && ECA_TABLE_KEYS.includes(k)) {
        const { typeName, type } = this.useType(k);
        this.useRenderMap(typeName);
        const { titleList, moduleVOList, moduleIndex, moduleName } = (value as any)[k];
        let count = 0;
        switch (type) {
          case EAccountingType.能耗基准:
          case EAccountingType['改造前能耗(预算-可研)']:
          case EAccountingType['改造后能耗(实缴)']:
          case EAccountingType.单价调差:
            count = 2;
            break;
          case EAccountingType.项目总收益:
          case EAccountingType['项目总收益(调整后)']:
          case EAccountingType.已核定能源事件:
            count = 1;
            break;
          default:
            break;
        }
        const headList = titleList?.slice(count, titleList?.length - 2) ?? [];

        let dataArr = [];
        if (titleList?.length) {
          dataArr = moduleVOList?.map((item: ECA_IAccountingRow, index: number) => {
            return {
              ...item,
              id: Math.random().toString(36).substr(2),
              name: item.totalFlag
                ? '合计'
                : item.summaryFlag
                ? item.energyName + '-' + item.itemName
                : item.energyName,
              children:
                item.children?.map((it) => {
                  return {
                    ...it,
                    id: Math.random().toString(36).substr(2),
                    name: it.totalFlag ? '合计' : it.summaryFlag ? it.energyName + '-' + it.itemName : it.energyName,
                  };
                }) ?? null,
            };
          });
        }
        newObj = {
          typeName: moduleName,
          type,
          moduleIndex: moduleIndex,
          titleList: headList,
          moduleVOList: dataArr,
        };

        this._dataSource.value.push(newObj as ECA_IConvertAccountingTypeVO<ECA_IAccountingRow[]>);
      }
    });
    this._dataSource.value = this._dataSource.value.sort((a, b) => Number(a.moduleIndex) - Number(b.moduleIndex));
  };

  /**
   * 构造折叠面板所需数据
   * @param k key值
   * @returns
   */
  private useType(k: string): {
    type: EAccountingType;
    typeName: string;
  } {
    let type = EAccountingType.能耗基准;
    let typeName = '能耗基准';
    switch (k) {
      case 'energyConBenchmark':
        type = EAccountingType.能耗基准;
        typeName = '能耗基准';
        break;
      case 'energyConBeforeRetrofit':
        type = EAccountingType['改造前能耗(预算-可研)'];
        typeName = '改造前能耗(预算-可研)';
        break;
      case 'energyConAfterRetrofit':
        type = EAccountingType['改造后能耗(实缴)'];
        typeName = '改造后能耗(实缴)';
        break;
      case 'totalIncome':
        type = EAccountingType.项目总收益;
        typeName = '项目总收益';
        break;
      case 'priceAdjustment':
        type = EAccountingType.单价调差;
        typeName = '单价调差';
        break;
      case 'energyEvent':
        type = EAccountingType.已核定能源事件;
        typeName = '已核定能源事件';
        break;
      case 'totalIncomeAfter':
        type = EAccountingType['项目总收益(调整后)'];
        typeName = '项目总收益(调整后)';
        break;
      default:
        type = EAccountingType.能耗基准;
        typeName = '能耗基准';
        break;
    }
    return {
      type,
      typeName,
    };
  }

  constructor() {
    this.queryHostingPeriods().then(() => {
      this.getEnergyConsumptionAccountingData();
    });
  }
}

export default new EnergyConsumptionAccountingService();
