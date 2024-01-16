/*
 * @Description: 关联范围服务
 * @Author: zpwan
 * @Date: 2022-10-08 15:29:03
 * @Last Modified by: zpwan
 * @Last Modified time: 2023-05-08 14:04:09
 */
import { ref } from 'vue';

import {
  ADSR_IAssociateScopeVO,
  ADSR_ITreeVO,
  ADSR_IAssociateScopeDetail,
  ADSR_FIXED_TYPE,
} from './adsr-associated-scope.api';
import { ADSR_IBI_QueryParams } from '../adsr-basic-indicators/adsr-basic-indicators.api';
import { postRequest } from '@/services/request';
import commonService from '@/services/common/common';
import { Common_ICodeName } from '@/services/common/common-api';
import { TM_TREE_TYPE, TM_ITreeManageVO } from '@/pages/tree-manage/tree-manage.api';

import { pageSizes } from '@/config';
import message from '@/utils/message';
import { getTreeExpandKeys } from '@/utils';

enum EPath {
  查询关联范围 = '/admin/apportion/scope/list',
  新增关联范围 = '/admin/apportion/scope/add',
  修改关联范围 = '/admin/apportion/scope/update',
  删除关联范围 = '/admin/apportion/scope/del',
  查询关联范围详情 = '/admin/apportion/scope/query',
  查询指标属性 = 'index_type',
  查询区域树 = '/admin/tree/selectable/list',
}
const MAX_LENGTH = 20;

export class AssociateScopeService {
  //#region
  private _dataSource = ref<ADSR_IAssociateScopeVO[]>([]);

  private _queryParams = ref<ADSR_IBI_QueryParams>({
    pageNum: 1,
    pageSize: 10,
  });

  private _loading = ref<boolean>(false);

  private _total = ref<number>(0);

  private _associateScopeVO = ref<ADSR_IAssociateScopeDetail>({
    id: '',
    fixed: '',
    name: '',
    scopeTypeText: '',
    scopeType: '',
    serialNumber: '',
    treeIds: [],
    used: '0',
    treeNames: [],
  });

  private _visible = ref<boolean>(false);

  private _detailVisible = ref<boolean>(false);

  private _submitting = ref<boolean>(false);

  private _formLoading = ref<boolean>(false);

  private _indexTypes = ref<Common_ICodeName[]>([]);

  private _treeList = ref<TM_ITreeManageVO[]>([]);

  private _expandedKeys = ref<number[]>([]);

  private _treeLoading = ref<boolean>(false);

  public get dataSource(): ADSR_IAssociateScopeVO[] {
    return this._dataSource.value;
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

  public get associateScopeVO(): ADSR_IAssociateScopeDetail {
    return this._associateScopeVO.value;
  }

  public get visible(): boolean {
    return this._visible.value;
  }

  public set visible(value: boolean) {
    this._visible.value = value;
  }

  public get detailVisible(): boolean {
    return this._detailVisible.value;
  }

  public set detailVisible(value: boolean) {
    this._detailVisible.value = value;
  }

  public get submitting(): boolean {
    return this._submitting.value;
  }

  public get formLoading(): boolean {
    return this._formLoading.value;
  }

  public get indexTypes(): Common_ICodeName[] {
    return this._indexTypes.value;
  }

  public get treeList(): TM_ITreeManageVO[] {
    return this._treeList.value;
  }

  public get expandedKeys(): number[] {
    return this._expandedKeys.value;
  }

  public set expandedKeys(value: number[]) {
    this._expandedKeys.value = value;
  }

  public get treeLoading(): boolean {
    return this._treeLoading.value;
  }
  //#endregion

  constructor() {
    this._queryParams.value.pageNum = 1;
    this._queryParams.value.pageSize = pageSizes[0];
    this._dataSource.value = [];
    this._treeList.value = [];
    this._expandedKeys.value = [];
    this._submitting.value = false;
    this._total.value = 0;

    this.initAssociateScopeVO();
  }

  initAssociateScopeVO() {
    this._expandedKeys.value = [];
    this._associateScopeVO.value.id = '';
    this._associateScopeVO.value.fixed = '';
    this._associateScopeVO.value.name = '';
    this._associateScopeVO.value.scopeType = '';
    this._associateScopeVO.value.serialNumber = '';
    this._associateScopeVO.value.treeInfo = [];
    this._associateScopeVO.value.treeIds = [];
    this._associateScopeVO.value.treeNames = [];
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
      const res = await postRequest(EPath.查询关联范围, params);
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

  convert(data: ADSR_IAssociateScopeVO[]) {
    return data
      ? data?.map((item) => {
          return {
            id: item?.id ?? '',
            fixed: item?.fixed ?? '',
            used: item?.used ?? '0',
            name: item?.name ?? '',
            scopeType: item?.scopeType ?? '',
            scopeTypeText: item?.scopeTypeText ?? '',
            serialNumber: item?.serialNumber ?? [],
          };
        })
      : [];
  }

  async handleAddShow() {
    this._visible.value = true;
    this._treeList.value = [];
    this.initAssociateScopeVO();

    const promiseArr = [this.queryDictionary()];
    Promise.all(promiseArr).finally(() => {
      this._formLoading.value = false;
    });
  }

  async handleDetailShow(id: string) {
    try {
      this.initAssociateScopeVO();
      this._associateScopeVO.value.id = id;
      this._detailVisible.value = true;
      this._formLoading.value = true;

      await this.queryIndicatorDetail();
      this._formLoading.value = false;
    } catch (error) {
      this._formLoading.value = false;
    }
  }

  handleEditShow(item: ADSR_IAssociateScopeVO) {
    this.initAssociateScopeVO();
    this._formLoading.value = true;
    this._associateScopeVO.value.id = item.id;
    this._associateScopeVO.value.scopeType = item?.scopeType;

    this._visible.value = true;

    const promiseArr = [this.queryIndicatorDetail(), this.queryDictionary(), this.queryAreaTreeList()];
    Promise.all(promiseArr).finally(() => {
      this._formLoading.value = false;
    });
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

  async queryIndicatorDetail() {
    this._formLoading.value = true;
    try {
      const res = await postRequest(EPath.查询关联范围详情, this._associateScopeVO.value.id);
      if (res?.code === 200 && res?.data) {
        this._associateScopeVO.value.id = res?.data?.id;
        this._associateScopeVO.value.name = res?.data?.name;
        this._associateScopeVO.value.fixed = res?.data?.fixed;
        this._associateScopeVO.value.used = res?.data?.used;
        this._associateScopeVO.value.scopeType = res?.data?.scopeType;
        this._associateScopeVO.value.scopeTypeText = res?.data?.scopeTypeText;
        this._associateScopeVO.value.serialNumber = res?.data?.serialNumber;
        this._associateScopeVO.value.treeInfo = res?.data?.treeInfo ?? [];

        this._associateScopeVO.value.treeIds = res?.data?.treeInfo
          ?.filter((item: ADSR_ITreeVO) => {
            return !!item?.id;
          })
          ?.map((item: ADSR_ITreeVO) => {
            return item?.id;
          });
        this._associateScopeVO.value.treeNames = res?.data?.treeInfo
          ?.filter((item: ADSR_ITreeVO) => {
            return !!item?.id;
          })
          ?.map((item: ADSR_ITreeVO) => {
            return item?.treeName;
          });
      } else {
        this.initAssociateScopeVO();
      }
    } catch (error) {
      this.initAssociateScopeVO();
    } finally {
      this._formLoading.value = false;
    }
  }

  handleScopeTypeChange = () => {
    this._associateScopeVO.value.treeInfo = [];
    this._associateScopeVO.value.treeIds = [];
    this._associateScopeVO.value.treeNames = [];
    this.queryAreaTreeList();
  };

  async queryAreaTreeList() {
    try {
      this._treeLoading.value = true;
      const res = await postRequest(EPath.查询区域树, {
        treeType: TM_TREE_TYPE.区域树,
        nodeType: this._associateScopeVO.value.scopeType,
      });

      if (res?.code === 200 && res?.data) {
        this._treeList.value = res?.data ?? [];
        this._expandedKeys.value = getTreeExpandKeys(this._treeList.value, 'id', 'childTree')?.map((item) => {
          return item;
        });
      } else {
        this._treeList.value = [];
      }
    } catch (error) {
      this._treeList.value = [];
    } finally {
      this._treeLoading.value = false;
    }
  }

  handleClose = () => {
    this._visible.value = false;
    this._detailVisible.value = false;
  };

  submit() {
    if (this._submitting.value) {
      return;
    }
    const { name, scopeType, treeIds } = this._associateScopeVO.value;

    if (!name) {
      message.error('请输入关联范围名称');
      return;
    }
    if (!scopeType) {
      message.error('请选择关联范围属性');
      return;
    }
    if (!treeIds || treeIds?.length === 0) {
      message.error('请选择关联节点');
      return;
    }
    if (this._associateScopeVO.value.id) {
      this.handleBaseIndicatorEdit();
    } else {
      this.handleBaseIndicatorCreate();
    }
  }

  async handleBaseIndicatorCreate() {
    this._submitting.value = true;
    try {
      const { name, scopeType, treeIds } = this._associateScopeVO.value;

      const res = await postRequest(EPath.新增关联范围, { name, scopeType, treeIds, fixed: ADSR_FIXED_TYPE.非系统 });
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
      const { name, scopeType, id, treeIds, fixed } = this._associateScopeVO.value;

      const res = await postRequest(EPath.修改关联范围, { name, scopeType, id, treeIds, fixed });
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
      const res = await postRequest(EPath.删除关联范围, id);
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
