import CryptoJS from 'crypto-js';

// 此处key为16进制
const key = CryptoJS.enc.Utf8.parse('385f33cb91484b04a177828829081ab7');

// 偏移量长度为16位, 注：偏移量需要与后端定义好，保证一致
let iv = '37fa77f6a3b0462d';
iv = CryptoJS.enc.Utf8.parse('37fa77f6a3b0462d');

// 加密方法
const encrypt = (text: string) => {
  const encryptedContent = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encryptedContent.ciphertext.toString();
};

// 解密方法
const decrypt = (text: string) => {
  const decryptedContent = CryptoJS.AES.decrypt(CryptoJS.format.Hex.parse(text), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  if (!CryptoJS.enc.Utf8.stringify(decryptedContent)) {
    throw new Error('非加密文本，请检查输入正确');
  }
  return CryptoJS.enc.Utf8.stringify(decryptedContent);
};

export default {
  encrypt,
  decrypt,
};
