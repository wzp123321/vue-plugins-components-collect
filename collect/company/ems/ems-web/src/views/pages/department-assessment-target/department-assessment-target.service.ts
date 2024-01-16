/*
 * @Author: yut
 * @Date: 2023-07-11 11:23:37
 * @LastEditors: yut
 * @LastEditTime: 2023-08-28 19:01:51
 * @Descripttion:
 */
import { ref } from 'vue';
import {
  EPath,
  IEnergyTypeItem,
  ITableDataItem,
  ITableHeaderData,
  ITargetInfoData,
} from './department-assessment-target.api';
import { postRequest } from '@/services/request';
import dayjs from 'dayjs';
import message from '@/utils/message';
import { pageSizes } from '@/config/config';

class DepartmentAssessmentTargetService {
  /**
   * 模糊搜索关键字
   */
  private _keyword = ref('');
  public get keyword() {
    return this._keyword.value;
  }
  public set keyword(val) {
    this._keyword.value = val;
  }

  public get pageSizes() {
    return pageSizes;
  }

  /**
   * 能源类型
   */
  private _energyType = ref('');
  public get energyType() {
    return this._energyType.value;
  }
  public set energyType(val) {
    this._energyType.value = val;
  }

  /**
   * 页码
   */
  private _pageNum = ref(1);
  public get pageNum() {
    return this._pageNum.value;
  }
  public set pageNum(val) {
    this._pageNum.value = val;
  }

  /**
   * 数据条数
   */
  private _pageSize = ref(this.pageSizes[0]);
  public get pageSize() {
    return this._pageSize.value;
  }
  public set pageSize(val) {
    this._pageSize.value = val;
  }

  private _total = ref(10);
  public get total() {
    return this._total.value;
  }

  /**
   * 能源类型名称
   */
  public get energyCodeName() {
    return this._energyTypeList.value.filter((item) => item.code === this._energyType.value)[0]?.name ?? '';
  }

  /**
   * 能源类型列表
   */
  private _energyTypeList = ref<IEnergyTypeItem[]>([]);
  public get energyTypeList() {
    return this._energyTypeList.value;
  }
  public set energyTypeList(val) {
    this._energyTypeList.value = val;
  }

  /**
   * 日期
   */
  private _date = ref('');
  public get date() {
    return this._date.value;
  }
  public set date(val) {
    this._date.value = val;
  }

  /**
   * 表格加载
   */
  private _loading = ref(true);
  public get loading() {
    return this._loading.value;
  }

  /**
   * 表格数据
   */
  private _tableDataList = ref<ITableDataItem[]>([]);
  public get tableData() {
    return this._tableDataList.value;
  }

  /**
   * 表头列表
   */
  private _tableTitleList = ref<ITableHeaderData[]>([]);
  public get tableTitleList() {
    return this._tableTitleList.value;
  }

  /**
   * 固定列
   */
  private _fixedTitleList = ref<{ indexId: number | null; indexName: string }[]>([]);
  public get fixedTitleList() {
    return this._fixedTitleList.value;
  }

  /**
   * 获取能源类型
   */
  public getSelectedEnergyCode = async () => {
    try {
      const res: HttpRequestModule.ResTemplate<IEnergyTypeItem[]> = await postRequest(
        EPath.科室考核查询已勾选的分类分项,
      );
      if (res.code === 200 && res.data && res.success) {
        this._energyTypeList.value = res.data;
        this._energyType.value = res.data[0].code;
      } else {
        this._energyTypeList.value = [];
      }
    } catch (error) {
      this._energyTypeList.value = [];
    }
  };

  /**
   * 获取表格数据
   */
  public getTableData = async () => {
    try {
      const params = {
        energyCode: this._energyType.value,
        queryTime: this._date.value,
        keyword: this._keyword.value,
        orders: [
          {
            asc: true,
            column: '',
          },
        ],
        pageNum: this._pageNum.value,
        pageSize: this._pageSize.value,
        searchCount: true,
      };
      this._loading.value = true;
      const res: HttpRequestModule.ResTemplate<ITargetInfoData> = await postRequest(
        EPath.科室考核目标值维护页面查询接口,
        params,
      );
      this._fixedTitleList.value = [];
      this._tableTitleList.value = [];
      if (res.code === 200 && res.success && res.data) {
        // 构造指标数据
        this._tableDataList.value = res.data.bodyList.list.map((it) => {
          const arr: any[] = [];
          it.dataList.forEach((item) => {
            arr.push({
              editFlag: false,
              value: item,
            });
          });
          it.dataList = arr;
          return it;
        });

        //构造表头数据
        res.data.headList.forEach((item) => {
          if (!item.indexId && item.indexId !== 0) {
            this._fixedTitleList.value.push(item);
          } else {
            this._tableTitleList.value.push(item);
          }
        });
        this._total.value = res.data.bodyList.total;
        this._loading.value = false;
      } else {
        this._total.value = 0;
        message.error(res.message || '获取数据失败');
        this._tableDataList.value = [];
        this._tableTitleList.value = [];
        this._loading.value = false;
      }
    } catch (error) {
      this._tableDataList.value = [];
      this._tableTitleList.value = [];
      this._loading.value = false;
      message.error('获取数据失败');
    }
  };

  /**
   * 编辑数据
   * @param params 编辑入参
   */
  public updateTargetData = async (params: { treeId: number; indexId: number; value: number | null }) => {
    try {
      const res: HttpRequestModule.ResTemplate<boolean> = await postRequest(EPath.科室考核目标值维护页面编辑接口, {
        ...params,
        energyCode: this._energyType.value,
        queryTime: this._date.value,
      });
      if (res.code === 200 && res.data && res.success) {
        message.success('编辑成功');
      } else {
        message.error(res.message || '编辑失败');
        this.getTableData();
      }
    } catch (error) {
      message.error('编辑失败');
    }
  };

  /**
   * 查询
   */
  public onSubmit = () => {
    this._pageNum.value = 1;
    this._pageSize.value = this.pageSizes[0];
    this.getTableData();
  };

  /**
   * 重置
   */
  public onReset = () => {
    this._date.value = dayjs(new Date()).format('YYYY-MM');
    this._keyword.value = '';
    this._energyType.value = this._energyTypeList.value[0]?.code ?? '';
    this._pageNum.value = 1;
    this._pageSize.value = this.pageSizes[0];
    this.getTableData();
  };

  // 页码切换
  onPageChange = (value: number) => {
    this._pageNum.value = value;
    this.getTableData();
  };
  // pageSize切换
  onPageSizeChange = (value: number) => {
    this._pageNum.value = 1;
    this._pageSize.value = value;
    this.getTableData();
  };

  /**
   * 初始化数据
   */
  public initData = () => {
    this._date.value = dayjs(new Date()).format('YYYY-MM');
    this._tableDataList.value = [];
    this._tableTitleList.value = [];
    this._energyType.value = '';
    this._fixedTitleList.value = [];
    this._loading.value = true;
    this._energyTypeList.value = [];
    this._keyword.value = '';
    this._pageNum.value = 1;
    this._pageSize.value = this.pageSizes[0];
  };
}

export const datService = new DepartmentAssessmentTargetService();
