/*
 * @Author: yut
 * @Date: 2023-07-28 17:17:36
 * @LastEditors: yut
 * @LastEditTime: 2023-09-12 09:19:09
 * @Descripttion:
 */
import { ref } from 'vue';
import { cloneDeep } from 'lodash';
import { postRequest } from '../../services/request';
import {
  EEditType,
  EEnergyType,
  EPath,
  ER_IRateTemplateList,
  ER_ITemplateEditData,
  ETemplateType,
} from './energy-rate.api';
import { Common_IHttpListRes, Common_IHttpRes } from '../../services/api';
import message from '../../utils/message';

class EnergyRateService {
  /**
   *能源类型
   */
  private _energyType = ref('');
  public get energyType() {
    return this._energyType.value;
  }
  public set energyType(val) {
    this._energyType.value = val;
  }

  /**
   *模板类型
   */
  private _templateType = ref('');
  public get templateType() {
    return this._templateType.value;
  }
  public set templateType(val) {
    this._templateType.value = val;
  }

  /**
   *生效时间
   */
  private _date = ref<string[]>([]);
  public get date() {
    return this._date.value;
  }
  public set date(val) {
    this._date.value = val;
  }

  //分页
  private _total = ref(0); //数据总数
  public get total() {
    return this._total.value;
  }
  private _loading = ref(false); //表格加载
  public get loading() {
    return this._loading.value;
  }

  private _btnLoading = ref(false); //提交加载
  public get btnLoading() {
    return this._btnLoading.value;
  }
  private _pageSize = ref(10); //每页数据条数
  public get pageSize() {
    return this._pageSize.value;
  }
  public set pageSize(val: number) {
    this._pageSize.value = val;
  }
  private _pageIndex = ref(1); //页码
  public get pageIndex() {
    return this._pageIndex.value;
  }
  public set pageIndex(val: number) {
    this._pageIndex.value = val;
  }

  /**
   * 表格数据
   */
  private _tableData = ref<any[]>([]);
  public get tableData() {
    return this._tableData.value;
  }

  /**
   * 编辑/编辑弹窗
   */
  private _visible = ref(false);
  public get visible() {
    return this._visible.value;
  }
  public set visible(val) {
    this._visible.value = val;
  }

  /**
   * 编辑类型
   */
  private _editType = ref(EEditType.新增);
  public get editType() {
    return this._editType.value;
  }
  public set editType(val) {
    this._editType.value = val;
  }

  private _energyTypeList = ref<{ name: string; code: string }[]>([
    {
      name: '全部',
      code: '',
    },
    {
      name: '电',
      code: EEnergyType.电,
    },
    {
      name: '水',
      code: EEnergyType.水,
    },
    {
      name: '燃气',
      code: EEnergyType.燃气,
    },
  ]);

  public get energyTypeList() {
    return this._energyTypeList.value;
  }

  private _templateTypeList = ref<{ code: string; name: string }[]>([]);
  public get templateTypeList() {
    return this._templateTypeList.value;
  }
  /**
   * 新增/编辑的数据
   */
  private _editData = ref<ER_ITemplateEditData>({
    energyCode: EEnergyType.电,
    templateType: ETemplateType.平价模板,
    effectiveTime: null,
    expirationTime: null,
    parity: null,
    sharp: null,
    peak: null,
    flat: null,
    valley: null,
  });
  public get editData() {
    return this._editData.value;
  }
  public set editData(val) {
    this._editData.value = val;
  }

  /**
   * 查询
   */
  onSearch = () => {
    this._pageIndex.value = 1;
    this._pageSize.value = 10;
    this.getTemplateListData();
  };

  /**
   * 重置
   */
  onReset = () => {
    this._energyType.value = '';
    this._templateType.value = '';
    this._pageIndex.value = 1;
    this._pageSize.value = 10;
    this._date.value = [];
    this.getTemplateListData();
  };

  /**
   * 页码变化
   * @param val 页码
   */
  handleCurrentChange = (val: number) => {
    this._pageIndex.value = val;
    this.getTemplateListData();
  };

  /**
   * 页面大小变化
   * @param val 页面大小
   */
  handleSizeChange = (val: number) => {
    this._pageSize.value = val;
    this._pageIndex.value = 1;
    this.getTemplateListData();
  };

  /**
   * 获取费率模板数据
   */
  getTemplateListData = async () => {
    try {
      const params = {
        energyCode: this._energyType.value,
        templateType: this._templateType.value,
        startTime: this._date.value == null ? null : this._date.value[0],
        endTime: this._date.value == null ? null : this._date.value[1],
        pageNum: this._pageIndex.value,
        pageSize: this._pageSize.value,
      };
      this._loading.value = true;
      const res: Common_IHttpRes<Common_IHttpListRes<ER_IRateTemplateList[]>> = await postRequest(
        EPath.分页查询费率模板,
        params,
      );
      if (res.code === 200 && res.success && res.data) {
        const { list, total } = res.data;
        this._tableData.value = list;
        this._total.value = total;
      } else {
        this._tableData.value = [];
        this._total.value = 0;
        message.error(res.message || '获取数据失败');
      }
    } catch (error) {
      this._tableData.value = [];
      this._total.value = 0;
      message.error('获取数据失败');
    } finally {
      this._loading.value = false;
    }
  };

  getEnergyTypeList = async () => {
    try {
      const res: Common_IHttpRes<{ name: string; code: string }[]> = await postRequest(EPath.获取能源类型);
      if (res.code === 200 && res.success) {
        this._energyTypeList.value = res.data;
      } else {
        this._energyTypeList.value = [];
        message.error(res.message || '获取失败');
      }
    } catch (error) {
      this._energyTypeList.value = [];
    }
  };

  getTemplateTypeList = async () => {
    try {
      const params = 'template_type';
      const res: Common_IHttpRes<{ name: string; code: string }[]> = await postRequest(EPath.获取模板类型, params);
      if (res.code === 200 && res.success) {
        this._templateTypeList.value = res.data;
      } else {
        this._templateTypeList.value = [];
        message.error(res.message || '获取失败');
      }
    } catch (error) {
      this._templateTypeList.value = [];
    }
  };

  /**
   * 新增费率模板
   */
  addRateTempale = async () => {
    try {
      this._btnLoading.value = true;
      const res: Common_IHttpRes<boolean> = await postRequest(EPath.新增费率模板, this._editData.value);
      if (res.code === 200 && res.data && res.success) {
        message.success('新增成功');
        this._visible.value = false;
        this._btnLoading.value = false;
        this.getTemplateListData();
      } else {
        this._btnLoading.value = false;
        message.error(res.message || '新增失败');
      }
    } catch (error) {
      message.error('新增失败');
      this._btnLoading.value = false;
    }
  };

  /**
   * 修改费率模板
   */
  editRateTemplate = async () => {
    try {
      this._btnLoading.value = true;
      const params: ER_ITemplateEditData = cloneDeep(this._editData.value);
      delete params.energyCode;
      const res: Common_IHttpRes<boolean> = await postRequest(EPath.更新费率模板, params);
      if (res.code === 200 && res.data && res.success) {
        message.success('修改成功');
        this._visible.value = false;
        this._btnLoading.value = false;
        this.getTemplateListData();
      } else {
        message.error(res.message || '修改失败');
        this._btnLoading.value = false;
      }
    } catch (error) {
      message.error('修改失败');
      this._btnLoading.value = false;
    }
  };
}

export default new EnergyRateService();
