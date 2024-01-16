import { Common_EEnergyCode } from '@/config/enum';
// 背景图
import EcTypeAllBg from '../../../assets/images/energy-analysis/ea-bg-type-all.png';
import EcTypeCommonBg from '../../../assets/images/energy-analysis/ea-bg-type-common.png';
import EcTypeElectricityBg from '../../../assets/images/energy-analysis/ea-bg-type-electricity.png';
import EcTypeWaterBg from '../../../assets/images/energy-analysis/ea-bg-type-water.png';
import EcTypeGasBg from '../../../assets/images/energy-analysis/ea-bg-type-gas.png';
import EcTypeSteamBg from '../../../assets/images/energy-analysis/ea-bg-type-steam.png';
// 图标图
import EcTypeAllIcon from '../../../assets/images/energy-analysis/ea-icon-type-all.svg';
import EcTypeElectricityIcon from '../../../assets/images/energy-analysis/ea-icon-type-electricity.svg';
import EcTypeWaterIcon from '../../../assets/images/energy-analysis/ea-icon-type-water.svg';
import EcTypeGasIcon from '../../../assets/images/energy-analysis/ea-icon-type-gas.svg';
import EcTypeSteamIcon from '../../../assets/images/energy-analysis/ea-icon-type-steam.svg';

/**
 * 根据能源类型返回背景图
 * @param {string} code
 * @returns {string}
 */
export const mapEnergyAnalysisBgImage = (code: string): string => {
  let bgImage = EcTypeAllBg;
  switch (code) {
    case Common_EEnergyCode.电:
      bgImage = EcTypeElectricityBg;
      break;
    case Common_EEnergyCode.水:
      bgImage = EcTypeWaterBg;
      break;
    case Common_EEnergyCode.燃气:
      bgImage = EcTypeGasBg;
      break;
    case Common_EEnergyCode.蒸汽:
      bgImage = EcTypeSteamBg;
      break;
    case Common_EEnergyCode.总能耗:
      bgImage = EcTypeAllBg;
      break;
    default:
      bgImage = EcTypeCommonBg;
      break;
  }
  return `url(${bgImage})`;
};

/**
 * 根据能源类型返回图标
 * @param {string} code
 * @returns {string}
 */
export const mapEnergyAnalysisIconImage = (code: string): string => {
  let iconImage = EcTypeAllIcon;
  switch (code) {
    case Common_EEnergyCode.电:
      iconImage = EcTypeElectricityIcon;
      break;
    case Common_EEnergyCode.水:
      iconImage = EcTypeWaterIcon;
      break;
    case Common_EEnergyCode.燃气:
      iconImage = EcTypeGasIcon;
      break;
    case Common_EEnergyCode.蒸汽:
      iconImage = EcTypeSteamIcon;
      break;
    case Common_EEnergyCode.总能耗:
      iconImage = EcTypeAllIcon;
      break;
  }
  return iconImage;
};
