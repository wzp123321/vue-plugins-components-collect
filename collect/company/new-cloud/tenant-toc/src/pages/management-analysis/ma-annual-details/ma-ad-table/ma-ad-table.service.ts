import { postRequest } from '@/service/request';
import { ref } from 'vue';
import {
  MaAd_IBudgetRes,
  MaAd_IConvertBudgetTypeVO,
  MaAd_IConvertRow,
  MaAd_IBudgetRow,
  EBudgetType,
} from './ma-ad-table.api';

enum EPath {
  查询表格数据 = '/allStageBudget/queryAllStageBudgetVO',
}
class MaAdTableService {
  private _dataSource = ref<MaAd_IConvertBudgetTypeVO<MaAd_IConvertRow[]>[]>([]);

  private _loading = ref<boolean>(true);

  private _activeCollapse = ref<string[]>([]);

  public get dataSource(): MaAd_IConvertBudgetTypeVO<MaAd_IConvertRow[]>[] {
    return this._dataSource.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get isEmpty(): boolean {
    return this._dataSource == undefined;
  }

  public get activeCollapse(): string[] {
    return this._activeCollapse.value;
  }

  public set activeCollapse(value: string[]) {
    this._activeCollapse.value = value;
  }
  //#endregion
  constructor() {
    this._dataSource.value = [];
  }

  async query() {
    try {
      this._loading.value = true;
      const res = await postRequest(EPath.查询表格数据);
      if (res?.data) {
        this._dataSource.value = [];

        this.convert(res?.data);
      } else {
        this._dataSource.value = [];
      }
    } catch (error) {
      console.log('%c✨✨加载表格数据✨✨', 'font-size: 24px', error);
      this._dataSource.value = [];
    } finally {
      this._loading.value = false;
    }
  }

  private convert(value: MaAd_IBudgetRes<MaAd_IBudgetRow[]>) {
    if (Object.keys(value).length === 0) {
      this._dataSource.value = [];
      return;
    }
    this._activeCollapse.value = [];
    Object.keys(value).forEach((k) => {
      let newObj = {};
      if ((value as any)[k] !== null) {
        const { type, typeName } = this.useType(k);
        const { titleList, moduleVOList, moduleIndex } = (value as any)[k];
        const headerColSpan = titleList?.filter((item: string) => item === '能源类型')?.length;
        const headList = titleList?.slice(titleList?.lastIndexOf('能源类型') + 1, titleList?.length - 1) ?? [];
        let dataArr = [];
        if (titleList?.length) {
          this._activeCollapse.value.push(typeName);
          let i = 0;
          dataArr = moduleVOList?.map((item: MaAd_IBudgetRow, index: number) => {
            if (item.summaryFlag) {
              i = index + 1;
            }
            let monthObj = {};
            item.dataList.forEach((childItem, childIndex) => {
              monthObj = {
                ...monthObj,
                [headList[childIndex]]: childItem,
              };
            });
            const isStripe = (index - i) % 2 === 1;
            return {
              ...item,
              energyName: item.totalFlag ? '合计(总费用)' : item.energyName,
              areaName: item.summaryFlag
                ? item.areaId
                  ? `小计(${item.energyName})`
                  : `小计(${item.energyName})`
                : item.areaName,
              itemName: item.summaryFlag ? '总费用(元)' : item.itemName,
              hasAreaFlag: headerColSpan === 3,
              isStripe,
              type,
              typeName,
              ...monthObj,
            };
          });
        }

        newObj = {
          headerColSpan,
          type,
          typeName,
          moduleIndex,
          titleList: headList,
          moduleVOList: dataArr,
        };
        this._dataSource.value.push(newObj as MaAd_IConvertBudgetTypeVO<MaAd_IConvertRow[]>);
        console.log(this._dataSource.value);
      }
    });
  }
  private useType(k: string): {
    type: EBudgetType;
    typeName: string;
  } {
    let type = EBudgetType.能耗基准;
    let typeName = '能耗基准';
    switch (k) {
      case 'energyConBenchmark':
        type = EBudgetType.能耗基准;
        typeName = '能耗基准';
        break;
      case 'energyConBeforeRetrofit':
        type = EBudgetType.改造前能耗;
        typeName = '改造前能耗';
        break;
      case 'energySaving':
        type = EBudgetType.节能量;
        typeName = '节能量';
        break;
      case 'energyConAfterRetrofit':
        type = EBudgetType.改造后能耗;
        typeName = '改造后能耗';
        break;
      case 'adjustmentTerm':
        type = EBudgetType.调差项;
        typeName = '调差项';
        break;
      default:
        type = EBudgetType.能耗基准;
        typeName = '能耗基准';
        break;
    }
    return {
      type,
      typeName,
    };
  }
}

export default MaAdTableService;
