/*
 * @Description: 基础指标维护服务
 * @Author: zpwan
 * @Date: 2022-10-13 09:39:56
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-11-16 11:27:16
 */
import { ref } from 'vue';
import { formatDate } from '@/utils/index';

import {
  ADBIM_IBasicIndicatorQueryParams,
  ADBIM_IBasicIndicatorVO,
  ADBIM_IBIForm,
} from './ad-basic-indicators-maintain.api';
import { postRequest } from '@/services/request';

import { pageSizes } from '@/config';
import message from '@/utils/message';
import { FSetSession } from '@/utils/token';

enum EPath {
  查询基础指标维护记录 = '/admin/apportion/basicIndex/maintain/list',
  新增基础指标维护记录 = '/admin/apportion/basicIndex/maintain/add',
  编辑基础指标维护记录 = '/admin/apportion/basicIndex/maintain/update',
  删除基础指标维护记录 = '/admin/apportion/basicIndex/maintain/del',
}

export class BasicIndicatorMaintainService {
  //#region
  private _dataSource = ref<ADBIM_IBasicIndicatorVO[]>([]);

  private _queryParams = ref<ADBIM_IBasicIndicatorQueryParams>({
    pageNum: 1,
    pageSize: 10,
  });

  private _loading = ref<boolean>(false);

  private _total = ref<number>(0);

  private _basicIndicatorVO = ref<ADBIM_IBIForm>({
    id: '',
    effectiveStartTime: null,
    effectiveEndTime: null,
    mark: '',
  });

  private _visible = ref<boolean>(false);

  private _submitting = ref<boolean>(false);

  public get dataSource(): ADBIM_IBasicIndicatorVO[] {
    return this._dataSource.value;
  }

  public get queryParams(): ADBIM_IBasicIndicatorQueryParams {
    return this._queryParams.value;
  }

  public get loading(): boolean {
    return this._loading.value;
  }

  public get total(): number {
    return this._total.value;
  }

  public get basicIndicatorVO(): ADBIM_IBIForm {
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
    // 清除缓存的页码
    FSetSession('ad-basic-indicators-maintain-pageNum', '');

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
      const res = await postRequest(EPath.查询基础指标维护记录, params);
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

  convert(data: ADBIM_IBasicIndicatorVO[]) {
    return data
      ? data?.map((item) => {
          return {
            id: item?.id ?? '',
            effectiveStartTime: item?.effectiveStartTime ?? null,
            effectiveEndTime: item?.effectiveEndTime ?? null,
            mark: item?.mark ?? '',
          };
        })
      : [];
  }

  handleAddShow() {
    this._visible.value = true;

    this._basicIndicatorVO.value.id = '';
    this._basicIndicatorVO.value.effectiveStartTime = null;
    this._basicIndicatorVO.value.effectiveEndTime = null;
    this._basicIndicatorVO.value.mark = '';
  }

  handleEditShow(item: ADBIM_IBasicIndicatorVO) {
    this._basicIndicatorVO.value.id = item.id;
    this._basicIndicatorVO.value.effectiveStartTime = item.effectiveStartTime
      ? new Date(item.effectiveStartTime)
      : null;
    this._basicIndicatorVO.value.effectiveEndTime = item.effectiveEndTime ? new Date(item.effectiveEndTime) : null;
    this._basicIndicatorVO.value.mark = item.mark;

    this._visible.value = true;
  }

  mapStartDateDisabled = (date: Date) => {
    return;
  };
  mapEndDateDisabled = (date: Date) => {};

  handleStartDateDisabled = (date: Date) => {
    return !!this._basicIndicatorVO.value.effectiveEndTime
      ? (date.getTime() > this._basicIndicatorVO.value.effectiveEndTime.getTime() &&
          formatDate(date, 'yyyy-MM-dd') !== formatDate(this._basicIndicatorVO.value.effectiveEndTime, 'yyyy-MM-dd')) ||
          date.getTime() > new Date().getTime()
      : date.getTime() > new Date().getTime();
  };

  handleEndDateDisabled = (date: Date) => {
    return this._basicIndicatorVO.value.effectiveStartTime
      ? (date.getTime() < this._basicIndicatorVO.value.effectiveStartTime.getTime() &&
          formatDate(date, 'yyyy-MM-dd') !==
            formatDate(this._basicIndicatorVO.value.effectiveStartTime, 'yyyy-MM-dd')) ||
          date.getTime() > new Date().getTime()
      : date.getTime() > new Date().getTime();
  };

  handleClose = () => {
    this._visible.value = false;
  };

  async submit(): Promise<{
    id: string;
    effectiveStartTime: string;
    effectiveEndTime: string;
  }> {
    if (this._submitting.value) {
      return Promise.resolve({
        id: '',
        effectiveStartTime: '',
        effectiveEndTime: '',
      });
    }
    const { effectiveStartTime } = this._basicIndicatorVO.value;
    if (!effectiveStartTime) {
      message.error('请选择开始日期');
      return Promise.resolve({
        id: '',
        effectiveStartTime: '',
        effectiveEndTime: '',
      });
    }

    return new Promise(async (resolve) => {
      let id = '';
      if (this._basicIndicatorVO.value.id) {
        id = await this.handleBaseIndicatorEdit();
      } else {
        id = await this.handleBaseIndicatorCreate();
      }
      const { effectiveStartTime, effectiveEndTime } = this._basicIndicatorVO.value;
      resolve({
        id,
        effectiveStartTime: effectiveStartTime ? formatDate(effectiveStartTime, 'yyyy-MM-dd') : '',
        effectiveEndTime: effectiveEndTime ? formatDate(effectiveEndTime, 'yyyy-MM-dd') : '',
      });
    });
  }

  handleBaseIndicatorCreate(): Promise<string> {
    return new Promise(async (resolve) => {
      this._submitting.value = true;
      try {
        const { effectiveStartTime, effectiveEndTime, mark } = this._basicIndicatorVO.value;

        const res = await postRequest(EPath.新增基础指标维护记录, {
          effectiveStartTime: effectiveStartTime ? formatDate(effectiveStartTime, 'yyyy-MM-dd') : '',
          effectiveEndTime: effectiveEndTime ? formatDate(effectiveEndTime, 'yyyy-MM-dd') : '',
          mark,
        });
        if (res?.code === 200 && res?.data) {
          message.success('新增成功');
          this._visible.value = false;
          this.query();
          resolve(res?.data);
        } else {
          resolve('');
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res?.message ?? '新增失败');
          }
        }
      } catch (error) {
        resolve('');
        message.error('新增失败');
      } finally {
        this._submitting.value = false;
      }
    });
  }

  handleBaseIndicatorEdit(): Promise<string> {
    return new Promise(async (resolve) => {
      this._submitting.value = true;
      try {
        const { effectiveStartTime, effectiveEndTime, mark, id } = this._basicIndicatorVO.value;

        const res = await postRequest(EPath.编辑基础指标维护记录, {
          effectiveStartTime: effectiveStartTime ? formatDate(effectiveStartTime, 'yyyy-MM-dd') : '',
          effectiveEndTime: effectiveEndTime ? formatDate(effectiveEndTime, 'yyyy-MM-dd') : '',
          mark,
          id,
        });
        if (res?.code === 200 && res?.data) {
          message.success('编辑成功');
          this._visible.value = false;
          this.query();
          resolve(res?.data);
        } else {
          resolve('');
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            message.error(res?.message ?? '编辑失败');
          }
        }
      } catch (error) {
        resolve('');
        message.error('编辑失败');
      } finally {
        this._submitting.value = false;
      }
    });
  }

  handleDeleteConfirm = async (id: string) => {
    try {
      const res = await postRequest(EPath.删除基础指标维护记录, id);
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
