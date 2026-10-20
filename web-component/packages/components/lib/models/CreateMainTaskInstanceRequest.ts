import CreateMainTaskInstanceResponse from './CreateMainTaskInstanceResponse';
import Request from './Request';
export default class CreateMainTaskInstanceRequest extends Request<CreateMainTaskInstanceResponse> {
  //
  mainTaskId: Nullable<string>;
  //
  code: Nullable<string>;
  //
  name: Nullable<string>;
  //
  type: Nullable<string>;
  //
  executeType: Nullable<string>;
  //
  bizTaskName: Nullable<string>;
  //
  bizKey: Nullable<string>;
  //
  bizQuery: Nullable<string>;
  //
  bizUserId: Nullable<string>;
  //
  bizUserName: Nullable<string>;
  //
  bizUserTenant: Nullable<string>;
  //
  bizUserOrg: Nullable<string>;
  //
  bizUserKey: Nullable<string>;
  //
  bizUserFeature: Nullable<string>;
  //
  traceId: Nullable<string>;
  //
  host: Nullable<string>;
  //
  runtimeParam: Nullable<string>;
  //
  feature: Nullable<string>;
}
