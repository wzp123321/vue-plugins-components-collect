import { TeMessage } from '@tiansu/element-plus';
import type { MessageHandler } from '@tiansu/element-plus';

let messageInstance: MessageHandler;

const checkMessageLegal = (message: string) =>
  message && !message?.toLocaleLowerCase()?.includes('login');

export const message = {
  success: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (checkMessageLegal(msg)) {
      messageInstance = TeMessage({
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
      messageInstance = TeMessage({
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
      messageInstance = TeMessage({
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
      messageInstance = TeMessage({
        type: 'info',
        message: msg,
      });
    }
    return messageInstance;
  },

  loading: (msg: string) => {
    if (messageInstance) {
      messageInstance.close();
    }
    if (checkMessageLegal(msg)) {
      messageInstance = TeMessage({
        duration: 0,
        customClass: 'download-message',
        message: msg,
      });
    }
    return messageInstance;
  },
  closeAll: () => {
    TeMessage.closeAll();
  },
};
