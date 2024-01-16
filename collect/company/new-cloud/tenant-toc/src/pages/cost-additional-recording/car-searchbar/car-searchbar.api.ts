export enum CAR_EQueryType {
  运营期 = 2,
  建设期 = 1,
  实验局 = 3,
}

export interface CAR_IQueryForm {
  date: Date | null;
  queryType: number | null;
}

export interface CAR_IQueryParams {
  valueType: string;
  year: number | null;
  clickTrigger?: boolean;
}
