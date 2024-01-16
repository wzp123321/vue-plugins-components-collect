/*
 * @Description: 消息提示
 * @Autor: zpwan
 * @Date: 2022-03-17 16:07:50
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-30 17:11:10
 */
import { ElMessage } from 'element-plus';
let messageInstance: any;
const message = {
  success: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (typeof msg === 'string' && !msg.toLocaleLowerCase()?.includes('login')) {
      messageInstance = ElMessage({
        type: 'success',
        message: msg,
        duration: 3000,
      });
    }

    return messageInstance;
  },
  error: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (typeof msg === 'string' && !msg.toLocaleLowerCase()?.includes('login')) {
      messageInstance = ElMessage({
        type: 'error',
        message: msg,
        duration: 3000,
      });
    }
    return messageInstance;
  },
  warning: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (typeof msg === 'string' && !msg.toLocaleLowerCase()?.includes('login')) {
      messageInstance = ElMessage({
        type: 'warning',
        message: msg,
        duration: 3000,
      });
    }
    return messageInstance;
  },
  info: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (typeof msg === 'string' && !msg.toLocaleLowerCase()?.includes('login')) {
      messageInstance = ElMessage({
        type: 'info',
        message: msg,
        duration: 3000,
      });
    }
    return messageInstance;
  },
  //  loading
  loading: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (typeof msg === 'string' && !msg.toLocaleLowerCase()?.includes('login')) {
      messageInstance = ElMessage({
        duration: 0,
        customClass: 'download-message',
        message: msg,
      });
    }
    return messageInstance;
  },
};

export default message;
