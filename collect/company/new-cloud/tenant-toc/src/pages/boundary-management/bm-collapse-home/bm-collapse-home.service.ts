import { nextTick, ref } from 'vue';
import { BM_IBoundaryTdEditStore } from './bm-collapse-home.api';
import { postRequest } from '@/service/request';
import { BM_IEditDataParams, BM_IEditPriceParams, EBmPath } from '../boundary-management.api';
import message from '@/utils/message';
import { BM_IAddManagementForm } from '../bm-search-bar/bm-search-bar.api';
import { getTenant } from '@/utils';

class BmCollapseHomeService {
  private _isEditing = ref<boolean>(false);
  private _editStore = ref<BM_IBoundaryTdEditStore>({
    energyCode: '',
    boundaryTypeId: null,
    eventId: null,
    year: '',
    month: '',
    amount: null,
    hostingAreaId: null,
    persistentType: '',
    originValue: '',
    itemName: '',
  });
  public get editStore(): BM_IBoundaryTdEditStore {
    return this._editStore.value;
  }
  public get isEditing(): boolean {
    return this._isEditing.value;
  }
  /**
   * 设置store
   * @param value
   */
  public setEditStore(value: BM_IBoundaryTdEditStore) {
    this._editStore.value.energyCode = value?.energyCode;
    this._editStore.value.boundaryTypeId = value?.boundaryTypeId;
    this._editStore.value.eventId = value?.eventId;
    this._editStore.value.year = value?.year;
    this._editStore.value.month = value?.month;
    this._editStore.value.amount = value?.amount;
    this._editStore.value.persistentType = value?.persistentType;
    this._editStore.value.hostingAreaId = value?.hostingAreaId;
    this._editStore.value.originValue = value?.originValue !== null ? value?.originValue + '' : '';
    this._editStore.value.itemName = value?.itemName;
  }
  public cancelEdit() {
    this.setEditStore({
      energyCode: '',
      persistentType: '',
      hostingAreaId: null,
      amount: null,
      year: '',
      month: '',
      eventId: null,
      boundaryTypeId: null,
      originValue: '',
      itemName: '',
    });
  }
  /**
   * 校验是否正在编辑状态
   * @param boundaryId 边界id
   * @param energy 能源类型
   * @param event 事件id
   * @param y 年
   * @param m 月
   * @param itemName 修改项
   * @returns boolean
   */
  public checkIsEditing(
    boundaryId: number,
    energy: string,
    event: number | null,
    areaId: number | null,
    y: string,
    m: string,
    item: string,
  ) {
    const { boundaryTypeId, energyCode, eventId, year, month, hostingAreaId, itemName } = this._editStore.value;
    return (
      boundaryTypeId === boundaryId &&
      energyCode === energy &&
      eventId === event &&
      hostingAreaId === areaId &&
      year === y &&
      month === m &&
      item === itemName
    );
  }
  /**
   * 发起删除请求
   * @param eventId
   * @returns Promise<boolean>
   */
  public handleEventDelete(eventId: number): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const res = await postRequest(EBmPath.删除边界管理, eventId);
        if (res?.success && res?.data) {
          resolve(true);
          message.success(res?.message ?? '操作成功');
        } else {
          resolve(false);
          message.error(res?.message ?? '操作失败');
        }
      } catch (error) {
        resolve(false);
        message.error('操作失败');
      }
    });
  }
  /**
   * 编辑用量
   * @param params 入参
   * @param amount 数据
   * @returns
   */
  public handleEnergyCountEdit(params: BM_IAddManagementForm, amount: string) {
    return new Promise(async (resolve) => {
      if (this._isEditing.value) {
        resolve(false);
        return;
      }
      this._isEditing.value = true;
      try {
        const { boundaryTypeId, energyCode, hostingAreaId, eventId, year, month, persistentType } =
          this._editStore.value;
        const editParams: BM_IEditDataParams = {
          ...params,
          ...getTenant(),
          hostingAreaId,
          amount: amount === '' ? null : Number(amount),
          boundaryType: boundaryTypeId,
          energyCode,
          eventId,
          year: Number(year),
          month: Number(month),
          persistentType,
        };
        const res = await postRequest(EBmPath.边界数据编辑, editParams);
        if (res?.success) {
          message.success(res?.message ?? '操作成功');
          nextTick(() => {
            this._isEditing.value = false;
          });
          this.cancelEdit();
          resolve(true);
        } else {
          resolve(false);
          message.error(res?.message ?? '操作失败');
        }
      } catch (error) {
        resolve(false);
        message.error('操作失败');
      } finally {
        nextTick(() => {
          this._isEditing.value = false;
        });
      }
    });
  }
  /**
   * 编辑单价
   * @param params 入参
   * @param price 单价
   * @returns
   */
  public handleEnergyPriceEdit(params: BM_IAddManagementForm, price: string) {
    return new Promise(async (resolve) => {
      if (this._isEditing.value) {
        resolve(false);
        return;
      }
      this._isEditing.value = true;
      try {
        const { boundaryTypeId, energyCode, hostingAreaId, eventId, year, month, persistentType } =
          this._editStore.value;
        const editParams: BM_IEditPriceParams = {
          ...params,
          ...getTenant(),
          hostingAreaId,
          price: price === '' ? null : Number(price),
          boundaryType: boundaryTypeId,
          energyCode,
          eventId,
          year: Number(year),
          month: Number(month),
          persistentType,
        };
        const res = await postRequest(EBmPath.边界单价编辑, editParams);
        if (res?.success) {
          message.success(res?.message ?? '操作成功');
          nextTick(() => {
            this._isEditing.value = false;
          });
          this.cancelEdit();
          resolve(true);
        } else {
          resolve(false);
          message.error(res?.message ?? '操作失败');
        }
      } catch (error) {
        resolve(false);
        message.error('操作失败');
      } finally {
        nextTick(() => {
          this._isEditing.value = false;
        });
      }
    });
  }
}

export default BmCollapseHomeService;
