/**
 * 告警通知配置 读写 hook(闭包 state)
 * 职责:fetch/save/set 写入 + isSystemInScope / isDndActive / isSoundEnabledFor 计算
 */
import { ref, type Ref } from 'vue';
import type { AxiosInstance } from 'axios';
import { TeAlarmAffixApi } from '../api/TeAlarmAffixApi';
import {
  AlarmType,
  SwitchFlag,
  type AlarmNoticeConfigVO,
  type AppSystemCode,
} from '../api/index.api';
import { isInDndPeriod } from '../utils';

export interface UseAlarmConfigReturn {
  /** 响应式配置（容器需要 setConfig 时通过 ref 改） */
  alarmConfigData: Ref<AlarmNoticeConfigVO>;
  /** 查询配置：POST /alarm/queryAlarmInfoConfig */
  fetchConfig: () => Promise<AlarmNoticeConfigVO | null>;
  /** 保存配置：POST /alarm/saveAlarmInfoConfig（接口无返回,直接用入参 form 回填） */
  saveConfig: (form: AlarmNoticeConfigVO) => Promise<AlarmNoticeConfigVO>;
  /** 直接 set（不走接口,用于初始化回填 / 跨实例同步） */
  setConfig: (nextConfig: AlarmNoticeConfigVO) => void;
  /** 当前系统是否在 applicationScopeList 中 */
  isSystemInScope: (code: AppSystemCode) => boolean;
  /** DND 是否在生效时段 */
  isDndActive: (now?: Date) => boolean;
  /** 按 type 取告警/事件提示音开关 */
  isSoundEnabledFor: (alertType: AlarmType) => boolean;
  /** 弹窗通知总开关(popupNotificationSwitch,右下角 Toast 卡片) */
  isPopupEnabled: () => boolean;
}

export const useAlarmConfig = (
  axiosInstance: AxiosInstance,
): UseAlarmConfigReturn => {
  // 响应式配置
  const alarmConfigData = ref<AlarmNoticeConfigVO>({
    id: null,
    applicationScopeList: [],
    alarmSoundSwitch: SwitchFlag.OFF,
    eventSoundSwitch: SwitchFlag.OFF,
    popupNotificationSwitch: SwitchFlag.OFF,
    popupStayTime: 5,
    listPopupSwitch: SwitchFlag.OFF,
    subscribeAlarmLevelList: [],
    subscribeEventLevelList: [],
    subscribeSystemList: [],
    noDisturbanceSwitch: SwitchFlag.OFF,
    noDisturbanceStartTime: '',
    noDisturbanceEndTime: '',
  });
  /**
   * 直接 set 配置
   * @param nextConfig 新配置
   */
  const setConfig = (nextConfig: AlarmNoticeConfigVO) => {
    alarmConfigData.value = { ...nextConfig };
  };

  /**
   * 当前 systemCode 是否在 applicationScopeList.selected=true 中
   * - DTO.code 是小写字符串('ims' / 'ems' / 'emc' / 'entron'),与 AppSystemCode 大写做 toLowerCase 后比较
   * - 无需单独的 code 映射表
   */
  const isSystemInScope = (code: AppSystemCode): boolean => {
    const expectedCode = code.toLowerCase();
    return (
      alarmConfigData.value.applicationScopeList?.some(
        (item) => item.selected && item.code?.toLowerCase() === expectedCode,
      ) ?? false
    );
  };

  /**
   * DND 是否生效（开关开启 + 当前时间在时段内）
   * @param now
   * @returns
   */
  const isDndActive = (now: Date = new Date()): boolean => {
    if (alarmConfigData.value.noDisturbanceSwitch !== SwitchFlag.ON)
      return false;
    const { noDisturbanceStartTime, noDisturbanceEndTime } =
      alarmConfigData.value;
    if (!noDisturbanceStartTime || !noDisturbanceEndTime) return false;
    return isInDndPeriod(now, noDisturbanceStartTime, noDisturbanceEndTime);
  };

  /**
   * 按告警/事件类型取提示音开关
   *  - DTO 字段为 '0'/'1' 字符串(SwitchFlag)
   *  - 任一为 ON 即视为启用
   */
  const isSoundEnabledFor = (alertType: AlarmType): boolean => {
    const target =
      alertType === AlarmType.EVENT
        ? alarmConfigData.value.eventSoundSwitch
        : alarmConfigData.value.alarmSoundSwitch;
    return target === SwitchFlag.ON;
  };

  /**
   * 弹窗通知总开关(右下角 Toast 卡片)
   * - 读 alarmConfigData.value.popupNotificationSwitch,响应式
   * - OFF 时 dispatch 入口会跳过所有通知(Toast / TTS / pending 累加)
   * - 但 setLatestAlarm(悬浮图标) + onAutoOpenDialog(listPopup 独立开关)仍会走
   * @returns
   */
  const isPopupEnabled = (): boolean =>
    alarmConfigData.value.popupNotificationSwitch === SwitchFlag.ON;

  /**
   * 查询配置：POST /alarm/queryAlarmInfoConfig
   */
  const fetchConfig = async (): Promise<AlarmNoticeConfigVO | null> => {
    try {
      const res = await TeAlarmAffixApi.queryAlarmInfoConfig(axiosInstance);
      if (res?.success && res?.data) {
        alarmConfigData.value = res?.data;
        return res?.data;
      }
      return null;
    } catch (err) {
      console.warn('[useAlarmConfig] fetchConfig failed:', err);
      return null;
    }
  };

  /**
   * 保存:接口无返回,用入参 form 回填 state
   * 列表字段后端会按 selected 重新组装全量,下次 fetchConfig 拿全量+selected
   */
  const saveConfig = async (
    params: AlarmNoticeConfigVO,
  ): Promise<AlarmNoticeConfigVO> => {
    await TeAlarmAffixApi.saveAlarmInfoConfig(axiosInstance, params);
    alarmConfigData.value = { ...params };
    return params;
  };

  return {
    alarmConfigData,
    fetchConfig,
    saveConfig,
    setConfig,
    isSystemInScope,
    isDndActive,
    isSoundEnabledFor,
    isPopupEnabled,
  };
};
