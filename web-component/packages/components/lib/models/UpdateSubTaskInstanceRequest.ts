import Request from './Request';
import UpdateSubTaskInstanceResponse from './UpdateSubTaskInstanceResponse';
export default class UpdateSubTaskInstanceRequest extends Request<UpdateSubTaskInstanceResponse> {
  //
  subTaskId: Nullable<string>;
  //
  dataTotalCount: Nullable<number>;
  //
  dataProcessedCount: Nullable<number>;
  //
  dataSuccessCount: Nullable<number>;
  //
  dataFailedCount: Nullable<number>;
  //
  status: Nullable<string>;
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
  traceId: Nullable<string>;
  //
  retryTimes: Nullable<number>;
  //
  resultCode: Nullable<string>;
  //
  resultMessage: Nullable<string>;
  //
  host: Nullable<string>;
  //
  log: Nullable<string>;
  //
  feature: Nullable<string>;
  //
  runtimeParam: Nullable<string>;
}
