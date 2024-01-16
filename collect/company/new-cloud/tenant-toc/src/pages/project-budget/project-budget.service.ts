/*
 * @Author: yut
 * @Date: 2023-08-31 19:07:39
 * @LastEditors: yut
 * @LastEditTime: 2023-11-16 10:54:22
 * @Descripttion:
 */
import { postRequest } from '@/service/request';
import { ref } from 'vue';
import {
  EDate_Type,
  EPath,
  PB_FULL_CYCLE,
  PB_IBasicData,
  PB_IEditParams,
  PB_ITableDataItem,
  PB_TitleItem,
  PBudgetType,
  Pb_IBudgetRes,
} from './project-budget.api';
import { getTenant } from '@/utils';
import message from '@/utils/message';
import { cloneDeep } from 'lodash';
import { Observable, Subject } from 'rxjs';

class ProjectBudgetService {
  //下拉列表
  private _dateList = ref<{ value: number; label: string }[]>([]);
  public get dateList() {
    return this._dateList.value;
  }

  //当前选择时间
  private _date = ref(new Date().getFullYear());
  public get date() {
    return this._date.value;
  }
  public set date(val) {
    this._date.value = val;
  }

  //当前编辑的参数
  private _editParams = ref<PB_IEditParams>({
    costType: '',
    moduleIndex: '',
    dataIndex: -1,
    typeIndex: -1,
    originRow: null,
  });
  public get editParams() {
    return this._editParams.value;
  }

  /**
   * 数据源
   */
  private _dataSource = ref<{
    collapseTableData: PB_IBasicData[];
    baseData: PB_IBasicData;
    taxDifferencesData: PB_IBasicData[];
  }>({
    collapseTableData: [],
    baseData: {
      hasOperateBtn: false,
      typeName: '',
      type: '',
      moduleIndex: '',
      moduleVOList: [],
    },
    taxDifferencesData: [],
  });
  public get dataSource() {
    return this._dataSource.value;
  }

  // 折叠面板展开
  private _activeCollapse = ref<string[]>([]);
  public get activeCollapse(): string[] {
    return this._activeCollapse.value;
  }
  public set activeCollapse(value: string[]) {
    this._activeCollapse.value = value;
  }

  //需要滚动Observable
  private _scrollHeight$ = new Subject<number>();
  public get scrollHeight$() {
    return this._scrollHeight$ as unknown as Observable<number>;
  }

  //需要滚动的高度
  private _height = ref(0);
  public get height() {
    return this._height.value;
  }
  public set height(val) {
    this._height.value = val;
  }

  /**
   * 公共表头
   */
  private _titleList = ref<PB_TitleItem[]>([]);
  public get titleList() {
    return this._titleList.value;
  }

  private _fixedTitleList = ref<PB_TitleItem[]>([]);
  public get fixedTitleList() {
    return this._fixedTitleList.value;
  }

  /**
   * 表格加载
   */
  private _loading = ref(true);
  public get loading() {
    return this._loading.value;
  }

  /**
   * 数据请求是否出错
   */
  private _is_error = ref(false);
  public get is_Error() {
    return this._is_error.value;
  }

  /**
   * 查询托管周期
   */
  queryHostingPeriods = async () => {
    try {
      this._dateList.value = [];
      const res: HttpRequestModule.ResTemplate<{ year: number; desc: string }[]> = await postRequest(
        EPath.下拉列表,
        getTenant().tenantId,
      );
      if (res.code === 200 && res.success && res.data) {
        res.data.map((it) => this.convertPeriods(it));
        const dateList = this._dateList.value.filter((item) => item.value !== 0);
        //如果列表年包含当前年，就展示当前年，如果列表年不包含当前年（相当于托管期结束了），就用列表最后一年作为默认年
        this._date.value =
          dateList.findIndex((item) => item.value === new Date().getFullYear()) > -1
            ? new Date().getFullYear()
            : dateList[dateList.length - 1]?.value;
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
   * 托管周期数据转化
   * @param data
   */
  convertPeriods = (data: { year: number; desc: string }) => {
    this._dateList.value.push({
      label: data.desc,
      value: data.year,
    });
  };

  /**
   * 编辑表格数据
   * @param row 行
   * @param moduleIndex 不同表格唯一标识
   * @param index 第几行
   * @param typeIndex 第几个表格
   */
  editTdData = (row: PB_ITableDataItem, moduleIndex: string, index: number, typeIndex?: number) => {
    this._editParams.value.costType = row.costType;
    this._editParams.value.moduleIndex = moduleIndex;
    this._editParams.value.dataIndex = index;
    this._editParams.value.typeIndex = typeIndex ?? -1;

    this._editParams.value.originRow = cloneDeep(row);
  };

  /**
   * 是否编辑状态
   * @param row
   * @param moduleIndex
   * @param index
   * @returns
   */
  mapIsEditing = (row: PB_ITableDataItem, moduleIndex: string, index: number) => {
    return (
      row.editableFlag &&
      this._editParams.value.costType === row.costType &&
      this._editParams.value.moduleIndex === moduleIndex &&
      this._editParams.value.dataIndex === index
    );
  };

  /**
   *是否能编辑
   * @param moduleIndex
   * @param dataIndex 行号
   * @returns
   */
  mapEditDisabled = (moduleIndex: string, dataIndex: number) => {
    return (
      this._editParams.value.moduleIndex !== '' &&
      (this._editParams.value.moduleIndex !== moduleIndex || this._editParams.value.dataIndex !== dataIndex)
    );
  };

  /**
   * 取消编辑
   */
  cancelEdit = (row: PB_ITableDataItem) => {
    const { originRow } = this._editParams.value;
    row.values = originRow!.values;
    this.initParams();
  };

  /**
   * 保存
   */
  save = async (row: PB_ITableDataItem, type: string) => {
    const rowValue: PB_ITableDataItem = cloneDeep(row);
    const { originRow } = this._editParams.value;
    const key = row.taxTypeShowFlag ? 'predictCost' : 'predictCostAfterTax';
    //原始值
    const originValueObj: any = {};
    Object.keys(originRow!.values).forEach((k) => {
      originValueObj[k] =
        originRow?.values[k][key] === '' || originRow?.values[k][key] === null
          ? null
          : Number(originRow?.values[k][key]);
    });
    //修改后的值
    const valueObj: any = {};
    Object.keys(rowValue.values).forEach((k) => {
      valueObj[k] =
        rowValue.values[k][key] === '' || rowValue.values[k][key] === null ? null : Number(rowValue.values[k][key]);
    });
    this.updateData(
      {
        originValues: originValueObj,
        values: valueObj,
        nodeId: rowValue.nodeId!,
      },
      type,
    );
    this.getProjectBudgetData(false).then(() => {
      this._scrollHeight$.next(this._height.value);
    });
  };

  updateData = async (
    params: { originValues: { [key: string]: number | null }; values: (number | null)[]; nodeId: number },
    type: string,
  ) => {
    try {
      const url = type === PBudgetType.项目成本 ? EPath.成本预算编辑 : EPath.能耗数据项目收入不含税数据编辑;
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(url, {
        ...getTenant(),
        ...params,
        allStageFlag: this._date.value === PB_FULL_CYCLE,
        year: this._date.value,
      });
      if (res.code === 200 && res.success) {
        message.success('保存成功');
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  /**
   * 获取字符串的dom长度
   * @param str
   * @returns
   */
  getTextWidth = (str: string) => {
    let width = 0; //　创建 span 标签对象 并对该标签 插入 文本属性 及 类名
    const html = document.createElement('span');
    html.innerText = str;
    html.className = 'getTextWidth'; //  获取 body 元素 并插入 前面创建的 span 标签
    document.querySelector('body')?.appendChild(html); // 获取当前 span 标签 的类名的 偏移宽度，这个宽度与页面所显示宽度一致
    width = (document.querySelector('.getTextWidth') as HTMLElement)?.offsetWidth;
    document.querySelector('.getTextWidth')?.remove();
    return width;
  };

  /**
   * 计算类目的最大最小宽度
   * @param item
   * @param label
   * @returns
   */
  flexColumnWidth = (row: any, label: string) => {
    // 1.获取该列的所有数据
    const arr = this.flatLabel(row, label, []);
    // 2.计算每列内容最大的宽度 + 表格的内间距（依据实际情况而定）
    return this.getMaxLength(arr) + 'px';
  };

  /**
   * 将树状数据平铺为数组
   * @param data 树状数组
   * @param label 需要平铺的属性
   * @param newArr 新的数组
   * @returns 新的数组
   */
  private flatLabel = (data: PB_ITableDataItem[], label: string, newArr: { label: string; level: string }[]) => {
    if (data.length) {
      data.forEach((item: { [x: string]: any }) => {
        newArr.push({
          label: item[label],
          level: item['level'],
        });
        if (item.sonVOList && item.sonVOList.length) {
          this.flatLabel(item.sonVOList, label, newArr);
        }
      });
    }
    return newArr;
  };

  /**
   * 获取一列中最大的宽度
   * @param arr
   * @returns
   */
  getMaxLength = (arr: { label: string; level: string }[]) => {
    return arr.reduce((acc, item) => {
      if (item) {
        const calcLen = this.getTextWidth(item.label) + Number(item.level) * 30;
        if (acc < calcLen) {
          acc = calcLen;
        }
      }
      return acc;
    }, 0);
  };

  /**
   * 初始编辑参数
   */
  private initParams = () => {
    this._editParams.value.costType = '';
    this._editParams.value.moduleIndex = '';
    this._editParams.value.typeIndex = -1;
    this._editParams.value.dataIndex = -1;
    this._editParams.value.originRow = null;
  };

  // private lineTotal = ref<number>(0);
  /**
   * 处理折叠面板展开
   */
  private useRenderMap(typeName: string) {
    this._activeCollapse.value.push(typeName);
    // if (this.lineTotal.value < MAX_VIEW_LINE) {
    //   this.lineTotal.value += line;
    // }
  }

  /**
   * 处理接口返回数据为需要的格式
   * @param value
   * @returns
   */
  private convert(value: Pb_IBudgetRes) {
    if (Object.keys(value).length === 0) {
      return;
    }
    Object.keys(value).forEach((k) => {
      let newObj = {};
      if ((value as any)[k] !== null && k !== 'titleList') {
        const { typeName, type } = this.useType(k);
        this.useRenderMap(typeName);
        const hasOperateBtn = this.hasOperateBtn((value as any)[k]);
        newObj = {
          hasOperateBtn,
          typeName,
          type,
          moduleIndex: type,
          moduleVOList: (value as any)[k],
        };
        if (type !== PBudgetType.基础数据 && type !== PBudgetType.税差收益计算表) {
          this._dataSource.value.collapseTableData.push(newObj as PB_IBasicData);
        }
        if (type === PBudgetType.基础数据) {
          this._dataSource.value.baseData = newObj as PB_IBasicData;
        }
        if (type === PBudgetType.税差收益计算表) {
          this._dataSource.value.taxDifferencesData.push(newObj as PB_IBasicData);
        }
      }
    });
  }

  /**
   * 判断表格是否存在操作列
   * @param data
   * @returns
   */
  private hasOperateBtn = (data: any[]) => {
    let flag = false;
    flag = data.some((item: PB_ITableDataItem) => {
      if (!item?.editableFlag && item.sonVOList?.length) {
        return this.hasOperateBtn(item.sonVOList);
      } else {
        return item?.editableFlag;
      }
    });
    return flag;
  };

  /**
   * 获取项目预算数据
   */
  public getProjectBudgetData = async (isResetFlag: boolean = true) => {
    try {
      this._dataSource.value = {
        collapseTableData: [],
        baseData: {
          hasOperateBtn: false,
          typeName: '',
          type: '',
          moduleIndex: '',
          moduleVOList: [],
        },
        taxDifferencesData: [],
      };
      this._is_error.value = false;
      this.initParams();
      if (isResetFlag) {
        this._activeCollapse.value = [];
      }
      const param = {
        ...getTenant(),
        allStageFlag: this._date.value === PB_FULL_CYCLE ? EDate_Type.全周期 : EDate_Type.自然年,
        year: this._date.value,
      };
      this._loading.value = true;
      const res: HttpRequestModule.ResTemplate<Pb_IBudgetRes> = await postRequest(EPath.成本预算查询, param);
      if (res.code === 200 && res.success) {
        this._titleList.value = res.data.titleList?.slice(3, res.data.titleList.length) ?? [];
        this._fixedTitleList.value = res.data.titleList?.slice(0, 3) ?? [];

        this.convert(res.data);
        this._is_error.value = false;
        this._loading.value = false;
      } else {
        this._is_error.value = true;
        this._loading.value = false;
      }
    } catch (error) {
      this._is_error.value = true;
      this._loading.value = false;
    }
  };

  /**
   * 构造折叠面板数据
   * @param k
   * @returns
   */
  private useType(k: string): {
    typeName: string;
    type: string;
  } {
    let typeName = '能耗数据';
    let type = PBudgetType.能耗数据;
    switch (k) {
      case 'energyTable':
        typeName = '能耗数据';
        type = PBudgetType.能耗数据;
        break;
      case 'incomeTable':
        typeName = '一、项目收入(不含税)';
        type = PBudgetType.项目收入;
        break;
      case 'costTable':
        typeName = '二、项目成本(不含税)';
        type = PBudgetType.项目成本;
        break;
      case 'totalTable':
        typeName = '基础数据';
        type = PBudgetType.基础数据;
        break;
      case 'taxIncomeTable':
        typeName = '税差收益计算表';
        type = PBudgetType.税差收益计算表;
        break;
      default:
        typeName = '能耗数据';
        type = PBudgetType.能耗数据;
        break;
    }
    return {
      typeName,
      type,
    };
  }

  /**
   * 是否展示
   * @param val
   * @returns
   */
  public mapIsShow = (val: number | string | null | undefined) => {
    return !!val || val === 0;
  };

  constructor() {
    this.queryHostingPeriods().then(() => {
      this.getProjectBudgetData();
    });
  }
}

export default new ProjectBudgetService();
