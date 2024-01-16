/*
 * @Description: 消息提示
 * @Autor: zpwan
 * @Date: 2022-03-17 16:07:50
 * @LastEditors: wanzp
 * @LastEditTime: 2023-08-07 09:43:10
 */
import { ElMessage } from 'element-plus';
let messageInstance: any;

const message = {
  success: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (checkMessageLegal(msg)) {
      messageInstance = ElMessage({
        type: 'success',
        message: msg,
      });
    }
    return messageInstance;
  },
  error: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (checkMessageLegal(msg)) {
      messageInstance = ElMessage({
        type: 'error',
        message: msg,
      });
    }
    return messageInstance;
  },
  warning: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (checkMessageLegal(msg)) {
      messageInstance = ElMessage({
        type: 'warning',
        message: msg,
      });
    }
    return messageInstance;
  },
  info: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (checkMessageLegal(msg)) {
      messageInstance = ElMessage({
        type: 'info',
        message: msg,
      });
    }
    return messageInstance;
  },
  //  loading
  loading: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (checkMessageLegal(msg)) {
      messageInstance = ElMessage({
        duration: 0,
        customClass: 'download-message',
        message: msg,
      });
    }
    return messageInstance;
  },
};

const checkMessageLegal = (message: string) => {
  return message && !message?.toLocaleLowerCase()?.includes('login');
};

export default message;
