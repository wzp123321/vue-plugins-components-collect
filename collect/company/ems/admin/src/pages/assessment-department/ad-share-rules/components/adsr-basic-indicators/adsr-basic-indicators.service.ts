/*
 * @Description: 基础指标服务
 * @Author: zpwan
 * @Date: 2022-10-08 15:29:03
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-11-18 16:27:49
 */
import { ref } from 'vue';

import { ADSR_IBasicIndicatorVO, ADSR_IBI_QueryParams } from './adsr-basic-indicators.api';
import { Common_ICodeName } from '@/services/common/common-api';
import { postRequest } from '@/services/request';

import commonService from '@/services/common/common';

import { pageSizes } from '@/config';
import message from '@/utils/message';

enum EPath {
  查询基础指标 = '/admin/apportion/basicIndex/list',
  查询指标属性 = 'index_type',
  新增基础指标 = '/admin/apportion/basicIndex/add',
  修改基础指标 = '/admin/apportion/basicIndex/update',
  删除基础指标 = '/admin/apportion/basicIndex/del',
  查询基础指标详情 = '/admin/apportion/basicIndex/query',
}

export class AdsrBasicIndicatorService {
  //#region
  private _dataSource = ref<ADSR_IBasicIndicatorVO[]>([]);

  private _indexTypes = ref<Common_ICodeName[]>([]);

  private _queryParams = ref<ADSR_IBI_QueryParams>({
    pageNum: 1,
    pageSize: 10,
  });

  private _loading = ref<boolean>(false);

  private _total = ref<number>(0);

  private _basicIndicatorVO = ref<ADSR_IBasicIndicatorVO>({
    id: '',
    name: '',
    indexType: '',
  });

  private _visible = ref<boolean>(false);

  private _submitting = ref<boolean>(false);

  private _formLoading = ref<boolean>(false);

  public get dataSource(): ADSR_IBasicIndicatorVO[] {
    return this._dataSource.value;
  }

  public get indexTypes(): Common_ICodeName[] {
    return this._indexTypes.value;
  }

  public get queryParams(): ADSR_IBI_QueryParams {
    return this._queryParams.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get total(): number {
    return this._total.value;
  }

  public get basicIndicatorVO(): ADSR_IBasicIndicatorVO {
    return this._basicIndicatorVO.value;
  }

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get submitting(): boolean {
    return this._submitting.value;
  }

  public get formLoading(): boolean {
    return this._formLoading.value;
  }
  //#endregion

  constructor() {
    this._queryParams.value.pageNum = 1;
    this._queryParams.value.pageSize = pageSizes[0];
    this._dataSource.value = [];
    this._submitting.value = false;
    this._total.value = 0;
  }

  handlePageChange = (value: number) => {
    this._queryParams.value.pageNum = value;

    this.query();
  };

  handlePageSizeChange = (value: number) => {
    this._queryParams.value.pageNum = 1;
    this._queryParams.value.pageSize = value;

    this.query();
  };

  async query() {
    this._dataSource.value = [];
    const { pageNum, pageSize } = this._queryParams.value;
    this._loading.value = true;
    const params = {
      orders: [
        {
          asc: true,
          column: '',
        },
      ],
      pageNum,
      pageSize,
      searchCount: true,
    };

    try {
      const res = await postRequest(EPath.查询基础指标, params);
      if (res?.code === 200 && res?.data?.total) {
        this._dataSource.value = this.convert(res?.data?.list);
        this._total.value = res?.data?.total ?? 0;
      } else {
        this._dataSource.value = [];
        this._total.value = 0;
      }
    } catch (error) {
      this._dataSource.value = [];
      this._total.value = 0;
    } finally {
      this._loading.value = false;
    }
  }

  convert(data: ADSR_IBasicIndicatorVO[]) {
    return data
      ? data?.map((item) => {
          return {
            id: item?.id ?? '',
            name: item?.name ?? '',
            indexType: item?.indexType ?? '',
          };
        })
      : [];
  }

  handleAddShow() {
    this._visible.value = true;

    this._basicIndicatorVO.value.id = '';
    this._basicIndicatorVO.value.name = '';
    this._basicIndicatorVO.value.indexType = '';

    this.queryDictionary();
  }

  handleEditShow(item: ADSR_IBasicIndicatorVO) {
    this._basicIndicatorVO.value.id = item.id;
    this._basicIndicatorVO.value.name = item.name;
    this._basicIndicatorVO.value.indexType = item.indexType;

    this._visible.value = true;

    this.queryIndicatorDetail();
    this.queryDictionary();
  }

  async queryIndicatorDetail() {
    this._formLoading.value = true;
    try {
      const res = await postRequest(EPath.查询基础指标详情, this._basicIndicatorVO.value.id);
      if (res?.code === 200 && res?.data) {
        this._basicIndicatorVO.value.id = res?.data?.id;
        this._basicIndicatorVO.value.name = res?.data?.name;
        this._basicIndicatorVO.value.indexType = res?.data?.indexType;
      } else {
        this._basicIndicatorVO.value.id = '';
        this._basicIndicatorVO.value.name = '';
        this._basicIndicatorVO.value.indexType = '';
      }
    } catch (error) {
      this._basicIndicatorVO.value.id = '';
      this._basicIndicatorVO.value.name = '';
      this._basicIndicatorVO.value.indexType = '';
    } finally {
      this._formLoading.value = false;
    }
  }

  async queryDictionary() {
    this._indexTypes.value = [];
    this._formLoading.value = true;
    try {
      const res = await commonService.queryDictionByCode(EPath.查询指标属性);
      if (res?.code === 200 && res?.data) {
        this._indexTypes.value = res?.data ?? [];
      } else {
        this._indexTypes.value = [];
      }
    } catch (error) {
      this._indexTypes.value = [];
    } finally {
      this._formLoading.value = false;
    }
  }

  handleClose = () => {
    this._visible.value = false;
  };

  submit() {
    if (this._submitting.value) {
      return;
    }
    const { name, indexType } = this._basicIndicatorVO.value;
    if (!name) {
      message.error('请输入指标名称');
      return;
    }
    if (!indexType) {
      message.error('请选择指标属性');
      return;
    }
    if (this._basicIndicatorVO.value.id) {
      this.handleBaseIndicatorEdit();
    } else {
      this.handleBaseIndicatorCreate();
    }
  }

  async handleBaseIndicatorCreate() {
    this._submitting.value = true;
    try {
      const { name, indexType } = this._basicIndicatorVO.value;

      const res = await postRequest(EPath.新增基础指标, { name, indexType });
      if (res?.code === 200 && res?.data) {
        message.success('新增成功');
        this._visible.value = false;
        this.query();
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res?.message ?? '新增失败');
        }
      }
    } catch (error) {
      message.error('新增失败');
    } finally {
      this._submitting.value = false;
    }
  }

  async handleBaseIndicatorEdit() {
    this._submitting.value = true;
    try {
      const { name, indexType, id } = this._basicIndicatorVO.value;

      const res = await postRequest(EPath.修改基础指标, { name, indexType, id });
      if (res?.code === 200 && res?.data) {
        message.success('编辑成功');
        this._visible.value = false;
        this.query();
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res?.message ?? '编辑失败');
        }
      }
    } catch (error) {
      message.error('编辑失败');
    } finally {
      this._submitting.value = false;
    }
  }

  handleDeleteConfirm = async (id: string) => {
    try {
      const res = await postRequest(EPath.删除基础指标, id);
      if (res?.code === 200 && res?.data) {
        message.success('删除成功');
        this.query();
      } else {
        if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
          message.error(res?.message ?? '删除失败');
        }
      }
    } catch (error) {
      message.error('删除失败');
    }
  };
}
