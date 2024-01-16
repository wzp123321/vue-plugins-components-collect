export enum TIME_TYPE {
  YEAR = 2,
  MONTH = 1,
}

export const timeTypes = [
  {
    value: TIME_TYPE.MONTH,
    label: '月',
  },
  {
    value: TIME_TYPE.YEAR,
    label: '年',
  },
];

// 建筑类型
export const getBuildingAvatar = (type: string) => {
  let imgUrl = '';
  switch (type) {
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
      imgUrl = 'ba-outpatient-emergency.svg';
      break;
    case '7':
    case '8':
      imgUrl = 'ba-logistics-work.svg';
      break;
    case '9':
    case '10':
      imgUrl = 'ba-other-architecture.svg';
      break;
    case '11':
    case '12':
    case '13':
    case '14':
      imgUrl = 'ba-sewage-disposal.svg';
      break;
    case '15':
      imgUrl = 'ba-other-synthesis-architecture.svg';
      break;
    default:
      imgUrl = 'ba-other-synthesis-architecture.svg';
      break;
  }
  return imgUrl;
};
