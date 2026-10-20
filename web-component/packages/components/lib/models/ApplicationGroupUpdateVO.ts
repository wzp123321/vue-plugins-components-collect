import LocalDateTime from './LocalDateTime';
export default class ApplicationGroupUpdateVO {
  //
  id: Nullable<string>;
  //
  tenantId: Nullable<string>;
  //
  groupId: Nullable<string>;
  //
  appInstanceId: Nullable<string>;
  //
  updateTime: Nullable<LocalDateTime>;
}
