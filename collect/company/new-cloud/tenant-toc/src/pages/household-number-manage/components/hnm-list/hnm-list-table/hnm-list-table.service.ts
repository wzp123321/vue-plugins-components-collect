/*
 * @Author: yut
 * @Date: 2023-08-14 17:23:38
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 15:02:28
 * @Descripttion:
 */
import { reactive, ref } from 'vue';
import { EPath, EnergyCodeVO, ISearchForm, householdNumberListVO } from './hnm-list-table.api';
import { postRequest } from '@/service/request';
import { getTenant } from '@/utils';
import { pageSizesArray } from '@/config';
import message from '@/utils/message';
import hlUpdate from '../hnm-list-update/hnm-list-update.service';
import { cloneDeep } from 'lodash';

class HnmListTableService {
  /**
   * 表格加载
   */
  private _loading = ref<boolean>(true);
  public get loading() {
    return this._loading.value;
  }
  public set loading(val) {
    this._loading.value = val;
  }

  /**
   * 分页器页码列表
   */
  public get pageSizeList() {
    return pageSizesArray;
  }

  /**
   * 是否出错
   */
  private _is_error = ref<boolean>(false);
  public get error() {
    return this._is_error.value;
  }

  /**
   * 查询参数
   */
  private _pageForm = ref<ISearchForm>({
    accountNumber: '',
    energyCode: '',
    pageSize: 0,
    pageNum: 1,
    orders: [
      {
        column: '',
        asc: true,
      },
    ],
    searchCount: true,
  });
  public get pageForm() {
    return this._pageForm.value;
  }

  /**
   * 数据总条数
   */
  private _total = ref<number>(0);
  public get total() {
    return this._total.value;
  }

  /**
   * 能源类型
   */
  private _searchEnergyCode = ref<EnergyCodeVO>({ code: '', name: '', unit: '' });

  /**
   * 能源类型列表
   */
  private _energyCodeList = ref<EnergyCodeVO[]>([]);
  public get energyCodeList() {
    return this._energyCodeList.value;
  }

  /**
   * 表格数据
   */
  private _dataSource = ref<householdNumberListVO[]>([]);
  public get dataSource() {
    return this._dataSource.value;
  }

  /**
   * 查询表格数据
   */
  queryTableData = async () => {
    await hlUpdate.queryHostingAreaList();
    hlUpdate.areaList = cloneDeep(hlUpdate.hostingAreaList);
    try {
      this._loading.value = true;
      const obj = {
        accountNumber: this._pageForm.value.accountNumber,
        energyCode: this._pageForm.value.energyCode,
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: this._pageForm.value.pageNum,
        pageSize: this._pageForm.value.pageSize,
        searchCount: true,
        ...getTenant(),
      };
      const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<householdNumberListVO[]>> =
        await postRequest(EPath.获取表格数据, obj);
      if (res.code === 200 && res.success && res.data) {
        this._dataSource.value = res.data.list;
        this._total.value = res.data.total;
        this._loading.value = false;
      } else {
        this._dataSource.value = [];
        this._total.value = 0;
        this._loading.value = false;
      }
    } catch (error) {
      this._dataSource.value = [];
      this._total.value = 0;
      this._loading.value = false;
    }
  };

  /**
   * 删除户号
   * @param id
   */
  deleteHouseholdNumber = async (id: number) => {
    try {
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.删除, id);
      if (res.code === 200 && res.success) {
        message.success('删除成功');
        this.queryTableData();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  /**
   * 查询
   */
  search = () => {
    this._energyCodeList.value.forEach((item) => {
      if (item.code === this._pageForm.value.energyCode) {
        this._searchEnergyCode.value = item;
      }
    });
    this.pageForm.pageNum = 1;
    this.pageForm.pageSize = pageSizesArray[0];
    this.queryTableData();
  };

  /**
   * 初始化参数
   */
  init = async () => {
    this.pageForm.pageSize = pageSizesArray[0];
    this.pageForm.pageNum = 1;

    await this.queryEnergyCodeList();
    this._pageForm.value.energyCode = '';
    this._searchEnergyCode.value = { code: '', name: '', unit: '' };
  };

  /**
   * 查询能源类型
   */
  queryEnergyCodeList = async () => {
    try {
      const res: HttpRequestModule.ResTemplate<NHouseholdNumber.EnergyCodeVO[]> = await postRequest(
        EPath.查询分类分项,
        getTenant(),
      );
      if (res && res.code === 200 && res.data) {
        this._energyCodeList.value = res.data ?? [];
      } else {
        this._energyCodeList.value = [];
      }
    } catch (error) {
      this._is_error.value = true;
      this._energyCodeList.value = [];
    }
  };

  /**
   * 页码切换
   * @param value 页码
   */
  onPageChange = (value: number) => {
    this.pageForm.pageNum = value;
    this.queryTableData();
  };

  /**
   * 页面大小切换
   * @param value pagesize
   */
  onPageSizeChange = (value: number) => {
    this.pageForm.pageNum = 1;
    this.pageForm.pageSize = value;
    this.queryTableData();
  };
}

export default new HnmListTableService();
