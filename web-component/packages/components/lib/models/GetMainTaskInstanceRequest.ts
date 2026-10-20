import GetMainTaskInstanceResponse from './GetMainTaskInstanceResponse';
import Request from './Request';
export default class GetMainTaskInstanceRequest extends Request<GetMainTaskInstanceResponse> {
  //
  mainTaskId: Nullable<string>;
}
