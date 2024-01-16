import { Subject, Observable } from 'rxjs';
import store from '@/store/index';
import { postRequest } from '@/services/request';
import { DA_EPath, DA_ICheckInfo, DA_IOperationState } from './department-assessment.api';

import message from '@/utils/message';

class DepartmentAssessmentService {
  // 配置项
  public operationConfig: DA_IOperationState = {
    showFlag: false,
    configFlag: false,
  };
  // 可观察对象-配置信息
  private _configResult$ = new Subject<DA_ICheckInfo>();
  // 可观察对象-配置信息
  public get configResult$() {
    return this._configResult$ as unknown as Observable<DA_ICheckInfo>;
  }
  /**
   * 查询页面配置项
   */
  async initConfigInfo() {
    try {
      const res = await postRequest(DA_EPath.查询页面相关配置信息);
      if (res?.success) {
        this.mapObservableResult(this.convertToConfigure(res?.data));
      } else {
        this.mapObservableResult();
      }
    } catch (error) {
      this.mapObservableResult();
    }
  }
  /**
   * 生成流数据
   * @param {DA_ICheckInfo} dataResult
   */
  private mapObservableResult = (dataResult?: DA_ICheckInfo) => {
    this.operationConfig.configFlag = dataResult?.configFlag ?? false;
    this.operationConfig.showFlag = dataResult?.showFlag ?? false;
    this._configResult$.next(dataResult);

    store.dispatch('setConfigureInfo', dataResult);
  };
  /**
   * 根据接口响应结果,处理数据
   * @param {DA_ICheckInfo} data
   * @returns {DA_ICheckInfo}
   */
  private convertToConfigure(data?: DA_ICheckInfo): DA_ICheckInfo {
    return {
      indexIdList: data?.indexIdList?.map((item) => ({ id: item?.id, name: item?.name, unit: item?.unit })) ?? [],
      treeIdList: data?.treeIdList?.map((item) => item) ?? [],
      allEnergyCodeList: data?.allEnergyCodeList?.map((item) => ({ code: item?.code, name: item?.name })) ?? [],
      energyCodeList: data?.energyCodeList?.map((item) => ({ code: item?.code, name: item?.name })) ?? [],
      configFlag: data?.configFlag ?? false,
      showFlag: data?.showFlag ?? true,
    };
  }
  /**
   * 保存用户操作
   * @param {boolean} showFlag
   * @param {boolean} configFlag
   * @returns {Promise<boolean>}
   */
  public handleOperationSave(showFlag: boolean, configFlag: boolean): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await postRequest(DA_EPath.保存用户操作记录, {
          showFlag,
          configFlag,
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
  /**
   * 保存用户操作&查询数据
   * @param {boolean} showFlag 是否展开
   * @param {boolean} configFlag 是否配置
   */
  public async saveOperationAndQuery(showFlag: boolean, configFlag: boolean) {
    // 判断是否已配置过，如果已配置则不调用保存操作接口
    if (store.getters.configureInfo.configFlag) {
      this.initConfigInfo();
    } else {
      if (await this.handleOperationSave(showFlag, configFlag)) {
        this.initConfigInfo();
      }
    }
  }
}

export default new DepartmentAssessmentService();
