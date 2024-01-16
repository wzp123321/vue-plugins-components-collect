export interface ITaskFeedBackInfo {
  dailyWorkId: Number;
  beginTime?: String;
  endTime?: String;
  measureName: String;
  description: String;
}
export interface ITaskFeedBackParam {
  dailyWorkId: Number;
  remarks: String;
  attachList: number[];
}
export interface ITaskFeedBackData {
  readonly isAllFinished: boolean;
}

export interface upladImageType {
  fileId: number;
  fileName?: string;
  fileUrl: string;
  imgFlag?: true;
  addrUrl?: string;
}
