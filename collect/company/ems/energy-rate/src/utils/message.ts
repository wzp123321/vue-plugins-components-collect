/*
 * @Description: 消息提示
 * @Autor: zpwan
 * @Date: 2022-03-17 16:07:50
 * @LastEditors: wanzp
 * @LastEditTime: 2023-07-31 10:51:57
 */
import { TeMessage } from '@tiansu/element-plus';
let messageInstance: any;

const message = {
  success: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = TeMessage({
      type: 'success',
      message: msg,
    });
    return messageInstance;
  },
  error: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = TeMessage({
      type: 'error',
      message: msg,
    });
    return messageInstance;
  },
  warning: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = TeMessage({
      type: 'warning',
      message: msg,
    });
    return messageInstance;
  },
  info: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = TeMessage({
      type: 'info',
      message: msg,
    });
    return messageInstance;
  },
  //  loading
  loading: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    messageInstance = TeMessage({
      duration: 0,
      customClass: 'download-message',
      message: msg,
    });
    return messageInstance;
  },
};

export default message;
