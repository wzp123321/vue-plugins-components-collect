import CreateSubTaskInstancesResponse from './CreateSubTaskInstancesResponse';
import Request from './Request';
import SubTaskInstance from './SubTaskInstance';
export default class CreateSubTaskInstancesRequest extends Request<CreateSubTaskInstancesResponse> {
  //
  mainTaskId: Nullable<string>;
  //
  subTaskInstances: Nullable<SubTaskInstance[]>;
}
