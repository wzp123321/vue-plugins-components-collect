import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse("NANJINTTIANSU123"); //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse("123NANJINTTIANSU"); //十六位十六进制数作为密钥偏移量

/**
 * @description 加密
 * @param {string} word  加密的明文
 * @returns {string} 加密之后的密文
 */
export const encrypt = (word: string) => {
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString().toUpperCase();
};

/**
 * @description 解密
 * @param {string}  word 解密的密文
 * @returns {string}  解密之后的明文
 */
export const decrypt = (word: string) => {
  const encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  const decrypt = CryptoJS.AES.decrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
};
