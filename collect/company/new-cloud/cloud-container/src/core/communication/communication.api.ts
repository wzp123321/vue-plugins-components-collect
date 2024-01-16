export interface IRes<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}
