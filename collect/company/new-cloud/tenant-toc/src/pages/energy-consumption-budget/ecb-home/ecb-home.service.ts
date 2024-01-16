import { postRequest } from '@/service/request';
import { ref } from 'vue';
import { cloneDeep } from 'lodash';

import {
  Ebt_IBudgetRes,
  Ebt_IConvertBudgetTypeVO,
  Ebt_IConvertRow,
  Ebt_IBudgetRow,
  Ebt_IEditStore,
  EBudgetType,
  Ebt_IQueryVO,
  Ebt_ISearchVO,
} from './ecb-home.api';
import message from '@/utils/message';
import { getTenant } from '@/utils';

enum EPath {
  查询表格数据 = '/energyConsumptionBudget/queryTable',
  编辑单元格数据 = '/energyConsumptionBudget/edit',
}
// 可视区域最多展示行
const MAX_VIEW_LINE = 17;

class EbtHomeService {
  // 数据源
  private _dataSource = ref<Ebt_IConvertBudgetTypeVO<Ebt_IConvertRow[]>[]>([]);
  // loading
  private _loading = ref<boolean>(true);
  // 是否处于提交状态
  private _isSubmitting = ref<boolean>(false);
  // 编辑参数
  private _editParams = ref<Ebt_IEditStore>({
    typeIndex: -1,
    moduleIndex: '',
    dataIndex: -1,
    energyCode: '',
    areaId: '',
    itemCode: '',
    originRow: null,
  });
  // 折叠面板展开
  private _activeCollapse = ref<string[]>([]);
  // 托管期
  private hostingPeriodIndex = -1;
  private queryParams = ref<Ebt_IQueryVO>({
    hostingPeriodIndex: -1,
    startTime: '',
    endTime: '',
    months: '',
  });
  // 是否渲染，如果渲染存入队列,避免重复渲染
  private _renderMap = ref<Set<string>>(new Set());
  private lineTotal = ref<number>(0);

  public get dataSource(): Ebt_IConvertBudgetTypeVO<Ebt_IConvertRow[]>[] {
    return this._dataSource.value;
  }
  public get loading(): boolean {
    return this._loading.value;
  }
  public get isSubmitting(): boolean {
    return this._isSubmitting.value;
  }
  public get editParams(): Ebt_IEditStore {
    return this._editParams.value;
  }
  public get activeCollapse(): string[] {
    return this._activeCollapse.value;
  }
  public set activeCollapse(value: string[]) {
    this._activeCollapse.value = value;
  }
  public get renderMap(): Set<string> {
    return this._renderMap.value;
  }

  constructor() {
    this._dataSource.value = [];
  }
  public handleCollapseChange = (value: string[]): void => {
    if (value?.length) {
      value?.forEach((item) => {
        this._renderMap.value.add(item);
      });
    }
  };
  async query(params: Ebt_ISearchVO, isResetFlag: boolean = true) {
    if (!params.dateCode) {
      this._loading.value = false;
      return;
    }
    if (isResetFlag) {
      this._renderMap.value.clear();
      this._activeCollapse.value = [];
      this.lineTotal.value = 0;
    }

    try {
      this._editParams.value.areaId = '';
      this._editParams.value.energyCode = '';
      this._editParams.value.itemCode = '';
      this._editParams.value.typeIndex = -1;
      this._editParams.value.dataIndex = -1;

      this._loading.value = true;
      this.hostingPeriodIndex = params.dateCode;
      this.queryParams.value = {
        hostingPeriodIndex: params.dateCode,
        startTime: params.startTime,
        endTime: params.endTime,
        months: params.months,
      };
      const res = await postRequest(EPath.查询表格数据, {
        ...getTenant(),
        ...this.queryParams.value,
      });
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
  private convert(value: Ebt_IBudgetRes<Ebt_IBudgetRow[]>) {
    if (Object.keys(value).length === 0) {
      this._dataSource.value = [];
      return;
    }

    Object.keys(value).forEach((k) => {
      let newObj = {};
      if ((value as any)[k] !== null) {
        const { type, typeName } = this.useType(k);
        const { titleList, moduleVOList, moduleIndex } = (value as any)[k];
        this.useRenderMap(typeName, moduleVOList?.length);

        const headerColSpan = titleList?.filter((item: string) => item === '能源类型')?.length;
        const hasOperateBtn = moduleVOList?.some((item: Ebt_IBudgetRow) => {
          return item?.editable;
        });
        const headList = titleList?.slice(titleList?.lastIndexOf('能源类型') + 1, titleList?.length - 1) ?? [];
        let dataArr = [];
        if (titleList?.length) {
          let i = 0;
          dataArr = moduleVOList?.map((item: Ebt_IBudgetRow, index: number) => {
            /**
             * 如果没有分区域
             */
            if (item.summaryFlag || (!item.summaryFlag && item.itemName === '总费用(元)')) {
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
              energyName: item.totalFlag ? '合计(元)' : item.energyName,
              areaName: item.summaryFlag
                ? headerColSpan === 3
                  ? `小计(${item.energyName})`
                  : '总费用(元)'
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
          hasOperateBtn,
          headerColSpan,
          type,
          typeName,
          moduleIndex,
          titleList: headList,
          moduleVOList: dataArr,
        };
        this._dataSource.value.push(newObj as Ebt_IConvertBudgetTypeVO<Ebt_IConvertRow[]>);
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
  /**
   * 处理渲染map以及展开map
   */
  private useRenderMap(typeName: string, line: number) {
    // 2023-12-05--放开部分展开的逻辑，把push和add拿出来了，
    this._activeCollapse.value.push(typeName);
    this._renderMap.value.add(typeName);
    if (this.lineTotal.value < MAX_VIEW_LINE) {
      this.lineTotal.value += line;
    }
  }
  public setEditStore(row: Ebt_IConvertRow, typeIndex: number, dataIndex: number, moduleIndex: string) {
    this._editParams.value.areaId = row.areaId;
    this._editParams.value.energyCode = row.energyCode;
    this._editParams.value.itemCode = row.itemCode;
    this._editParams.value.typeIndex = typeIndex;
    this._editParams.value.dataIndex = dataIndex;
    this._editParams.value.moduleIndex = moduleIndex;

    this._editParams.value.originRow = cloneDeep(row);
  }
  public cancelEdit = () => {
    const { typeIndex, dataIndex, originRow } = this._editParams.value;
    this._dataSource.value[typeIndex].moduleVOList[dataIndex] = {
      ...this._dataSource.value[typeIndex].moduleVOList[dataIndex],
      ...originRow,
    };

    this._editParams.value.areaId = '';
    this._editParams.value.energyCode = '';
    this._editParams.value.itemCode = '';
    this._editParams.value.typeIndex = -1;
    this._editParams.value.dataIndex = -1;
  };
  /**
   * 保存
   * @returns
   */
  public async handleEditSubmit() {
    try {
      const { areaId, energyCode, moduleIndex, itemCode, dataIndex, typeIndex } = this._editParams.value;
      const { titleList, moduleVOList } = this._dataSource.value[typeIndex];
      const valueList = titleList?.map((item) => {
        return moduleVOList[dataIndex][item] === '' || moduleVOList[dataIndex][item] === null
          ? null
          : Number(moduleVOList[dataIndex][item]);
      });
      if (this._isSubmitting.value) {
        return;
      }
      // 拿到当前滚轮滚动的距离
      const containerEle = document.querySelector('.energy-consumption-budget') as HTMLElement;
      const top = containerEle.scrollTop;
      console.log(top);

      this._isSubmitting.value = true;
      const res = await postRequest(EPath.编辑单元格数据, {
        itemCode,
        energyCode,
        moduleIndex,
        valueList,
        hostingAreaId: areaId,
        hostingPeriodIndex: this.hostingPeriodIndex,
      });
      if (res?.success) {
        message.success(res?.message ?? '操作成功');
        // 查询数据
        await this.query(
          {
            dateCode: this.hostingPeriodIndex,
            startTime: this.queryParams.value.startTime,
            endTime: this.queryParams.value.endTime,
            months: this.queryParams.value.months,
            ...getTenant(),
          },
          false,
        );
        // 滚动到指定位置
        setTimeout(() => {
          console.log(containerEle, top);
          if (containerEle) {
            containerEle.scrollTo({
              top,
            });
          }
        }, 500);
      } else {
        message.error(res?.message ?? '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.log('%c✨✨编辑单元格Error✨✨', 'font-size: 24px', error);
    } finally {
      this._isSubmitting.value = false;
    }
  }
}

export default EbtHomeService;
