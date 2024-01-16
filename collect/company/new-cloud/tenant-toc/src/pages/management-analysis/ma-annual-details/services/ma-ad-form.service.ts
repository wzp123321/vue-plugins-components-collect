import { postRequest } from '@/service/request';
import { ElMessage } from 'element-plus';
import { MA_AD_ISelectOption } from '../ma-annual-details.api';
import { FResHandler, IRes, TDeepReadonly, TOKEN } from './services.api';

// 后台接口地址
const enum EPath {
  查询调差类别列表 = '/tenantDict/detail/queryByCode',
  新增调差项 = '/annualData/adjustment/add',
  删除调差项 = '/annualData/adjustment/delete',
  查询调差项 = '/annualData/adjustment/query',
  修改调差项 = '/annualData/adjustment/update',
}

/**
 * 表单服务
 * @description 实现年度明细表调差项表单相关支撑服务
 * @default FormService 表单服务（单例模式）
 */
class FormService {
  private _loading = false;
  private _deleting = false;
  private _saving = false;
  private _visible = false;
  private _invalid = false;
  private _data: {
    id?: string;
    name?: string;
    type?: string;
    typeOptions?: Array<{ label: string; value: string }>;
  } = {};

  //#region 状态
  public get isLoading(): boolean {
    return this._loading;
  }

  public get isDeleting(): boolean {
    return this._deleting;
  }

  public get isSaving(): boolean {
    return this._saving;
  }

  public get isVisible(): boolean {
    return this._visible;
  }

  public get isInvalid(): boolean {
    return this._invalid;
  }
  //#endregion

  // 所属调差类别选项列表
  public get typeOptions(): TDeepReadonly<Array<MA_AD_ISelectOption>> {
    return this._data.typeOptions ?? [];
  }

  //#region 表单数据
  // 调差项id(原名称)
  public get id(): string | undefined {
    return this._data.id;
  }

  // 调差项名称
  public get name(): string {
    return this._data.name ?? '';
  }
  public set name(v: string) {
    const reg = new RegExp(String.raw`[\`\-\\;\'\"<> ]`, 'g');
    this._data.name = v.replace(reg, '');
  }

  // 所属调差类别
  public get type(): string | undefined {
    return this._data.type;
  }
  public set type(v: string | undefined) {
    this._data.type = v;
  }
  //#endregion

  public open(id?: string): void {
    this._data = { id };
    this._visible = true;

    this.query();
  }

  public close(): void {
    this._visible = false;
    this._invalid = false;
    this._data = {};
  }

  public async add(): Promise<boolean> {
    if (!this.verify()) {
      return false;
    }

    try {
      this._saving = true;
      const body: IAdjustmentItemReq = { adjustmentType: this.type, newName: this.name };
      const res = await postRequest(EPath.新增调差项, { ...body, ...TOKEN });
      FResHandler(res);
      ElMessage.success('保存成功');
      return true;
    } catch (error) {
      console.warn('新增调差项', '-->', error);
      ElMessage.error(`保存失败，${error}`);
      return false;
    } finally {
      this._saving = false;
    }
  }

  public async update(): Promise<boolean> {
    if (!this.id || !this.verify()) {
      return false;
    }

    try {
      this._saving = true;
      const body: IAdjustmentItemReq = { adjustmentType: this.type, newName: this.name, oldName: this.id };
      const res = await postRequest(EPath.修改调差项, { ...body, ...TOKEN });
      FResHandler(res);
      ElMessage.success('保存成功');
      return true;
    } catch (error) {
      console.warn('修改调差项', '-->', error);
      ElMessage.error(`保存失败，${error}`);
      return false;
    } finally {
      this._saving = false;
    }
  }

  public async delete(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }

    try {
      this._deleting = true;
      const body: IAdjustmentItemReq = { oldName: id };
      const res = await postRequest(EPath.删除调差项, { ...body, ...TOKEN });
      FResHandler(res);
      ElMessage.success('删除成功');
      return true;
    } catch (error) {
      console.warn('删除调差项', '-->', error);
      ElMessage.error(`删除失败，${error}`);
      return false;
    } finally {
      this._deleting = false;
    }
  }

  private async query(): Promise<void> {
    try {
      this._loading = true;
      await Promise.all([
        (async () => {
          const converter = (data: IAdjustmentTypeItem): MA_AD_ISelectOption => ({
            label: data.name,
            value: data.code,
          });

          try {
            const body = 'adjustment_type';
            const res: IRes<Array<IAdjustmentTypeItem>> = await postRequest(EPath.查询调差类别列表, body);
            const data = FResHandler(res);
            this._data.typeOptions = data?.map((item) => converter(item));
          } catch (error) {
            console.warn('查询调差类别列表', '-->', error);
          }
        })(),
        (async () => {
          try {
            if (this.id) {
              const body: IAdjustmentItemReq = { oldName: this.id };
              const res: IRes<IAdjustmentItemRes> = await postRequest(EPath.查询调差项, { ...body, ...TOKEN });
              const data = FResHandler(res);
              this._data.name = data.name;
              this._data.type = data.adjustmentType;
            }
          } catch (error) {
            console.warn('查询调差项', '-->', error);
          }
        })(),
      ]);
    } finally {
      this._loading = false;
    }
  }

  private verify(): boolean {
    this._invalid = false;

    const messages: string[] = [];
    if (!this.name) {
      messages.push('调差项名称不能为空');
    }
    if (!this.type) {
      messages.push('所属调差类别不能为空');
    }

    if (messages.length > 1) {
      messages.unshift('请填写必填项');
    }

    if (messages.length) {
      ElMessage.error(messages.shift());
      this._invalid = true;
    }

    return !this._invalid;
  }
}
export default new FormService();

interface IAdjustmentTypeItem {
  code: string;
  name: string;
}

interface IAdjustmentItemReq {
  adjustmentType?: string;
  newName?: string;
  oldName?: string;
}
interface IAdjustmentItemRes {
  adjustmentName: string;
  adjustmentType: string;
  name: string;
}
