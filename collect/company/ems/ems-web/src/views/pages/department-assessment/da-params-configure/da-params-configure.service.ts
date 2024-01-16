import { ref } from 'vue';
import { DPC_IPageForm, DPC_IIndexVO } from './da-params-configure.api';
import { Common_ICodeName, Common_IHttpResponse, Common_ILabelValue } from '@/services/common/common-api';
import { postRequest } from '@/services/request';
import { DA_EPath } from '../department-assessment.api';
import message from '@/utils/message';

class DaParamsConfigureService {
  // 表单
  private _pageForm = ref<DPC_IPageForm>({
    indexIdList: [],
    treeIdList: [],
    energyCodeList: [],
    configFlag: true,
    showFlag: true,
  });
  // 指标列表
  private _indexList = ref<Common_ILabelValue<number>[]>([]);
  // 能源类型列表
  private _energyList = ref<Common_ILabelValue[]>([]);
  // 表单
  public get pageForm(): DPC_IPageForm {
    return this._pageForm.value;
  }
  // 指标列表
  public get indexList(): Common_ILabelValue<number>[] {
    return this._indexList.value;
  }
  // 能源类型列表
  public get energyList(): Common_ILabelValue[] {
    return this._energyList.value;
  }
  /**
   * 设置表单以及能源类型列表
   * @param {number[]} indexIdList 勾选的指标
   * @param {number[]} treeIdList 勾选的科室树
   * @param {string[]} energyList 能源类型数组
   * @param {boolean} configFlag 是否配置过
   * @param {boolean} showFlag 是否收起
   * @param {Common_ICodeName<string>[]} allEnergyCodeList 勾选的能源类型
   */
  public setPageFormAndEnergyList(
    indexIdList: number[],
    treeIdList: number[],
    energyList: string[],
    configFlag: boolean,
    showFlag: boolean,
    allEnergyCodeList: Common_ICodeName<string>[],
  ) {
    this._pageForm.value.indexIdList = indexIdList ?? [];
    this._pageForm.value.treeIdList = treeIdList ?? [];
    this._pageForm.value.energyCodeList = energyList ?? [];
    this._pageForm.value.configFlag = configFlag ?? false;
    this._pageForm.value.showFlag = showFlag ?? false;

    this._energyList.value =
      allEnergyCodeList?.map((item) => {
        return {
          label: item.name,
          value: item.code,
        };
      }) ?? [];
  }
  /**
   * 查询指标列表
   */
  async queryIndexList() {
    try {
      const res: Common_IHttpResponse<DPC_IIndexVO[]> = await postRequest(DA_EPath.考核指标下拉框);
      if (res?.success) {
        this._indexList.value =
          res?.data?.map((item) => ({
            label: item.name,
            value: item.id,
          })) ?? [];
      } else {
        this._indexList.value = [];
      }
    } catch (error) {
      this._indexList.value = [];
    }
  }
  /**
   * 保存配置的指标
   * @returns {Promise<boolean>}
   */
  public handleIndexSave(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await postRequest(DA_EPath.考核指标保存, {
          idList: this._pageForm.value.indexIdList,
        });
        if (res?.success) {
          resolve(true);
        } else {
          reject(false);
          message.error(res?.message ?? '操作失败');
        }
      } catch (error) {
        reject(false);
        message.error('操作失败');
      }
    });
  }
  /**
   * 保存能源类型
   * @returns {Promise<boolean}
   */
  public handleEnergySave(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await postRequest(DA_EPath.勾选分类分项保存, {
          energyCodeList: this._pageForm.value.energyCodeList,
        });
        if (res?.success) {
          resolve(true);
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
}

export default DaParamsConfigureService;
