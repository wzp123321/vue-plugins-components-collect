import cryptoJs from 'crypto-js';
const KEY = 'TIANSU';
const IV1 = 'BASE';

/**
 * 加密
 */
const encrypt = (word: string) => {
  const key = cryptoJs.enc.Utf8.parse(KEY);
  const iv = cryptoJs.enc.Utf8.parse(IV1);
  const srcs = cryptoJs.enc.Utf8.parse(word);
  // 加密模式为CBC，补码方式为PKCS5Padding（也就是PKCS7）
  const encrypted = cryptoJs.TripleDES.encrypt(srcs, key, {
    iv,
    mode: cryptoJs.mode.CBC,
    padding: cryptoJs.pad.Pkcs7,
  });
  return cryptoJs.enc.Base64.stringify(encrypted.ciphertext); // 返回base64
};

/**
 * 解密
 */
const decrypt = (word: string) => {
  const key = cryptoJs.enc.Utf8.parse(KEY);
  const iv = cryptoJs.enc.Utf8.parse(IV1);
  const base64 = cryptoJs.enc.Base64.parse(word);
  const src = cryptoJs.enc.Base64.stringify(base64);
  // 解密模式为CBC，补码方式为PKCS5Padding（也就是PKCS7）
  const decryptStr = cryptoJs.TripleDES.decrypt(src, key, {
    iv,
    mode: cryptoJs.mode.CBC,
    padding: cryptoJs.pad.Pkcs7,
  });
  const decryptedStr = decryptStr.toString(cryptoJs.enc.Utf8);
  return decryptedStr.toString();
};

export default {
  decrypt,
  encrypt,
};
