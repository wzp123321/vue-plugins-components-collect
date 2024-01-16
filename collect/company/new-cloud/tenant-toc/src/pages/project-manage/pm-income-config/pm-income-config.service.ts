import message from '@/utils/message';
import { ref } from 'vue';
import {
  EPath,
  IPIC_IBaseHeadQueryHostingPeriodsResponse,
  IPIC_SaveParams,
  IPIC_TableData,
  IPIC_TableRow,
} from './pm-income-config.api';
import { postRequest } from '@/service/request';
import { ECommonPath } from '@/service/path';
import { getTenant } from '@/utils';

class PmIncomeConfigService {
  private _editData = ref<{
    dateTimeList: {
      startTime: string;
      endTime: string;
    }[];
    data: number | null | string;
  }>({
    dateTimeList: [],
    data: null,
  });

  public get editData() {
    return this._editData.value;
  }
  public set editData(val) {
    this._editData.value = val;
  }
  /**
   * 表头
   */
  private _headerList = ref<string[]>([]);
  public get headerList() {
    return this._headerList.value;
  }

  /**
   * 表体
   */
  private _bodyList = ref<IPIC_TableRow[]>([]);
  public get bodyList() {
    return this._bodyList.value;
  }

  private _editParams = ref<{
    periodName: string;
    dataIndex: number;
    typeIndex: number;
    origin: string | number | null;
  }>({
    periodName: '',
    dataIndex: -1,
    typeIndex: -1,
    origin: null,
  });
  public get editParams() {
    return this._editParams.value;
  }
  private _loading = ref(true);
  public get loading() {
    return this._loading.value;
  }

  // 托管期列表
  private _hostPeriodList = ref<IPIC_IBaseHeadQueryHostingPeriodsResponse[]>([]);
  public get hostPeriodList() {
    return this._hostPeriodList.value;
  }
  /**
   * 查询托管期列表
   */
  queryScopeList = async () => {
    try {
      const res = await postRequest(ECommonPath.查询托管期信息, getTenant());
      if (res && res?.data?.length) {
        this._hostPeriodList.value = res?.data ?? [];
      } else {
        this._hostPeriodList.value = [];
      }
    } catch (error) {
      this._hostPeriodList.value = [];
    }
  };

  /**
   * 获取运维服务费和设备维保服务费表格数据
   * @param params
   */
  queryCostTypeTableData = async (params: { costType: string; tenantId: number }) => {
    try {
      this._loading.value = true;
      const res: HttpRequestModule.ResTemplate<IPIC_TableData> = await postRequest(EPath.查询运维或维保服务费, params);
      if (res.code === 200 && res.success && res.data) {
        this._bodyList.value = res.data.bodyList;
        this._headerList.value = res.data.headList;
        this._loading.value = false;
      } else {
        this._bodyList.value = [];
        this._headerList.value = [];
        this._loading.value = false;
      }
    } catch (error) {
      this._bodyList.value = [];
      this._headerList.value = [];
      this._loading.value = false;
    } finally {
      this.initParams();
    }
  };

  /**
   * 获取定值指标表格数据
   * @param params
   */
  querySerialTable = async (params: { serialNumber: string; tenantId: number }) => {
    try {
      this._loading.value = true;
      const res: HttpRequestModule.ResTemplate<IPIC_TableData> = await postRequest(EPath.查询定值指标详情数据, params);
      if (res.code === 200 && res.success && res.data) {
        this._bodyList.value = res.data.bodyList;
        this._headerList.value = res.data.headList;
        this._loading.value = false;
      } else {
        this._bodyList.value = [];
        this._headerList.value = [];
        this._loading.value = false;
      }
    } catch (error) {
      this._bodyList.value = [];
      this._headerList.value = [];
      this._loading.value = false;
    } finally {
      this.initParams();
    }
  };
  /**
   * 获取收益表格数据
   * @param params
   */
  queryIncomeTable = async (params: { incomeShareType: string; tenantId: number }) => {
    try {
      this._loading.value = true;
      const res: HttpRequestModule.ResTemplate<IPIC_TableData> = await postRequest(EPath.查询固定收益, params);
      if (res.code === 200 && res.success && res.data) {
        this._bodyList.value = res.data.bodyList;
        this._headerList.value = res.data.headList;
        this._loading.value = false;
      } else {
        this._bodyList.value = [];
        this._headerList.value = [];
        this._loading.value = false;
      }
    } catch (error) {
      this._bodyList.value = [];
      this._headerList.value = [];
      this._loading.value = false;
    } finally {
      this.initParams();
    }
  };

  /**
   * 保存数据
   * @param params
   */
  saveConstantInfo = async (params: IPIC_SaveParams) => {
    try {
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.定值指标保存接口, params);
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
   * 保存数据
   * @param params
   */
  saveCostItem = async (params: IPIC_SaveParams) => {
    try {
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.保存运维或维保服务费, params);
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
   * 保存数据
   * @param params
   */
  saveRetainingIncome = async (params: IPIC_SaveParams) => {
    try {
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.保存固定收益, params);
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
   * 是否处于编辑
   * @param row
   * @param dataIndex
   * @param typeIndex
   * @returns
   */
  mapIsEditing = (row: any, dataIndex: number, typeIndex: any) => {
    return (
      this._editParams.value.periodName === row.periodName &&
      this._editParams.value.dataIndex === dataIndex &&
      this._editParams.value.typeIndex === typeIndex
    );
  };

  /**
   * 编辑
   * @param row
   * @param dataIndex
   * @param typeIndex
   */
  picEdit = (row: IPIC_TableRow, dataIndex: number, typeIndex: number) => {
    this._editParams.value.periodName = row.periodName;
    this._editParams.value.dataIndex = dataIndex;
    this._editParams.value.typeIndex = typeIndex;
    this._editParams.value.origin = row.values[typeIndex];
  };

  /**
   * 初始参数
   */
  initParams = () => {
    this._editParams.value.periodName = '';
    this._editParams.value.dataIndex = -1;
    this._editParams.value.typeIndex = -1;
    this._editParams.value.origin = '';
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
  flexColumnWidth = (data: IPIC_TableRow[], label: string) => {
    // 1.获取该列的所有数据
    const arr = this.toLabelArray(data, label);
    // 2.计算每列内容最大的宽度 + 表格的内间距（依据实际情况而定）
    return this.getMaxLength(arr) + 32 + 'px';
  };

  /**
   * 构造字符串数组
   * @param data
   * @param label
   * @returns
   */
  toLabelArray = (data: IPIC_TableRow[], label: string) => {
    const newArr: string[] = [];
    if (data.length) {
      data.forEach((item: { [x: string]: any }) => {
        newArr.push(item[label]);
      });
    }
    return newArr;
  };

  /**
   * 获取一列中最大的宽度
   * @param arr
   * @returns
   */
  getMaxLength = (arr: string[]) => {
    return arr.reduce((acc, item) => {
      if (item) {
        const calcLen = this.getTextWidth(item);
        if (acc < calcLen) {
          acc = calcLen;
        }
      }
      return acc;
    }, 0);
  };

  constructor() {}
}

export default new PmIncomeConfigService();
