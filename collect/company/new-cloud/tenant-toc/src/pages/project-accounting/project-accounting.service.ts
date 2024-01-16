/*
 * @Author: yut
 * @Date: 2023-09-11 15:55:51
 * @LastEditors: yut
 * @LastEditTime: 2023-11-24 14:48:20
 * @Descripttion:
 */
import { getTenant } from '@/utils';
import message from '@/utils/message';
import { ref } from 'vue';
import {
  EPAccountingTypeKey,
  EPath,
  PA_IBudgetRes,
  PA_IBasicData,
  PA_IEditParams,
  PA_ITableDataItem,
  PA_FULL_CYCLE,
  PA_TitleItem,
  PA_IEditRemarkParams,
  EDate_Type,
  PA_IEditRowDataParams,
} from './project-accounting.api';
import { postRequest } from '@/service/request';
import { cloneDeep } from 'lodash';
import { Observable, Subject } from 'rxjs';
import { EFileDownloadType, useFileDownload } from '@/core/file';

class ProjectAccountingService {
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

  /**
   * 编辑参数
   */
  private _editParams = ref<PA_IEditParams>({
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
   * 表格加载
   */
  private _loading = ref(false);
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
   * 数据源
   */
  private _dataSource = ref<{
    energyConsumptionIncomeCostData: PA_IBasicData[];
    baseData: PA_IBasicData;
    taxDifferenceIncomeData: PA_IBasicData[];
  }>({
    energyConsumptionIncomeCostData: [],
    baseData: {
      hasOperateBtn: false,
      typeName: '',
      type: '',
      moduleIndex: '',
      moduleVOList: [],
    },
    taxDifferenceIncomeData: [],
  });
  public get dataSource() {
    return this._dataSource.value;
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

  // 折叠面板展开
  private _activeCollapse = ref<string[]>([]);
  public get activeCollapse(): string[] {
    return this._activeCollapse.value;
  }
  public set activeCollapse(value: string[]) {
    this._activeCollapse.value = value;
  }

  /**
   * 公共表头
   */
  private _titleList = ref<PA_TitleItem[]>([]);
  public get titleList() {
    return this._titleList.value;
  }

  /**
   * 固定表头
   */
  private _fixedTitleList = ref<PA_TitleItem[]>([]);
  public get fixedTitleList() {
    return this._fixedTitleList.value;
  }

  /**
   * 导出
   */
  private _exportDisable = ref(false);
  public get exportDisable() {
    return this._exportDisable.value;
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
   * 获取能耗核算数据
   */
  getProjectAccountingData = async (flag = true) => {
    this._loading.value = true;
    this.initParams();
    this._dataSource.value = {
      energyConsumptionIncomeCostData: [],
      baseData: {
        hasOperateBtn: false,
        typeName: '',
        type: '',
        moduleIndex: '',
        moduleVOList: [],
      },
      taxDifferenceIncomeData: [],
    };
    this._is_error.value = false;
    if (flag) {
      this._activeCollapse.value = [];
    }
    try {
      const param = {
        ...getTenant(),
        allStageFlag: this._date.value === PA_FULL_CYCLE ? EDate_Type.运营期汇总 : EDate_Type.自然年,
        year: this._date.value,
      };
      const res: HttpRequestModule.ResTemplate<PA_IBudgetRes> = await postRequest(EPath.查询项目核算数据, param);
      if (res.code === 200 && res.success) {
        this._titleList.value = res.data.titleList?.slice(3, res.data.titleList?.length) ?? [];
        this._fixedTitleList.value = res.data.titleList?.slice(0, 3) ?? [];
        this.convert(res.data);
        this._loading.value = false;
        this._is_error.value = false;
      } else {
        this._is_error.value = true;
        this._loading.value = false;
      }
    } catch (error) {
      this._loading.value = false;
      this._is_error.value = true;
    }
  };

  /**
   * 编辑表格数据
   * @param row 行
   * @param moduleIndex 不同表格唯一标识
   * @param index 第几行
   * @param typeIndex 第几个表格
   */
  editTdData = (row: PA_ITableDataItem, moduleIndex: string, index: number, typeIndex?: number) => {
    this._editParams.value.costType = row.costType;
    this._editParams.value.moduleIndex = moduleIndex;
    this._editParams.value.dataIndex = index;
    this._editParams.value.typeIndex = typeIndex ?? -1;
    this._editParams.value.originRow = cloneDeep(row);
  };

  /**
   * 行是否编辑状态
   * @param row
   * @param moduleIndex
   * @param index
   * @returns
   */
  mapIsEditing = (row: PA_ITableDataItem, moduleIndex: string, index: number) => {
    return (
      row.editableFlag &&
      this._editParams.value.costType === row.costType &&
      this._editParams.value.moduleIndex === moduleIndex &&
      this._editParams.value.dataIndex === index
    );
  };

  /**
   * 备注是否编辑
   * @param row
   * @param moduleIndex
   * @param index
   * @returns
   */
  mapRemarkIsEditing = (row: PA_ITableDataItem, moduleIndex: string, index: number) => {
    return (
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
  cancelEdit = (row: PA_ITableDataItem) => {
    const { originRow } = this._editParams.value;
    row.values = originRow!.values;
    row.remark = originRow!.remark;
    this.initParams();
  };

  /**
   * 更新备注信息
   * @param params
   */
  updateRemark = async (params: PA_IEditRemarkParams) => {
    try {
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.编辑备注, params);
      if (res.code === 200 && res.success) {
        message.success('编辑成功');
      } else {
        message.error(res.message || '编辑失败');
        this.getProjectAccountingData();
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
  changeRemark = (row: PA_ITableDataItem) => {
    this.updateRemark({
      tenantId: { ...getTenant() }.tenantId,
      nodeId: row.nodeId,
      year: this._date.value,
      nodeType: row.nodeType,
      remark: row.remark === '' ? null : row.remark,
    });
    this.initParams();
  };

  /**
   * 失焦
   */
  blurEvt = () => {
    this.initParams();
  };

  /**
   * 保存
   */
  save = (row: PA_ITableDataItem, type: string) => {
    const rowValue: PA_ITableDataItem = cloneDeep(row);
    const { originRow } = this._editParams.value;
    const key = row.taxTypeShowFlag ? 'predictCost' : 'predictCostAfterTax';
    //修改后的值
    const dataList: { valueTime: string; value: number | null; originValue: number | null }[] = [];
    Object.keys(rowValue.values).forEach((k) => {
      Object.keys(originRow!.values).forEach((_k) => {
        if (k === _k && rowValue.values[k][key] !== originRow!.values[_k][key]) {
          dataList.push({
            valueTime: k,
            value:
              rowValue.values[k][key] === '' || rowValue.values[k][key] === null
                ? null
                : Number(rowValue.values[k][key]),
            originValue:
              originRow!.values[_k][key] === '' || originRow!.values[_k][key] === null
                ? null
                : Number(originRow!.values[_k][key]),
          });
        }
      });
    });

    // 保存数据
    this.saveRowData({
      dataList,
      ...getTenant(),
      year: this._date.value,
      remark: rowValue.remark,
      nodeType: rowValue.nodeType,
      nodeId: rowValue.nodeId!,
    });
    this.getProjectAccountingData(false).then(() => {
      this._scrollHeight$.next(this._height.value);
    });
  };

  /**
   * 保存行数据
   * @param params
   */
  saveRowData = async (params: PA_IEditRowDataParams) => {
    try {
      const res: HttpRequestModule.ResTemplate<boolean> = await postRequest(EPath.编辑行数据, params);
      if (res.code === 200 && res.success && res.data) {
        message.success('保存成功');
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      message.error('保存失败');
    }
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

  private useRenderMap(typeName: string) {
    this._activeCollapse.value.push(typeName);
  }

  /**
   * 处理接口返回数据为需要的格式
   * @param value
   * @returns
   */
  private convert(value: PA_IBudgetRes) {
    const keys = Object.entries(EPAccountingTypeKey).map(([k, v]) => v as string);
    if (Object.keys(value).length === 0) {
      this._dataSource.value.energyConsumptionIncomeCostData = [];
      this._dataSource.value.baseData = {
        hasOperateBtn: false,
        typeName: '',
        type: '',
        moduleIndex: '',
        moduleVOList: [],
      };
      this._dataSource.value.taxDifferenceIncomeData = [];
      return;
    }
    Object.keys(value).forEach((k) => {
      let newObj = {};
      if ((value as any)[k] !== null && keys.includes(k)) {
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
        switch (type) {
          case EPAccountingTypeKey.能耗数据:
          case EPAccountingTypeKey['项目成本(不含税)']:
          case EPAccountingTypeKey['项目收入(不含税)']:
            this._dataSource.value.energyConsumptionIncomeCostData.push(newObj as PA_IBasicData);
            break;
          case EPAccountingTypeKey.基础数据:
            this._dataSource.value.baseData = newObj as PA_IBasicData;
            break;
          case EPAccountingTypeKey.税差收益计算表:
          case EPAccountingTypeKey['项目本年收入(含能源费流水)']:
          case EPAccountingTypeKey['项目合计收入(含能源费流水)']:
          case EPAccountingTypeKey['项目本年收入(含能源费流水和建设期成本)']:
          case EPAccountingTypeKey['项目合计收入(含能源费流水和建设期成本)']:
            this._dataSource.value.taxDifferenceIncomeData.push(newObj as PA_IBasicData);
            break;
          default:
            break;
        }
      }
    });
    console.log('%c🚀 ~ project-accounting.service.ts ~ 419行', 'font-size: 18px', this._dataSource.value);
  }

  /**
   * 导出
   */
  export = async () => {
    this._exportDisable.value = true;
    await useFileDownload({ ...getTenant() }, EPath.导出, EFileDownloadType.导出);
    this._exportDisable.value = false;
  };

  /**
   * 判断表格是否存在操作列
   * @param data
   * @returns
   */
  private hasOperateBtn = (data: any[]) => {
    let flag = false;
    flag = data.some((item: PA_ITableDataItem) => {
      if (!item?.editableFlag && item.sonVOList?.length) {
        return this.hasOperateBtn(item.sonVOList);
      } else {
        return item?.editableFlag;
      }
    });
    return flag;
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
  private flatLabel = (data: PA_ITableDataItem[], label: string, newArr: { label: string; level: string }[]) => {
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
   * 是否展示
   * @param val
   * @returns
   */
  public mapIsShow = (val: number | string | null | undefined) => {
    return !!val || val === 0;
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
    let type = EPAccountingTypeKey.能耗数据;
    switch (k) {
      case EPAccountingTypeKey.能耗数据:
        typeName = '能耗数据';
        type = EPAccountingTypeKey.能耗数据;
        break;
      case EPAccountingTypeKey['项目收入(不含税)']:
        typeName = '一、项目收入(不含税)';
        type = EPAccountingTypeKey['项目收入(不含税)'];
        break;
      case EPAccountingTypeKey['项目成本(不含税)']:
        typeName = '二、项目成本(不含税)';
        type = EPAccountingTypeKey['项目成本(不含税)'];
        break;
      case EPAccountingTypeKey.基础数据:
        typeName = '基础数据';
        type = EPAccountingTypeKey.基础数据;
        break;
      case EPAccountingTypeKey.税差收益计算表:
        typeName = '税差收益计算表';
        type = EPAccountingTypeKey.税差收益计算表;
        break;
      case EPAccountingTypeKey['项目本年收入(含能源费流水)']:
        typeName = '项目本年收入(含能源费流水)';
        type = EPAccountingTypeKey['项目本年收入(含能源费流水)'];
        break;
      case EPAccountingTypeKey['项目合计收入(含能源费流水)']:
        typeName = '项目合计收入(含能源费流水)';
        type = EPAccountingTypeKey['项目合计收入(含能源费流水)'];
        break;
      case EPAccountingTypeKey['项目本年收入(含能源费流水和建设期成本)']:
        typeName = '项目本年收入(含能源费流水和建设期成本)';
        type = EPAccountingTypeKey['项目本年收入(含能源费流水和建设期成本)'];
        break;
      case EPAccountingTypeKey['项目合计收入(含能源费流水和建设期成本)']:
        typeName = '项目合计收入(含能源费流水和建设期成本)';
        type = EPAccountingTypeKey['项目合计收入(含能源费流水和建设期成本)'];
        break;
      default:
        typeName = '能耗数据';
        type = EPAccountingTypeKey.能耗数据;
        break;
    }
    return {
      typeName,
      type,
    };
  }

  constructor() {
    this.queryHostingPeriods().then(() => {
      this.getProjectAccountingData();
    });
  }
}

export default new ProjectAccountingService();
