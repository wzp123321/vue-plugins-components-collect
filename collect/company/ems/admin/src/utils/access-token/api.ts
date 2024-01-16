export const APP_ID = 'energy-ems';

export const ASSESS_TOKEN_BASE_PATH = '/gateway/v1';

export enum APATH {
  share = '/auth/share',
  authorize = '/auth/authorize',
}

export const ASSESS_TOKEN_GATEWAY_FORBIDDEN_CODE = '4f000002';

export interface ASSESS_TOKEN_Res {
  data: string;
  errcode: string;
  errmsg: string;
  secretFields: string;
}

export interface ASSESS_DecryptShareRes {
  shareKey: string; //握手秘钥
  shareId: string; //握手标识
  randomAESBase64Key: string; //后台签发的aes动态秘钥与shareId一一对应
}
