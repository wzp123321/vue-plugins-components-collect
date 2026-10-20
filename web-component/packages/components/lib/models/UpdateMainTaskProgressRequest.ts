import Request from './Request';
import UpdateMainTaskProgressResponse from './UpdateMainTaskProgressResponse';
export default class UpdateMainTaskProgressRequest extends Request<UpdateMainTaskProgressResponse> {
  //
  mainTaskId: Nullable<string>;
  //
  taskProgress: Nullable<string>;
}
