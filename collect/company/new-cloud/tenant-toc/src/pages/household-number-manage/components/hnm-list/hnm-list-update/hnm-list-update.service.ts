/*
 * @Author: yut
 * @Date: 2023-08-14 19:19:37
 * @LastEditors: yut
 * @LastEditTime: 2023-12-19 14:49:56
 * @Descripttion:
 */
import { reactive, ref } from 'vue';
import { EPath, EType, HLU_EHostingType, IFormType } from './hnm-list-update.api';
import { getTenant } from '@/utils';
import { postRequest } from '@/service/request';
import { TreeRes } from '@/pages/project-manage/services/project-manage.api';
import message from '@/utils/message';
import hlTable from '../hnm-list-table/hnm-list-table.service';

class HnmListUpdateService {
  //弹窗标题
  private _title = ref<'编辑户号' | '新建户号'>('新建户号');
  public get title() {
    return this._title.value;
  }
  public set title(val) {
    this._title.value = val;
  }

  //弹窗显隐
  private _visible = ref(false);
  public get visible() {
    return this._visible.value;
  }
  public set visible(val) {
    this._visible.value = val;
  }

  private _type = ref();
  public get type() {
    return this._type.value;
  }
  public set type(val) {
    this._type.value = val;
  }

  private _form = reactive<IFormType>({
    houseNumber: '',
    energyType: '01000',
    associatedNode: [],
    hostingArea: undefined,
    hostingAreaName: '',
    radioValue: '1',
    hostingFlag: HLU_EHostingType.否,
  });
  public get formObj() {
    return this._form;
  }

  private _associatedNodeList = ref<HouseholdNumberManagement.treeListVO[]>([]);
  public get associatedNodeList() {
    return this._associatedNodeList.value;
  }

  private _expandedKeys = ref<number[]>([]);
  public get expandedKeys() {
    return this._expandedKeys.value;
  }

  private _hostingAreaList = ref<{ areaId: number; areaName: string }[]>([]);
  public get hostingAreaList() {
    return this._hostingAreaList.value;
  }

  private _areaList = ref<{ areaId: number; areaName: string }[]>([]);
  public get areaList() {
    return this._areaList.value;
  }
  public set areaList(val) {
    this._areaList.value = val;
  }
  // 获取关联节点 树
  queryAssociatedNodeList = async (energyCode: string | undefined, treeType: string) => {
    try {
      const obj = {
        energyCode: energyCode,
        expandLevel: 2,
        treeType: treeType,
        ...getTenant(),
      };
      const res: HttpRequestModule.ResTemplate<TreeRes> = await postRequest(EPath.获取关联节点树, obj);
      if (res.code === 200 && res.success && res.data) {
        this._associatedNodeList.value = res.data.data;
        this._expandedKeys.value = res.data.expandTreeIds;
      } else {
        this._associatedNodeList.value = [];
        this._expandedKeys.value = [];
      }
    } catch (error) {
      this._associatedNodeList.value = [];
      this._expandedKeys.value = [];
    }
  };

  // 获取所属托管区域
  queryHostingAreaList = async (param?: string) => {
    try {
      const res: HttpRequestModule.ResTemplate<any> = await postRequest(EPath.获取所属托管区域, {
        energyCode: param ? param : hlTable.pageForm.energyCode,
        ...getTenant(),
      });
      if (res.code == 200 && res.success) {
        this._hostingAreaList.value = res.data;
      } else {
        this._hostingAreaList.value = [];
      }
    } catch (error) {
      this._hostingAreaList.value = [];
    }
  };

  /**
   * 新增户号
   */
  addHouseholdNumber = async (configureHostFlag: boolean = false) => {
    try {
      let params: any = {
        accountNumber: this._form.houseNumber,
        energyCode: this._form.energyType,
        hostingAreaId: this._form.hostingArea ? Number(this._form.hostingArea) : null,
        ...getTenant(),
        treeId: this._form.associatedNode[0],
      };
      if (configureHostFlag) {
        params = {
          ...params,
          hostingFlag: this._form.hostingFlag,
        };
      }

      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.新增户号, params);
      if (res.code === 200 && res.success && res.data) {
        message.success('新增成功');
      } else {
        message.error(res.message || '新增失败');
      }
    } catch (error) {
      message.error('新增失败');
    }
  };

  /**
   * 更新户号
   */
  updateHouseholdNumber = async (configureHostFlag: boolean = false) => {
    try {
      let params: any = {
        accountNumber: this._form.houseNumber,
        energyCode: this._form.energyType,
        hostingAreaId: this._form.hostingArea ? Number(this._form.hostingArea) : null,
        ...getTenant(),
        treeId: this._form.associatedNode[0],
        id: this._form.id,
      };
      if (configureHostFlag) {
        params = {
          ...params,
          hostingFlag: this._form.hostingFlag,
        };
      }
      const res: HttpRequestModule.ResTemplate<number> = await postRequest(EPath.编辑户号, params);
      if (res.code === 200 && res.success && res.data) {
        message.success('编辑成功');
      } else {
        message.error(res.message || '编辑失败');
      }
    } catch (error) {
      message.error('编辑失败');
    }
  };
}

export default new HnmListUpdateService();
