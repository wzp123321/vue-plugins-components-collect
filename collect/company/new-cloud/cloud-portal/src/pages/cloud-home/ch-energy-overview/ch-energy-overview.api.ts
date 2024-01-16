export enum CH_EnergyQueryType {
  目标达成 = '1',
  实际节费率 = '0',
}

export enum CH_EnergyQueryUrl {
  '../../../assets/img/cloud-home/ch-energy-overview/ch-eo-actual.png',
  '../../../assets/img/cloud-home/ch-energy-overview/ch-eo-target.png',
}

export interface CH_EnergyParamType {
  queryFlag: string;
}

export interface CH_EnergyOverviewType {
  readonly rankOrder: number;
  readonly tenantName: string;
  readonly savingRate: number;
  readonly targetRate: number;
  readonly differenceRate: number;
  readonly ratioUnit: string;
}
