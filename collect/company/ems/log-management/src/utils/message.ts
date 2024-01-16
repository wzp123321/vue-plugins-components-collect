/*
 * @Description: 消息提示
 * @Autor: zpwan
 * @Date: 2022-03-17 16:07:50
 * @LastEditors: zpwan
 * @LastEditTime: 2022-03-17 16:34:48
 */
import { ElMessage } from 'element-plus';
let messageInstance: any;
const message = {
  success: (message: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = ElMessage({
      type: 'success',
      message,
    });
    return messageInstance;
  },
  error: (message: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = ElMessage({
      type: 'error',
      message,
    });
    return messageInstance;
  },
  warning: (message: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = ElMessage({
      type: 'warning',
      message,
    });
    return messageInstance;
  },
  info: (message: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = ElMessage({
      type: 'info',
      message,
    });
    return messageInstance;
  },
  //  loading
  loading: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = ElMessage({
      duration: 0,
      customClass: 'download-message',
      message: msg,
    });
    return messageInstance;
  },
};

export default message;
