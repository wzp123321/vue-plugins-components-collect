import GetSubTaskInstanceResponse from './GetSubTaskInstanceResponse';
import Request from './Request';
export default class GetSubTaskInstanceRequest extends Request<GetSubTaskInstanceResponse> {
  //
  subTaskId: Nullable<string>;
}
