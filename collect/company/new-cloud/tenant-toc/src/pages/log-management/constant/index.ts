import serviceConfig from '@/config/service';
import axios from 'axios';
import message from '@/utils/message';
import { downloadBlobFile, FGetAuthorization } from '@/utils/index';
import { FGetCookie } from '@/core/token';
const CommonService = {
  /**
   * 文件流导出通用接口
   * @param param 请求参数 类型自定义
   * @param reqUrl 请求地址
   * @param url type 类型 导出&下载
   * @param cbFn 成功回调
   * @param failCb 失败回调
   */
  async getFileStreamDownload<T>(
    params: T,
    reqUrl: string,
    type = '导出' || '下载',
    cbFn?: () => void,
    failCb?: () => void,
  ) {
    try {
      console.log(params);
      message.loading(`正在${type}`);

      const res: any = await axios({
        url: `${serviceConfig.BASE_URL}${reqUrl}`,
        method: 'post',
        data: params,
        headers: {
          'content-type': 'application/json',
          token: FGetCookie('toc-token') ?? '',
          tocTenantId: FGetCookie('toc_tenant_id') ?? 540,
          username: FGetCookie('username') ?? '',
          Authorization: FGetAuthorization(),
        },
        responseType: 'blob',
      });
      if (res && res.status === 200 && res.data && res.headers['content-disposition']) {
        const fileName =
          res.headers && res.headers['content-disposition']
            ? res.headers['content-disposition'].split('filename=')[1]
            : `数据${type}`;
        downloadBlobFile(res.data, decodeURIComponent(fileName), type, () => {
          if (typeof cbFn === 'function') {
            cbFn();
          }
        });
      } else {
        if (typeof failCb === 'function') {
          failCb();
        }
        message.error(`${type}失败！`);
      }
    } catch (error) {
      if (typeof failCb === 'function') {
        failCb();
      }
      message.error(`${type}失败！`);
    }
  },
};
export default CommonService;
