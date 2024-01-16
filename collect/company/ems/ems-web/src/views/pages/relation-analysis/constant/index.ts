import store from '@/store/index';
const theme = store.getters.theme || 'light';

// 关联系数类型
export const relationTypes = [
  {
    label: '极高相关',
    value: '1',
  },
  {
    label: '高度相关',
    value: '2',
  },
];

export enum PARAM_TYPE {
  WIND_SPEED = 'windSpeed', // 风速
  CLINIC_COUNT = 'clinicCount', // 门诊量
  TIME_TABLE = 'timeTable', // 作息时间
  ILLUMINANCE = 'illuminance', // 照度
  HUMIDITY = 'humidity', // 湿度
  PEDESTRIAN_VOLUME = 'pedestrianVolume', // 人流量
  TEMPERATURE = 'temperature', // 温度
}

const boxShadow = '0px 2px 10px 0px rgba(0, 0, 0, 0.07)'; // 阴影

const analysisConstant = {
  light: {
    contentDefaultBgColor: 'rgb(255, 255, 255)',
    descriptionDefaultbgColor: 'rgba(250, 250, 250, 1)', // 描述模块默认背景色
    default: {
      CARD_BACKGROUND_COLOR: ' rgba(0, 165, 178, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(250, 250, 250, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(201, 239, 242, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(0, 165, 178, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-default.png'),
    },
    // 风速
    windSpeed: {
      CARD_BACKGROUND_COLOR: 'rgba(24, 144, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: ' rgba(215, 237, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(235, 234, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(70, 61, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-wind-speed.svg'),
    },
    // 门诊量
    clinicCount: {
      CARD_BACKGROUND_COLOR: 'rgba(169, 63, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(242, 225, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(242, 225, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(169, 63, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-clinic-count.svg'),
    },
    // 作息时间
    timeTable: {
      CARD_BACKGROUND_COLOR: 'rgba(0, 178, 97, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(219, 243, 232, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(212, 247, 231, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(0, 178, 97, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-timetable.svg'),
    },
    // 照度
    illuminance: {
      CARD_BACKGROUND_COLOR: 'rgba(255, 203, 32, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: ' rgba(255, 247, 220, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(255, 244, 206, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(255, 203, 32, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-illuminance.svg'),
    },
    // 湿度
    humidity: {
      CARD_BACKGROUND_COLOR: 'rgba(255, 145, 32, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(255, 241, 226, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(255, 234, 213, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(255, 145, 32, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-humidity.svg'),
    },
    // 人流量
    pedestrianVolume: {
      CARD_BACKGROUND_COLOR: 'rgba(70, 61, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(230, 234, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(235, 234, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(70, 61, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-pedestrian-volume.svg'),
    },
    // 温度
    temperature: {
      CARD_BACKGROUND_COLOR: 'rgba(24, 144, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(215, 237, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(215, 237, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(54, 129, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-temperature.svg'),
    },
  },
  dark: {
    contentDefaultBgColor: 'rgb(255, 255, 255)',
    descriptionDefaultbgColor: ' rgba(250, 250, 250, 1)', // 描述模块默认背景色
    // 风速
    windSpeed: {
      CARD_BACKGROUND_COLOR: 'rgba(24, 144, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: ' rgba(215, 237, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(235, 234, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(70, 61, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-wind-speed.svg'),
    },
    // 门诊量
    clinicCount: {
      CARD_BACKGROUND_COLOR: 'rgba(169, 63, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: '  rgba(242, 225, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(242, 225, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(169, 63, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-clinic-count.svg'),
    },
    // 作息时间
    timeTable: {
      CARD_BACKGROUND_COLOR: 'rgba(0, 178, 97, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(219, 243, 232, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(212, 247, 231, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(0, 178, 97, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-timetable.svg'),
    },
    // 照度
    illuminance: {
      CARD_BACKGROUND_COLOR: 'rgba(255, 203, 32, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: ' rgba(255, 247, 220, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(255, 244, 206, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(255, 203, 32, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-illuminance.svg'),
    },
    // 湿度
    humidity: {
      CARD_BACKGROUND_COLOR: 'rgba(255, 145, 32, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(255, 241, 226, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(255, 234, 213, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(255, 145, 32, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-humidity.svg'),
    },
    // 人流量
    pedestrianVolume: {
      CARD_BACKGROUND_COLOR: 'rgba(70, 61, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(230, 234, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(235, 234, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(70, 61, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-pedestrian-volume.svg'),
    },
    // 温度
    temperature: {
      CARD_BACKGROUND_COLOR: 'rgba(24, 144, 255, 0.06)', // 卡片背景色
      DESCRIPTION_BACKGROUND_COLOR: 'rgba(215, 237, 255, 1)', // 描述背景色
      UNFILL_BACKGROUND_COLOR: 'rgba(215, 237, 255, 1)',
      FILL_BACKGROUND_COLOR: 'rgba(54, 129, 255, 1)',
      ICON_IMG: require('../../../../assets/img/relation-analysis/ra-temperature.svg'),
    },
  },
};

export default { ...analysisConstant[theme], boxShadow };
