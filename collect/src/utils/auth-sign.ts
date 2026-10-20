/**
 * 报文加密与授权串签名
 *
 * 注意：本文件与「HTTP 请求封装」无关（那是 `src/services/http/`）。
 * 命名曾为 `request.ts`，与 services 下的 request 同名不同责，已改名避免误引。
 *
 * AES-GCM：iv(12) + 密文 拼接后 base64，密钥为 16 位 ASCII 字符串。
 */
const asmCrypto = require('asmcrypto.js');

// 生成一组随机数
const getArrayRound = (): number[] => {
  const arr = [];
  for (let i = 0; i < 12; i++) {
    const randomNum6 = Math.round(Math.random() * 128);
    arr.push(randomNum6);
  }
  return arr;
};

/**
 * 加密
 * @param data 加密字段
 * @returns 参数名对应的加密值
 */
export const FEncrypto = (data: string): string => {
  const encoder = new TextEncoder();
  const text = encoder.encode(data);
  const key = encoder.encode('yPiwWYoeTGuUTAW7');
  const iv = new Uint8Array(getArrayRound());
  // 4、加密
  const encText = asmCrypto.AES_GCM.encrypt(text, key, iv);
  // 5.将iv向量与加密后的密文（Uint8Array）相加再转换成BASE64字符串
  return asmCrypto.bytes_to_base64([...iv, ...encText]);
};

const getRandomNum = () => {
  let number = String(Math.floor(Math.random() * 10));
  if (number === '0') {
    number = getRandomNum();
  }
  return number;
};

// 随机生成六位首位非0数
export const getRandomSixNum = () => {
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
 * 生成权限校验字段
 * @returns
 */
export const FGetAuthorization = () => {
  const diffTime = Number(sessionStorage.getItem('dTimeValue')) ?? 0;
  const authorization = `${new Date().getTime() + diffTime}_${getRandomSixNum()}_${encodeURIComponent('admin')}`;
  return FEncrypto(authorization);
};
