export const enum CC_EJumpType {
  cloud, // 云端本地跳转
  terminal, // 端侧跳转
}

export interface CC_ITerminalParam {
  readonly sourceValue?: '1';
  readonly token?: string;
  readonly loginName: string;
}
