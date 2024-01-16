import { PARAM_TYPES, AddDeviceDTO } from '../ra-node-parameter-manage/ra-node-parameter-manage.api';
import { AssociateDeviceDetail } from '../relation-analysis.api';
import store from '@/store/index';
import { openBlankUrl } from '@/utils/index';

// 时间颗粒度
export const timeUnits = [
  {
    label: '10分钟',
    value: '10m',
  },
  {
    label: '小时',
    value: '1h',
  },
  {
    label: '天',
    value: '1d',
  },
  {
    label: '月',
    value: '1M',
  },
];
// 处理表格显示时间颗粒度
export const resetTimeUnit = (value: string) => {
  let cValue = '';
  timeUnits.forEach((item) => {
    if (value.indexOf(item.value) !== -1) {
      cValue += item.label + ',';
    }
  });
  cValue = cValue.substring(0, cValue.length - 1);
  return cValue;
};

// 上午禁用时间
export const onMorningDisable = (time: Date, x: any) => {
  return [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
};
// 下午禁用时间
export const onAfternoonDisable = () => {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20, 21, 22, 23, 24];
};

// 晚上禁用时间
export const onEveningDisable = () => {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
};

// 处理编辑时的时间
export const calculateDate = (dateStr: string) => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const hour = Number(dateStr.split(':')[0]);
  const min = Number(dateStr.split(':')[1]);
  return new Date(year, month, day, hour, min);
};

// 全局参数& 节点参数 跳转关联设备页面
export const onPageTo = (
  paramId: number,
  paramType: number,
  paramName: string,
  timeTypes: string,
  standardPointCode: string,
  treeMap: { [key: number]: { treeIds: number; treeNames: string[] }[] },
) => {
  let url = '';

  let treeId = 0;
  if (treeMap && Object.keys(treeMap).length) {
    Object.keys(treeMap).forEach((item) => {
      if (treeMap[item] && treeMap[item].treeIds.length && treeId === 0) {
        treeId = treeMap[item].treeIds[0];
      }
    });
  }
  switch (paramType) {
    case PARAM_TYPES.MANUAL_ENTRY:
    case PARAM_TYPES.SINGLE_DATA:
    case PARAM_TYPES.ARITHMETIC_MEAN:
    case PARAM_TYPES.DATA_DIFFERENCE:
    case PARAM_TYPES.DATE_DIFFERENCE:
      setSessionStorage('paramId', String(paramId));
      setSessionStorage('paramName', String(paramName));
      setSessionStorage('timeTypes', String(timeTypes));
      setSessionStorage('paramType', String(paramType));
      url = '/dataEntry';
      break;
    default:
      setSessionStorage('paramId', String(paramId));
      setSessionStorage('paramName', String(paramName));
      setSessionStorage('timeTypes', String(timeTypes));
      setSessionStorage('paramType', String(paramType));
      url = '/dataEntry';
      break;
  }
  openBlankUrl(url);
};

// 存session
export const setSessionStorage = (key: string, value: string) => {
  const tenantCode = store.getters.tenantCode;
  window.sessionStorage.setItem(`${key}-${tenantCode}`, value);
};

// 取session
export const getSessionStorage = (key: string) => {
  const tenantCode = store.getters.tenantCode;
  return window.sessionStorage.getItem(`${key}-${tenantCode}`);
};

/**
 * 拼接关联设备参数
 * @param list
 * @param value
 * @returns
 */
export const getRelationDeviceParams = (list: AssociateDeviceDetail[], value: string) => {
  let deviceParams: AddDeviceDTO = {
    deviceId: 0,
    deviceName: '',
    pointName: '',
    pointNumber: 0,
  };
  if (value) {
    list.forEach((item) => {
      if (`${item.deviceId}_${item.pointNumber}` === value) {
        const { deviceId, deviceName, pointNumber, pointName } = item;
        deviceParams = { deviceId, deviceName, pointNumber, pointName };
      }
    });
  }
  return deviceParams;
};
