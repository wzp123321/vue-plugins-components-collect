import { SESSION_KEY_TIME_DIFF, SESSION_KEY_LOGIN_NAME } from '@/config/session-key';
import { AES_GCM, bytes_to_base64 } from 'asmcrypto.js';
import { FGetStorageData } from './storage';

/**
 * 生成加密串
 * @returns {string}
 */
export const FGetAuthorization = (): string => {
  const dValue = Number(FGetStorageData(SESSION_KEY_TIME_DIFF));
  const loginName = FGetStorageData(SESSION_KEY_LOGIN_NAME);
  const randomNum = getRandomSixNum();
  const authorization = `${new Date().getTime() + dValue}_${randomNum}_${loginName}`;
  console.log('%c✨✨计算重放✨✨', 'font-size: 24px', dValue, new Date().getTime(), randomNum, loginName);
  return FEncrypt(authorization);
};

/**
 * 随机生成六位首位非0数
 * @returns {string}
 */
export const getRandomSixNum = (): string => {
  let RandomSixStr = '';
  for (let i = 0; i < 6; i++) {
    if (i === 0) {
      RandomSixStr += getRandomNum();
    } else {
      RandomSixStr += String(Math.floor(Math.random() * 10));
    }
  }
  return RandomSixStr;
};

/**
 * 生成随机数
 * @returns {string}
 */
const getRandomNum = (): string => {
  let number = String(Math.floor(Math.random() * 10));
  if (number === '0') {
    number = getRandomNum();
  }
  return number;
};

/**
 * 加密
 * @param data 加密字段
 * @returns {string} 参数名对应的加密值
 */
export function FEncrypt(data: string): string {
  // 接受一个字符串作为输入，返回一个包含 UTF-8 编码的文本的 Uint8Array。
  const encoder = new TextEncoder();
  // 需要加密的明文
  const text: Uint8Array = encoder.encode(data);
  // 秘钥
  const key: Uint8Array = encoder.encode('yPiwWYoeTGuUTAW7');
  // 初始向量
  const iv = new Uint8Array(getArrayRound()); //12位的iv
  // 4、加密
  const encText = AES_GCM.encrypt(text, key, iv);
  //5.将iv向量与加密后的密文（Uint8Array）相加再转换成BASE64字符串
  return bytes_to_base64(Uint8Array.from([...iv, ...encText]));
}

/**
 * 生成一组随机数
 * @returns {number[]}
 */
function getArrayRound(): number[] {
  const arr = [];
  for (let i = 0; i < 12; i++) {
    const randomNum6 = Math.round(Math.random() * 128);
    arr.push(randomNum6);
  }
  return arr;
}
