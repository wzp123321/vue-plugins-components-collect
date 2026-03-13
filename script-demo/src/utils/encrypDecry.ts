import { Base64 } from 'js-base64';
import * as asmcrypto from 'asmcrypto.js';
import { getEnvValue } from '@/utils/common';

// const KEY = 'zM7tjKG65CnGKiuavhWF/w=='; // 默认
// // const KEY = 'MTExMTExMTExMTExMTExMQ=='; // 十六个1
// const KEY = 'TnRzQDEyMzROdHNAMTIzNA==';

/**
 * 生成一组随机数
 */
export const getArrayRound = () => {
  const arr: any = [];
  for (let i = 0; i < 12; i++) {
    const randomNum6 = Math.round(Math.random() * 128);
    arr.push(randomNum6);
  }
  return arr;
};
/**
 * uint8array转base64
 */
export const transformUint8ArrayToBase64 = (array: Uint8Array | number[]) => {
  let binary = '';
  for (let len = (array as Uint8Array).byteLength, i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return window.btoa(binary).replace(/=/g, '');
};

/**
 * AES_GCM加密
 */
export const encryptGcm = (content?: string) => {
  if (!content) {
    return content;
  }
  // 1、将text装换成BASE64编码
  // eslint-disable-next-line camelcase
  const text_btoa = Base64.encodeURI(content);
  // 2、将BASE64字符串转换成Uint8Array
  const text = asmcrypto.base64_to_bytes(text_btoa);
  // 3、秘钥字符串转换成Uint8Array
  const key = asmcrypto.base64_to_bytes(
    getEnvValue('VITE_APP_KEY') || '5IfWmyH1UnCEW3qh+m21mA==',
  );
  // 4、生成一组随机数并转换成Uint8Array
  const arrayRound = getArrayRound();
  const nonce = new Uint8Array(arrayRound);
  // 5、将加密后的密文（Uint8Array）转换成BASE64字符串
  let encText = asmcrypto.AES_GCM.encrypt(text, key, nonce);
  encText = new Uint8Array(arrayRound.concat(Array.from(encText)));
  const cipherText = asmcrypto.bytes_to_base64(encText);
  return cipherText;
};

/**
 * AES_GCM解密
 */
export const decryptGcm = (content?: string) => {
  if (!content) {
    return content;
  }
  try {
    // 1、秘钥字符串转换成Uint8Array
    const key = asmcrypto.base64_to_bytes(
      getEnvValue('VITE_APP_KEY') || '5IfWmyH1UnCEW3qh+m21mA==',
    );
    // 2、将BASE64字符串转换成Uint8Array
    const text = asmcrypto.base64_to_bytes(content);
    // 3、取步骤2前12位作为nonce
    const arrayText = Array.from(text).slice(0, 12);
    const nonce = new Uint8Array(arrayText);
    // 4、去除步骤2前12位作为密文
    const sliceText = Array.from(text).slice(12);
    // 5、将解密后的明文（Uint8Array）转换成BASE64字符串
    const realText = asmcrypto.AES_GCM.decrypt(
      new Uint8Array(sliceText),
      key,
      nonce,
    );
    return Base64.decode(transformUint8ArrayToBase64(realText));
  } catch (error) {
    console.log(error);
    return content;
  }
};
