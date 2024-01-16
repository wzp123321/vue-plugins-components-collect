export interface ActyalPaymentTableType {
  energyName: string;
  oneEnergyActualPaymentList: oneList[];
}

export interface oneList {
  date: string;
  actualPayment: string;
  attachmentIds: number;
  fileVOList: string | null;
}
