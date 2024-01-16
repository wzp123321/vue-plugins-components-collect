import message from '@/utils/message';
import { postRequest } from '@/services/request';
import { Observable, BehaviorSubject } from 'rxjs';
import { SystemManageTable } from './system-management-config.api';
// 后台接口地址
const enum EPath {
  查询表格数据 = 'systemManagement/queryAll',
  更新表格数据 = 'systemManagement/update',
}

//系统管理表格服务
class SystemManageService {
  //表格数据
  private readonly _dataResult$ = new BehaviorSubject<{
    code?: number;
    data: SystemManageTable[];
    state: number;
    message?: string;
  }>({
    code: 200,
    data: [],
    state: -1,
    message: '',
  });

  public get dataResult$() {
    return this._dataResult$ as unknown as Observable<{
      code?: number;
      data: SystemManageTable[];
      state: number;
      message?: string;
    }>;
  }

  //查询表格数据
  public async query(): Promise<void> {
    const res = await postRequest(EPath.查询表格数据);
    if (res?.code === 200 && res?.data?.length) {
      res.data = res?.data?.map((item: SystemManageTable) => {
        return {
          id: item?.id ?? null,
          moduleName: item?.moduleName ?? '',
          moduleKey: item?.moduleKey ?? '',
          configurationValue: item?.configurationValue ?? '',
          configurationValueList:
            item?.configurationValueList?.map((v) => ({
              configurationItemCode: v?.configurationItemCode ?? '',
              configurationItemName: v?.configurationItemName ?? '',
              itemSelectedFlag: v?.itemSelectedFlag ?? false,
              checkList: v?.checkList?.map((childItem) => childItem ?? '') ?? [],
            })) ?? [],
          chooseType: item?.chooseType ?? '',
          checkList: item?.checkList?.map((v) => v ?? '') ?? [],
        };
      });

      this._dataResult$.next(res);
    }
  }
  //更新表格数据
  public async update(params: any): Promise<void> {
    try {
      const { id, configurationValueList, chooseType } = params;
      const param = {
        id,
        chooseType,
        configurationValueList,
      };
      const res = await postRequest(EPath.更新表格数据, params);
      if (res?.success) {
        message.success('编辑成功');
        this.query();
      } else {
        message.error(res?.message ?? '编辑失败');
      }
    } catch (error) {
      message.error('编辑失败');
    }
  }
  //更新表格数据
  public async updateSwitch(params: any): Promise<void> {
    try {
      const res = await postRequest(EPath.更新表格数据, params);
      if (res?.success) {
        message.success('编辑成功');
        this.query();
      } else {
        message.error(res?.message ?? '编辑失败');
      }
    } catch (error) {
      message.error('编辑失败');
    }
  }
}
export default new SystemManageService();
