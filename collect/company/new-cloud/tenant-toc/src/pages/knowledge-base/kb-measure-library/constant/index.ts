import axios from 'axios';
import serviceConfig from '@/config/service';
import message from '@/utils/message';
import { downloadBlobFile, FGetAuthorization } from '@/utils/index';
import { useRoute } from 'vue-router';
const route = useRoute();

// dic接口入参
export enum DicParams {
  MEASURE_SYSTEM_ID = 'measure_system_id', // 所属系统
  MEASURE_STATUS = 'measure_status', // 措施状态
  MEASURE_EXECUTION_CYCLE = 'measure_execution_cycle', // 建议执行周期
}

/**
 * 没有入参下载
 */
export const noParamsDownload = async (
  reqUrl: string,
  type = '导出' || '下载',
  cbFn?: () => void,
  failCb?: () => void,
) => {
  try {
    message.loading(`正在${type}`);
    const tenantCode = route && route.query && route.query.code ? (route.query.code as string) : '';
    const res: any = await axios({
      url: `${serviceConfig.BASE_URL}${reqUrl}`,
      method: 'post',
      headers: {
        'content-type': 'application/json',
        tenantCode,
        Authorization: FGetAuthorization(),
      },
      responseType: 'blob',
    });
    console.log(res, 'res');

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
};
