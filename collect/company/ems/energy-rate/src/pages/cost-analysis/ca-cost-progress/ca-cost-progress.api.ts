import { CA_IStripDataVO } from '../cost-analysis.api';

// 进度条
export interface CCP_IRateVO extends CA_IStripDataVO {
  show: boolean;
  rate: number;
  color: string;
  tooltipLabel: string;
  arrowLeft: number;
  bodyLeft: number;
}
// 图例
export interface CCP_ILegendVO extends CA_IStripDataVO {
  color: string;
}
