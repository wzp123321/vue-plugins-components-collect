import { ref } from 'vue';
import { Common_ENetworkType } from '@/config/enum';

export const useNetwork = () => {
  // 网络异常
  const networkErrorFlag = ref<boolean>(false);
  /**
   * 监听网络状态
   * @returns {void}
   */
  const onWatchNetworkStatus = (callBack: () => void): void => {
    uni.onNetworkStatusChange((res) => {
      console.log('%c✨✨监听网络变化✨✨', 'font-size: 24px', res);
      networkErrorFlag.value = false;
      // 如果断开连接或者无网络
      if (!res.isConnected || res.networkType === Common_ENetworkType.无网络) {
        networkErrorFlag.value = true;
      }
      callBack();
    });
  };
  /**
   * 关闭监听网络变化
   */
  const offWatchNetworkStatus = () => {
    uni.offNetworkStatusChange(() => {
      console.log('%c✨✨关闭监听网络变化✨✨', 'font-size: 24px');
    });
  };

  return {
    networkErrorFlag,
    onWatchNetworkStatus,
    offWatchNetworkStatus,
  };
};
