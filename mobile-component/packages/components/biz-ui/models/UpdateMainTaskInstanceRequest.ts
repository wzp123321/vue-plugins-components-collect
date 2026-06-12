import Request from './Request';
import UpdateMainTaskInstanceResponse from './UpdateMainTaskInstanceResponse';
export default class UpdateMainTaskInstanceRequest extends Request<UpdateMainTaskInstanceResponse> {
  //
  mainTaskId: Nullable<string>;
  //
  bizTaskName: Nullable<string>;
  //
  bizKey: Nullable<string>;
  //
  bizQuery: Nullable<string>;
  //
  subTotalCount: Nullable<number>;
  //
  subFinishedCount: Nullable<number>;
  //
  subSuccessCount: Nullable<number>;
  //
  subFailedCount: Nullable<number>;
  //
  dataTotalCount: Nullable<number>;
  //
  dataProcessedCount: Nullable<number>;
  //
  dataSuccessCount: Nullable<number>;
  //
  dataFailedCount: Nullable<number>;
  //
  gmtStart: Nullable<Date>;
  //
  gmtDispatch: Nullable<Date>;
  //
  gmtExecute: Nullable<Date>;
  //
  gmtFinished: Nullable<Date>;
  //
  gmtExpired: Nullable<Date>;
  //
  retryTimes: Nullable<number>;
  //
  resultCode: Nullable<string>;
  //
  resultMessage: Nullable<string>;
  //
  log: Nullable<string>;
  //
  status: Nullable<string>;
  //
  runtimeParam: Nullable<string>;
  //
  feature: Nullable<string>;
  //
  taskProgress: Nullable<string>;
}
