import url from '@/api/api-url';
import { postRequest } from '@/services/request';
import Deffer from '@/utils';
import CommonService from '@/services/common/common.service';
import { RG_IStatementList } from '../components/rg-statement/rg-report.api';

import { getCampusParams } from '@/utils/token';

enum EPath {
  获取报告列表 = '/reportCreate/getReportTypeList',
  修改关注状态 = '/reportCreate/setFollowFlag',
  下载 = '/reportCreate/downloadReport',
  获取文件流前先判断是否有文件 = '/reportCreate/existFlag',
  上传报告报表 = '/report/uploadReport', // 上传报告报表
}

const reportGeneration = {
  /**
   * 查询报告数据
   * @param params
   * @returns
   */
  async getReportDataUrl(param: number): Promise<HttpRequestModule.ResTemplate<RG_IStatementList[]>> {
    const res: HttpRequestModule.ResTemplate<RG_IStatementList[]> = await postRequest(EPath.获取报告列表, param);
    return res;
  },

  /**
   * 修改报告关注状态
   * @param params
   * @returns
   */
  async updateFollowStatus(params: reportGenerationHttp.updateFollowStatusUrlType) {
    const res = await postRequest(EPath.修改关注状态, params);
    return res;
  },

  /**
   * 上传
   * @param params
   */
  async uploadReportData(params: any) {
    const res: any = await postRequest(EPath.上传报告报表, params);
    return res;
  },
  /**
   * 积木报表列表
   * @param params
   * @returns
   */
  async queryStateMenyList(
    params: string,
  ): Promise<HttpRequestModule.ResTemplate<reportGenerationHttp.getReportItemUrlType[]>> {
    const reqUrl = '/report/preview/query';
    const res: HttpRequestModule.ResTemplate<reportGenerationHttp.getReportItemUrlType[]> = await postRequest(
      reqUrl,
      params,
    );
    return res;
  },
  /**
   * 查询包括总能耗且标记为能耗的能源类型树结构
   * @returns
   */
  async queryEnergyFlagOneExcludeTotalTree(classId: number) {
    const url = '/admin/energy/code/queryEnergyAsTreeByTreeType';

    const deffer = new Deffer();
    try {
      const res = await postRequest(url, classId);
      if (res && res.code === 200) {
        const energyInit = [
          {
            childEnergyCode: [],
            co2Ratio: 0,
            coalRatio: 0,
            code: '00000',
            energyFlag: '1',
            environmentFlag: '1',
            id: 1,
            moneyRatio: 0,
            name: '总能耗',
            parentCode: '',
            parentName: '',
            standardPoints: '',
            totalEnergyFlag: '0',
            treeLeaf: '0',
            treeSort: 1,
            unit: 'kgce',
          },
        ];
        res.data = [...energyInit, ...res.data];
        //  console.log(res.data);
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.resolve([]);
      deffer.reject(error);
    }
    return deffer.promise;
  },

  /**
   * 获得分类分项对象
   */
  async energyObjectList(param: reportGeneration.ObjectTreeParam) {
    const url = '/admin/tree/listTreeByEnergyCode';
    const p = {
      ...param,
      ...getCampusParams(),
    };
    const deffer = new Deffer();

    try {
      const res = await postRequest(url, p);
      if (res && res.code === 200) {
        deffer.resolve(res.data);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.resolve([]);
      deffer.reject(error);
    }
    return deffer.promise;
  },

  /**
   * 获得分类分项设备
   */
  async energyDeviceList(param: string) {
    const url = '/device/queryDeviceByEnergyCode';

    const convert = (data: reportGeneration.DeviceListTypy[]): Array<reportGeneration.DeviceListDataTypy> =>
      data?.map((item) => ({
        value: `${item.deviceId}:${item.pointNumber}`,
        label: `${item.deviceName}:${item.name}`,
        concentratorId: item.concentratorId,
        concentratorName: item.concentratorName,
        deviceTypeCode: item.deviceTypeCode,
        logicNumber: item.logicNumber,
        address: item.address,
        location: item.location,
        serialNo: item.serialNo,
        comStatus: item.comStatus,
        parentId: item.parentId,
        parentName: item.parentName,
        level: item.level,
        id: item.id,
        systemCategory: item.systemCategory,
        systemCategoryName: item.systemCategoryName,
      })) ?? [];

    const deffer = new Deffer();

    try {
      const res = await postRequest(url, param);
      if (res && res.code === 200) {
        const devicedate = convert(res.data);
        deffer.resolve(devicedate);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.resolve([]);
      deffer.reject(error);
    }
    return deffer.promise;
  },
  /**
   * 下载
   * @param params
   * @returns
   */

  async DownloadFile(params: reportGeneration.SumbitParamType): Promise<boolean> {
    const deffer = new Deffer();
    const url = '/jimu/energy/analyse/export';
    await CommonService.getFileStreamDownload(
      params,
      url,
      '下载',
      () => {
        deffer.resolve(true);
      },
      () => {
        deffer.resolve(false);
      },
    );

    return deffer.promise;
  },

  /**
   * 获得类型
   */
  async energyFileIdList(param: string) {
    const url = '/report/template/query';
    const convert = (data: reportGeneration.FileIdType[]): Array<reportGeneration.FileIdType> =>
      data?.map((item) => ({
        templateType: item.templateType,
        templateName: item.templateName,
        templateId: item.templateId,
      })) ?? [];

    const deffer = new Deffer();

    try {
      const res = await postRequest(url, param);
      if (res && res.code === 200) {
        const devicedate = convert(res.data);
        deffer.resolve(devicedate);
      } else {
        deffer.resolve([]);
      }
    } catch (error) {
      deffer.resolve([]);
      deffer.reject(error);
    }
    return deffer.promise;
  },
  /**
   * 获取文件流前先判断是否有文件接口
   * @param params
   * @returns
   */
  async isFile(params: reportGenerationHttp.isFileParams) {
    const res = await postRequest(url.reportGeneration.isFileUrl, params);
    return res;
  },
  /**
   * 刷新你报告
   * @param params
   * @returns
   */
  async refreshReport(params: { date: string }) {
    const url = '/reportCreate/refreshReport';
    const res = await postRequest(url, params);
    return res;
  },
};

export default reportGeneration;

export interface energyDataType {
  treeSort: number;
  code: string;
  childEnergyCode: energyDataType[];
  coalRatio: number;
  totalEnergyFlag: string;
  treeLeaf: string;
  co2Ratio: number;
  parentName: string;
  unit: string;
  parentCode: string;
  name: string;
  moneyRatio: number;
  energyFlag: string;
  standardPoints: string;
  environmentFlag: string;
  id: number;
}
export interface INodeTreeOld {
  key: string;
  title: string;
  isLeaf: boolean;
  disabled: boolean;
  parentId: string[];
  children: INodeTreeOld[];
}

export interface RG_IDownloadApportionParams {
  endTimeStr: string;
  energyCodeList: string[];
  startTimeStr: string;
}

export interface RG_IDownloadConservationParams {
  excelConfigId: string;
  exportType: string;
  projectName: string;
  queryParam: {
    timeUnit: string;
    loginName: string;
    startTime: string;
    endTime: string;
    tenantCode: number;
  };
}
