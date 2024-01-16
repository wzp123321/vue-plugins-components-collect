import { reactive, ref } from 'vue';
import message from '@/utils/message';
import { postRequest } from '@/services/request';
import { formatDate } from '@/utils';

export class TableService {
  //#region
  private _dataSource = ref<TableItem[]>([]);
  private _total = ref<number>(0);
  private _energyList = ref<EnergyTypeItem[]>([]);
  private _queryParams = reactive<TableParams>({
    orders: [
      {
        asc: true,
        column: '',
      },
    ],
    pageNum: 1,
    pageSize: 10,
    searchCount: true,
    keyword: '',
    energyCode: '',
    breakStartTime: '',
    breakEndTime: '',
  });

  formSearch = reactive({
    nodeName: '', // 节点名称
    energyType: '', // 能源类型
    breakDate: [`${formatDate(new Date(), 'yyyy-MM-dd')} 00:00:00`, formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')], // 日期
  });

  private _loading = ref<boolean>(true);

  public get dataSource(): TableItem[] {
    return this._dataSource.value;
  }

  public get queryParams(): TableParams {
    return this._queryParams;
  }

  public get total(): number {
    return this._total.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get energyList(): EnergyTypeItem[] {
    return this._energyList.value;
  }

  //#endregion

  constructor() {
    this.getEnergyList();
    this.query();
  }

  async query() {
    if (!this.formSearch.breakDate) {
      message.error('请先选择时间');
      return;
    }
    this._loading.value = true;
    this._queryParams.keyword = this.formSearch.nodeName;
    this._queryParams.energyCode = this.formSearch.energyType;
    this._queryParams.breakStartTime = this.formSearch.breakDate?.[0] ?? '';
    this._queryParams.breakEndTime = this.formSearch.breakDate?.[1] ?? '';
    try {
      const res = await getTableList(this._queryParams);
      if (res?.code === 200) {
        this._dataSource.value = res.data?.list.map((item) => {
          return {
            content: item.content ?? '',
            energyCode: item.energyCode ?? '',
            energyCodeName: item.energyCodeName ?? '',
            energyDataTime: item.energyDataTime ?? '',
            id: item.id.toString() ?? '',
            resumeTime: item.resumeTime ?? '',
            treeId: item.treeId ?? 0,
            treeName: item.treeName ?? '',
          };
        });
        this._total.value = res.data?.total;
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    } finally {
      this._loading.value = false;
    }
  }

  async getEnergyList() {
    try {
      const res = await getEnergyType();
      if (res?.code === 200) {
        this._energyList.value = res.data;
        this._energyList.value.unshift({ code: '', name: '全部' });
        this.formSearch.energyType = '';
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res.message);
        }
      }
    } catch (error) {
      console.warn(error);
    }
  }

  handlePageChange = (value: number) => {
    this._queryParams.pageNum = value;
    this.query();
  };

  handlePageSizeChange = (value: number) => {
    this._queryParams.pageNum = 1;
    this._queryParams.pageSize = value;
    this.query();
  };
}

/**
 * 获取列表数据
 * @param params 查询列表参数
 * @returns 列表数据
 */
async function getTableList(
  params: TableParams,
): Promise<HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<TableItem[]>>> {
  const res = await postRequest('/admin/queryResumeLog/page', params);
  return res;
}

/**
 * 获取能源类型
 * @returns 能源类型列表
 */
export async function getEnergyType(): Promise<HttpRequestModule.ResTemplate<EnergyTypeItem[]>> {
  const res = await postRequest('/admin/energy/code/tree');
  return res;
}

export interface TableItem {
  content: string;
  energyCode: string;
  energyCodeName: string;
  energyDataTime: string;
  id: string;
  resumeTime: string;
  treeId: number;
  treeName: string;
}

export interface TableParams {
  orders: {
    asc: boolean;
    column: string;
  }[];
  pageNum: number;
  pageSize: number;
  searchCount: boolean;
  keyword: string;
  energyCode: string;
  breakStartTime: string;
  breakEndTime: string;
}

export interface EnergyTypeItem {
  code: string;
  name: string;
}
