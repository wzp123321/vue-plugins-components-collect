import PageSerializable from './PageSerializable';
export default class PageInfo<T> extends PageSerializable<T> {
  //
  pageNum: Nullable<number>;
  //
  pageSize: Nullable<number>;
  //
  size: Nullable<number>;
  //
  startRow: Nullable<number>;
  //
  endRow: Nullable<number>;
  //
  pages: Nullable<number>;
  //
  prePage: Nullable<number>;
  //
  nextPage: Nullable<number>;
  //
  isFirstPage: Nullable<boolean>;
  //
  isLastPage: Nullable<boolean>;
  //
  hasPreviousPage: Nullable<boolean>;
  //
  hasNextPage: Nullable<boolean>;
  //
  navigatePages: Nullable<number>;
  //
  navigatepageNums: Nullable<number[]>;
  //
  navigateFirstPage: Nullable<number>;
  //
  navigateLastPage: Nullable<number>;
}
