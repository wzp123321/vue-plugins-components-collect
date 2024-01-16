export * from './converter';

export type TDeepReadonly<T> = {
  readonly [K in keyof T]: TDeepReadonly<T[K]>;
};
