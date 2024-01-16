import type { Common_IErrorTitle } from '@/api/model';
import { Common_EErrorCode, Common_ENetworkType, Common_EPageErrorType } from '@/config/enum';
import { reactive, ref } from 'vue';

/**
 * 控制页面缺省处理
 * @returns
 */
export const usePageErrorController = () => {
  // 状态
  const pageStatus = ref(Common_EPageErrorType.正常加载);
  // 异常提示语
  const errorTitle = reactive<Common_IErrorTitle>({
    title: '',
    subTitle: '',
  });
  // 修改页面状态
  const setPageStatus = (status: Common_EPageErrorType) => {
    pageStatus.value = status;
    switch (status) {
      case Common_EPageErrorType.没有配置能耗类型列表:
        errorTitle.title = '未配置有效的能源类型';
        errorTitle.subTitle = '请先到分类分项管理界面配置有效的能源类型';
        break;
      case Common_EPageErrorType.当前能源类型没有配置该节点:
        errorTitle.title = '未配置此能源类型';
        errorTitle.subTitle = '当前及下级节点未绑定此能源类型的设备点位';
        break;
      case Common_EPageErrorType.配置正常但是没有数据:
        errorTitle.title = '未配置此能源类型';
        errorTitle.subTitle = '当前及下级节点未绑定此能源类型的设备点位';
        break;
      case Common_EPageErrorType.没有关联设备:
        errorTitle.title = '当前节点未绑定此能源类型的设备点位';
        errorTitle.subTitle = '';
        break;
    }
  };
  // 页面正常
  const mapPageNormal = () => {
    return pageStatus.value === Common_EPageErrorType.正常加载;
  };
  // 网络异常
  const mapPageNetworkError = () => {
    return pageStatus.value === Common_EPageErrorType.网络异常;
  };
  /**
   * 监听网络状态
   * @returns {void}
   */
  const onWatchNetworkStatus = (callBack: () => void): void => {
    uni.onNetworkStatusChange((res) => {
      console.log('%c✨✨监听网络变化✨✨', 'font-size: 24px', res);
      pageStatus.value = Common_EPageErrorType.正常加载;
      // 如果断开连接或者无网络
      if (!res.isConnected || res.networkType === Common_ENetworkType.无网络) {
        pageStatus.value = Common_EPageErrorType.网络异常;
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
  // 加载失败
  const mapPageLoadError = () => {
    return pageStatus.value === Common_EPageErrorType.加载失败;
  };
  // 没有权限
  const mapPageNoPermission = () => {
    return pageStatus.value === Common_EPageErrorType.没有树节点权限;
  };
  // 没有配置树模型
  const mapPageAreaTreeEmpty = () => {
    return pageStatus.value === Common_EPageErrorType.没有配置区域树列表;
  };
  // 没有树模型
  const mapPageNoTree = () => {
    return pageStatus.value === Common_EPageErrorType.没有配置树节点;
  };
  // 没有配置能源类型
  const mapPageEnergyEmpty = () => {
    return pageStatus.value === Common_EPageErrorType.没有配置能耗类型列表;
  };
  // 能源类型没有绑定该节点
  const mapPageTreeUnBindEnergy = () => {
    return pageStatus.value === Common_EPageErrorType.当前能源类型没有配置该节点;
  };
  // 数据为空
  const mapPageDataEmpty = () => {
    return pageStatus.value === Common_EPageErrorType.配置正常但是没有数据;
  };
  // 没有关联设备
  const mapPageNoRelationDevice = () => {
    return pageStatus.value === Common_EPageErrorType.没有关联设备;
  };
  // 处理状态码
  const handleErrorCode = (code: string) => {
    switch (code) {
      case Common_EErrorCode.能源类型不存在:
        setPageStatus(Common_EPageErrorType.没有配置能耗类型列表);
        break;
      case Common_EErrorCode.区域树不存在:
        setPageStatus(Common_EPageErrorType.没有配置区域树列表);
        break;
      case Common_EErrorCode.树模型不存在:
        setPageStatus(Common_EPageErrorType.没有配置树节点);
        break;
      case Common_EErrorCode.用户所属角色未配置树节点权限:
        setPageStatus(Common_EPageErrorType.当前能源类型没有配置该节点);
        break;
      case Common_EErrorCode.用户所属角色未配置树类型权限:
        setPageStatus(Common_EPageErrorType.没有树节点权限);
        break;
      case Common_EErrorCode.操作失败:
      default:
        setPageStatus(Common_EPageErrorType.加载失败);
        break;
    }
  };

  return {
    pageStatus,
    errorTitle,
    mapPageNoTree,
    setPageStatus,
    mapPageNormal,
    mapPageNetworkError,
    onWatchNetworkStatus,
    offWatchNetworkStatus,
    mapPageLoadError,
    mapPageNoPermission,
    mapPageAreaTreeEmpty,
    mapPageEnergyEmpty,
    mapPageTreeUnBindEnergy,
    mapPageDataEmpty,
    mapPageNoRelationDevice,
    handleErrorCode,
  };
};
