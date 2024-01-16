// 背景图
import EcTypeAllBg from '../../../assets/images/energy-consumption/ec-bg-type-all.png';
import EcTypeElectricityBg from '../../../assets/images/energy-consumption/ec-bg-type-electricity.png';
import EcTypeWaterBg from '../../../assets/images/energy-consumption/ec-bg-type-water.png';
import EcTypeGasBg from '../../../assets/images/energy-consumption/ec-bg-type-gas.png';
import EcTypeSteamBg from '../../../assets/images/energy-consumption/ec-bg-type-steam.png';

/**
 * 根据能源类型返回背景图
 * @param {string} code
 * @param {boolean} energyStickyFlag
 * @returns {string}
 */
export const mapBackgroundImageByEnergyCode = (code: string = '00000', energyStickyFlag: boolean): string => {
  let bgImage = EcTypeAllBg;
  switch (code) {
    case '01000':
      bgImage = EcTypeElectricityBg;
      break;
    case '02000':
      bgImage = EcTypeWaterBg;
      break;
    case '03000':
      bgImage = EcTypeGasBg;
      break;
    case '20000':
      bgImage = EcTypeSteamBg;
      break;
    case '00000':
    case '14000':
    default:
      bgImage = EcTypeAllBg;
      break;
  }
  return energyStickyFlag ? '' : `url(${bgImage})`;
};

/**
 * 判断某一个元素是否在列表中存在
 * @param list
 * @param key
 * @param value
 */
export const checkExistInList = <T>(list: T[], key: string, value: string) => {
  return list.some((item: any) => item[key] === value);
};
