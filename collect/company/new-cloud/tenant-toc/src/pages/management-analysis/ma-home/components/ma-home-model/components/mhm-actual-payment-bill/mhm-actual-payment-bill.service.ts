//#region
/**
 *  实际缴费service
 */
//#endregion

import CommonService from '@/service/pkg/index';

// 后台接口地址
const enum EPath {
  下载单个文件 = '/tenant/file/downloadFile',
}

/**
 * 实际缴费弹框
 * @classdesc 查询实际缴费票据
 * @default MhmActualPaymentBillService *单例模式
 */

class MhmActualPaymentBillService {
  //#region 状态
  private downloadFileLoading: boolean = false;

  //#endregion

  constructor() {}

  async seeFileDownload(fileId: number) {
    if (this.downloadFileLoading) {
      return;
    }
    this.downloadFileLoading = true;
    await CommonService.getFileStreamDownload(
      fileId,
      EPath.下载单个文件,
      '下载文件',
      () => {
        this.downloadFileLoading = false;
      },
      () => {
        this.downloadFileLoading = false;
      }
    );
  }
}

export default new MhmActualPaymentBillService();
