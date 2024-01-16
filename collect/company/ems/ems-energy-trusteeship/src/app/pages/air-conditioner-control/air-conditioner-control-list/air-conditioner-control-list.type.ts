import { ACC_EStrategyState, ACC_EStrategyType } from '../air-conditioner-control.api';

export interface QueryTodayOptimizationStrategyType {
  date: string;
  strategyDetail: StrategyDetailType[];
}

export interface StrategyDetailType {
  id: number;
  count: number;
  finished: number;
  time: string;
  type: ACC_EStrategyType;
  details: ExcutionDetailsType[];
  collapse?: boolean;
}

export interface ExcutionDetailsType {
  id: number;
  state: ACC_EStrategyState;
  content: string;
  showPopver?: boolean;
}

export interface TrategyProcessItemType {
  id: number;
  content: string;
  details: TrategyProcessDetailItemType[];
}

export interface TrategyProcessDetailItemType {
  id: number;
  time: string;
  state: ACC_EStrategyState;
}

export interface VerificationParamType {
  endTime: Date;
  startTime: Date;
}
