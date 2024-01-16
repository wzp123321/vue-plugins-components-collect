import { ref, reactive } from 'vue';

import { postRequest } from '@/service/request';
import commonService from '@/service/pkg/index';

import { BM_EBoundaryType, BM_IAddEditDetail, BM_IAddEditForm, BmIHandleShowParams } from './bm-add-edit-dialog.api';
import {
  BM_IAddManagementParams,
  BM_IEditManagementParams,
  BM_IEnergyAreaVO,
  BM_IHostingAreaVO,
  BM_IQueryEnergyAreaResponse,
  EBmPath,
} from '../boundary-management.api';
import { CommonIHttpRes, CommonICodeName } from '@/service/api';

import { getTenant } from '@/utils';
import { cloneDeep } from 'lodash';
import message from '@/utils/message';

class BmAddEditDialogService {
  // 弹框开关
  private _visible = ref<boolean>(false);
  // loading
  private _loading = ref<boolean>(false);
  // 表单数据
  private _addEditForm = reactive<BM_IAddEditForm>({
    hostingPeriod: null,
    boundaryType: '',
    eventName: '',
    deviceType: '',
    verificationType: '',
    measureType: '',
    energyCodeAreas: [],
    chainId: null,
    comment: '',
    eventId: null,
  });
  // 设备类型列表
  private _deviceTypeList = ref<CommonICodeName[]>([]);
  // 能耗区域列表
  private _energyAreaList = ref<BM_IQueryEnergyAreaResponse[]>([]);
  // 边界类型列表
  private _boundaryTypeList = ref<CommonICodeName[]>([]);
  // 提交开关
  private _isSubmitting = ref<boolean>(false);
  public get visible(): boolean {
    return this._visible.value;
  }
  public set visible(value: boolean) {
    this._visible.value = value;
  }
  public get loading(): boolean {
    return this._loading.value;
  }
  public get addEditForm(): BM_IAddEditForm {
    return this._addEditForm;
  }
  public set addEditForm(value: BM_IAddEditForm) {
    this._addEditForm.boundaryType = value?.boundaryType ?? '';
    this._addEditForm.comment = value?.comment ?? '';
    this._addEditForm.deviceType = value?.deviceType ?? '';
    this._addEditForm.energyCodeAreas = value?.energyCodeAreas ?? [];
    this._addEditForm.eventId = value?.eventId ?? null;
    this._addEditForm.eventName = value?.eventName ?? '';
    this._addEditForm.hostingPeriod = value?.hostingPeriod ?? null;
    this._addEditForm.measureType = value?.measureType ?? '';
    this._addEditForm.verificationType = value?.verificationType ?? '';
  }
  public get deviceTypeList(): CommonICodeName[] {
    return this._deviceTypeList.value;
  }
  public get energyAreaList(): BM_IQueryEnergyAreaResponse[] {
    return this._energyAreaList.value;
  }
  public get boundaryTypeList(): CommonICodeName[] {
    return this._boundaryTypeList.value;
  }
  /**
   * 打开弹框
   * @param params
   */
  async handleShow(params: BmIHandleShowParams) {
    this.assignmentForm();
    this._visible.value = true;
    this._addEditForm.eventId = params?.id ?? null;
    this._addEditForm.chainId = params?.chainId ?? null;
    console.log('this._addEditForm.-----------', params?.chainId, this._addEditForm);
    this.init();
    if (!!params?.id) {
      this.queryBoundaryDetailById(params?.id);
    } else {
      this._addEditForm.hostingPeriod = params?.hostingPeriod ?? null;
    }
  }
  handleClose = () => {
    this._visible.value = false;
  };
  /**
   * 根据id获取详情
   * @param id
   */
  async queryBoundaryDetailById(id: number) {
    this._loading.value = true;
    try {
      const res: CommonIHttpRes<BM_IAddEditDetail> = await postRequest(EBmPath.根据边界id获取详情, id);
      if (res?.success) {
        if (res?.data?.boundaryType === BM_EBoundaryType.用能设备及器具调整) {
          this.handleBoundaryTypeChange(res?.data?.boundaryType);
        }
        this.assignmentForm(res?.data);
      } else {
        this.assignmentForm();
      }
    } catch (error) {
      this.assignmentForm();
    } finally {
      this._loading.value = false;
    }
  }
  /**
   * 赋值表单数据
   * @param form
   */
  assignmentForm(form?: BM_IAddEditDetail) {
    this._addEditForm.boundaryType = form?.boundaryType ?? '';
    this._addEditForm.comment = form?.comment ?? '';
    this._addEditForm.deviceType = form?.deviceType ?? '';
    this._addEditForm.eventName = form?.eventName ?? '';
    this._addEditForm.hostingPeriod = form?.hostingPeriod ?? null;
    this._addEditForm.measureType = form?.measureType ?? '';
    this._addEditForm.verificationType = form?.verificationType ?? '';
    this._addEditForm.energyCodeAreas = [];

    form?.energyHostingAreas?.forEach((it) => {
      const item = this._energyAreaList.value?.filter((item) => item.energyCode.code === it?.energyCode)?.[0];
      const hasHostingRegion = item?.hasHostingRegion ?? false;
      const hostingAreas = item?.hostingAreas ?? [];
      this._addEditForm.energyCodeAreas.push({
        energyCodeName: it?.energyName,
        energyCode: it?.energyCode,
        hasHostingRegion,
        energySelected: it.energySelected,
        hostingAreaIds: it?.hostingAreaIds ?? [],
        hostingAreas,
      });
    });
    setTimeout(() => {
      // 按照能源区域进行排序
      if (this._addEditForm.energyCodeAreas?.length) {
        this._addEditForm.energyCodeAreas = this._addEditForm.energyCodeAreas.sort((a, b) => {
          return (
            this._energyAreaList.value?.findIndex((item) => item.energyCode.code === a.energyCode) -
            this._energyAreaList.value?.findIndex((item) => item.energyCode.code === b.energyCode)
          );
        });
      }
    });
  }
  /**
   * 初始化
   */
  async init() {
    try {
      const promiseArr: [
        Promise<CommonIHttpRes<BM_IQueryEnergyAreaResponse[]>>,
        Promise<CommonIHttpRes<CommonICodeName[]>>,
      ] = [postRequest(EBmPath.查询能源类型和托管区域, getTenant().tenantId), postRequest(EBmPath.查询边界类型)];
      const resArr: [CommonIHttpRes<BM_IQueryEnergyAreaResponse[]>, CommonIHttpRes<CommonICodeName[]>] =
        await Promise.all(promiseArr);
      if (resArr?.length) {
        if (resArr?.[0]?.success) {
          this._energyAreaList.value = resArr?.[0]?.data ?? [];

          if (this._addEditForm.eventId) {
            this._energyAreaList.value.forEach((item) => {
              this._addEditForm.energyCodeAreas.forEach((it) => {
                if (it.energyCode === item.energyCode.code) {
                  it.hasHostingRegion = item.hasHostingRegion;
                  it.hostingAreas = cloneDeep(item.hostingAreas);
                }
              });
            });
          } else {
            this._energyAreaList.value.forEach((item) => {
              this._addEditForm.energyCodeAreas.push({
                energyCodeName: item?.energyCode.name,
                energyCode: item?.energyCode.code,
                hasHostingRegion: item.hasHostingRegion,
                energySelected: false,
                hostingAreaIds: [],
                hostingAreas: item.hostingAreas,
              });
            });
          }
        } else {
          this._energyAreaList.value = [];
        }
        if (resArr?.[1]?.success) {
          this._boundaryTypeList.value = resArr?.[1]?.data ?? [];
        } else {
          this._boundaryTypeList.value = [];
        }
      }
    } catch (error) {
      this._boundaryTypeList.value = [];
      this._energyAreaList.value = [];
    }
  }
  /**
   * 判断是否展示设备类型选择
   * @returns boolean
   */
  mapDeviceTypeItemShow() {
    return this._addEditForm.boundaryType && this._addEditForm.boundaryType === BM_EBoundaryType.用能设备及器具调整;
  }
  /**
   * 切换边界类型，判断是否查询设备类型
   * @param value
   */
  handleBoundaryTypeChange = async (value: string) => {
    this._addEditForm.deviceType = '';
    if (value === BM_EBoundaryType.用能设备及器具调整 && this._deviceTypeList.value?.length === 0) {
      try {
        const res: CommonIHttpRes<CommonICodeName[]> = await commonService.queryDictionaryListByCode('device_type');
        if (res?.success) {
          this._deviceTypeList.value = res?.data ?? [];
        } else {
          this._deviceTypeList.value = [];
        }
      } catch (error) {
        this._deviceTypeList.value = [];
      }
    }
  };
  /**
   * 校验能源类型是否被选中
   * @param energyCode 能源类型
   */
  mapEnergyCodeChecked(energyCode: string) {
    return this._addEditForm.energyCodeAreas?.some((it) => {
      return it.energyCode === energyCode;
    });
  }
  /**
   * 勾选能源类型
   * @param value 是否勾选
   * @param energyCode 能源类型
   */
  handleEnergyChange = (value: boolean, energyCode: string) => {
    this._addEditForm.energyCodeAreas.forEach((it) => {
      if (it.energyCode === energyCode) {
        it.energySelected = value;
        it.hostingAreaIds = [];
      }
    });
  };
  /**
   * 拿当前能源类型勾选的区域列表
   * @param energyCode
   * @returns
   */
  mapEnergyAreaValue(energyCode: string) {
    let codes: number[] = [];
    this._addEditForm.energyCodeAreas?.forEach((it) => {
      if (it.energyCode === energyCode) {
        codes = cloneDeep(it.hostingAreaIds);
      }
    });
    return codes;
  }
  /**
   * 根据能源类型获取对应绑定区域列表
   * @param energyCode
   * @returns
   */
  mapAreaListByEnergyCode(energyCode: string) {
    let list: BM_IHostingAreaVO[] = [];
    this._energyAreaList.value.forEach((item) => {
      if (item.energyCode.code === energyCode) {
        list = cloneDeep(item.hostingAreas);
      }
    });
    return list;
  }
  /**
   * 勾选区域
   * @param value 区域数组
   * @param energyCode 能源类型
   */
  handleAreaChange = (value: number[], energyCode: string) => {
    this._addEditForm.energyCodeAreas.forEach((it) => {
      if (it.energyCode === energyCode) {
        it.hostingAreaIds = value;
      }
    });
  };
  handleSubmit() {
    return new Promise(async (resolve) => {
      if (this._isSubmitting.value) {
        resolve(false);
        return;
      }
      this._isSubmitting.value = true;
      console.log('%c✨✨新增&编辑边界规则✨✨', 'font-size: 24px', this._addEditForm);
      const {
        hostingPeriod,
        boundaryType,
        deviceType,
        measureType,
        verificationType,
        energyCodeAreas,
        eventId,
        eventName,
        comment,
        chainId,
      } = this._addEditForm;
      console.log(chainId);
      let convertEnergyCodeAreas: BM_IEnergyAreaVO[] = [];
      energyCodeAreas?.forEach((item) => {
        if (item.energySelected) {
          convertEnergyCodeAreas.push({
            energyCode: item?.energyCode,
            hostingAreaIds: item?.hasHostingRegion ? item?.hostingAreaIds : item?.hostingAreas?.map((it) => it.id),
          });
        }
      });
      convertEnergyCodeAreas = convertEnergyCodeAreas.sort((a, b) => {
        return (
          this._energyAreaList.value?.findIndex((item) => item.energyCode.code === a.energyCode) -
          this._energyAreaList.value?.findIndex((item) => item.energyCode.code === b.energyCode)
        );
      });

      const addParams: BM_IAddManagementParams = {
        deviceType,
        measureType,
        verificationType,
        energyCodeAreas: convertEnergyCodeAreas,
        eventName,
        hostingPeriod,
        boundaryType,
        comment,
        ...getTenant(),
      };
      const editParams: BM_IEditManagementParams = {
        deviceType,
        measureType,
        hostingPeriod,
        boundaryType,
        verificationType,
        energyCodeAreas: convertEnergyCodeAreas,
        eventName,
        comment,
        eventId,
        chainId,
        ...getTenant(),
      };

      const path = this._addEditForm.eventId ? EBmPath.编辑边界管理 : EBmPath.新增边界管理;
      try {
        const res = await postRequest(path, this._addEditForm.eventId ? editParams : addParams);
        if (res?.success) {
          message.success(res?.message ?? '操作成功');
          this._visible.value = false;
          resolve(true);
        } else {
          message.error(res?.message ?? '操作失败');
          resolve(false);
        }
      } catch (error) {
        console.log('%c✨✨新增&边界边界规则----->Error✨✨', 'font-size: 24px', error);
        message.error('操作失败');
        resolve(false);
      } finally {
        this._isSubmitting.value = false;
      }
    });
  }
}

export default new BmAddEditDialogService();
