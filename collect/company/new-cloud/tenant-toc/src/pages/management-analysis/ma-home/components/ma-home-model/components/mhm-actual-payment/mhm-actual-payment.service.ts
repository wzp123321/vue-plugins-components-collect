//#region
/**
 *  实际缴费service
 */
//#endregion
import { postRequest } from '@/service/request';
import { FResHandler, IRes, TOKEN } from '../../../../services/api';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  MHM_ActualParamType,
  MHM_ActualPaymentDataType,
  MHM_ActualPaymentList,
  MHM_ActualPaymentListType,
  MHM_ActualType,
  MHM_AllActualPaymentDataType,
  MHM_FileVOListType,
  MHM_HRAType,
  MHM_OneActualPaymentDataType,
  NamecolorList,
} from './mhm-actual-payment.api';
// 后台接口地址
const enum EPath {
  实际缴费弹框 = '/business/analyse/node/data/actual/query',
}

/**
 * 实际缴费弹框
 * @classdesc 查询实际缴费详情，可预览
 * @default MhmActualPaymentService *单例模式
 */

class MhmActualPaymentService {
  //#region 状态
  private _loading = false;
  public get isLoading(): boolean {
    return this._loading;
  }

  private _isEmpty = false;
  public get isEmpty(): boolean {
    return this._isEmpty;
  }

  public isSelectYear?: number;
  //#endregion

  constructor() {}

  //#region 订阅
  _getActualPaymentist = new BehaviorSubject<MHM_ActualPaymentListType | null>(null);
  getActualPaymentData = this._getActualPaymentist.asObservable();
  getActualPaymentList(data: MHM_ActualPaymentListType | null) {
    this._getActualPaymentist.next(data);
  }
  //#endregion

  //#region 订阅表格数据
  _getActualPaymentTable = new Subject<MHM_AllActualPaymentDataType[]>();
  getActualPaymentTableData = this._getActualPaymentTable.asObservable();
  getActualPaymentTbaleList(data: MHM_AllActualPaymentDataType[]) {
    // console.log('表格', data);
    this._getActualPaymentTable.next(data);
  }
  //#endregion

  //#region 订阅票据详情
  _billList = new Subject<{ index: number; name: string; list: MHM_OneActualPaymentDataType }>();
  getBillDataList = this._billList.asObservable();
  getBillList(data: { index: number; name: string; list: MHM_OneActualPaymentDataType }) {
    //  console.log(data);
    this._billList.next(data);
  }
  //#endregion

  //#region 订阅查看数据的哪一个标签
  _billEnergyName = new Subject<string>();
  getBillEnergy = this._billEnergyName.asObservable();
  getBillInfoEnergy(data: string) {
    // console.log(data);
    this._billEnergyName.next(data);
  }
  //#endregion

  /**
   * 接口数据
   * @param data
   */
  public async queryActualPayment(param: MHM_ActualType): Promise<boolean> {
    this._loading = true;
    const convert = (data: MHM_ActualPaymentDataType): MHM_ActualPaymentListType | null =>
      data
        ? {
            allEnergyActualPaymentList:
              data.allEnergyActualPaymentList?.map((item: MHM_AllActualPaymentDataType) => ({
                energyName: item.energyName,
                oneEnergyActualPaymentList:
                  item.oneEnergyActualPaymentList?.map((item_one: MHM_OneActualPaymentDataType) => ({
                    actualPayment: item_one.actualPayment,
                    attachmentIds: item_one.attachmentIds,
                    date: item_one.date,
                    fileVOList:
                      item_one.fileVOList?.map((file: MHM_FileVOListType) => ({
                        fileId: file.fileId,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        fileUrl: file.fileUrl,
                      })) ?? [],
                    pictureVOList:
                      item_one.pictureVOList?.map((file: MHM_FileVOListType) => ({
                        fileId: file.fileId,
                        fileName: file.fileName,
                        fileType: file.fileType,
                        fileUrl: file.fileUrl,
                      })) ?? [],
                  })) ?? [],
              })) ?? [],
            chartsData: this.getChartsListType(data) ?? [],
            lineChartsData: this.getChartsLineListType(data) ?? [],
            legendList: data.energyNameColourList,
            XaxisList: data.yearMonthList,
          }
        : null;

    let actualPaymentData = null;

    // const TOKEN = {
    //   tenantCode: 'test03',
    //   tenantId: 13232244,
    // };
    try {
      const queryParam: MHM_ActualParamType = { ...TOKEN, ...param };
      //  console.log(queryParam);
      const res: IRes<MHM_ActualPaymentDataType> = await postRequest(EPath.实际缴费弹框, queryParam);
      let data: any = FResHandler(res);
      if (process.env.NODE_ENV === 'development') {
        // 开发环境
        // console.log(FResHandler(res));
        // data = MHM_ActualPaymentList;
      } else {
        data = FResHandler(res);
      }
      actualPaymentData = convert(data);
      this.getActualPaymentList(actualPaymentData);
      // masterData = [];
      if (!actualPaymentData) {
        this._isEmpty = true;
      }
    } catch (error) {
      this._isEmpty = true;
      this.getActualPaymentList(actualPaymentData);
      console.warn('查询实际缴费详情', '-->', error);
    } finally {
      this._loading = false;
    }
    this.getActualPaymentList(actualPaymentData);
    this._loading = false;

    return this._isEmpty;
  }
  /**
   * 得到charts的堆叠柱状返回数据格式
   * @param data
   */
  getChartsListType(data: MHM_ActualPaymentDataType) {
    const yearMonthList = data.yearMonthList;
    const legendList = data.energyNameColourList;
    const yList = data.histogramEnergyActualPayments;

    const ChartsData: MHM_HRAType[] = [];

    const energyData = legendList?.map((item: NamecolorList, le: number) => {
      // if (le > 0) {
      const valueType = this.YXValue(item, yearMonthList, yList, le);
      return valueType;
      // }
    });
    // console.log(energyData);
    energyData?.map((item) => {
      item?.map((list) => {
        ChartsData.push(list);
      });
    });
    //  console.log(ChartsData);
    return ChartsData ? ChartsData : [];
  }
  /**
   * chart 折线柱状图数据
   * @param data
   * @returns
   */
  getChartsLineListType(data: MHM_ActualPaymentDataType) {
    const yearMonthList = data.yearMonthList;
    const legendList = data.energyNameColourList;
    const yList = data.histogramEnergyActualPayments;

    const ChartsData: MHM_HRAType[] = [];

    const energyData = legendList?.map((item: NamecolorList, le: number) => {
      if (le === 0) {
        const valueType = this.YXValue(item, yearMonthList, yList, le);
        return valueType;
      }
    });
    // console.log(energyData);
    energyData?.map((item) => {
      item?.map((list) => {
        ChartsData.push(list);
      });
    });
    return ChartsData ? ChartsData : [];
  }

  /**
   * 数据重组
   * @param name 图例
   * @param XList x轴
   * @param yData y 数据
   * @param le 图例的下标
   * @returns
   */
  YXValue(nameColor: NamecolorList, XList: string[], yData: string | null[][], le: number) {
    const info = XList?.map((time: string, i: number) => {
      return {
        name: nameColor.energyName,
        year: time,
        color: nameColor.colour,
        energyCode: nameColor.energyCode,
        value: le > 0 ? (yData[i][le] ? Number(yData[i][le]) : null) : null,
        rate: le === 0 ? (yData[i][le] ? Number(yData[i][le]) : null) : null,
        index: i,
        prarentIndex: le,
      };
    });
    return info;
  }
}

export default new MhmActualPaymentService();
