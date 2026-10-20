/*
 * @Author: liuguanqi liugq@tiansu-china.com
 * @Date: 2025-12-12 16:52:25
 * @LastEditors: liuguanqi liugq@tiansu-china.com
 * @LastEditTime: 2026-01-14 15:07:59
 * @FilePath: \ts-web-tools\packages\components\shang-mi\sm2-tool.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { sm2, sm3 } from "sm-crypto-v2";

/**
 * SM2 非对称加密工具类
 */
export class SM2Tool {
  /**
   * 生成SM2密钥对
   * @returns {Object} 公钥和私钥
   */
  static generateKeyPair() {
    const keypair = sm2.generateKeyPairHex();
    return {
      publicKey: keypair.publicKey,
      privateKey: keypair.privateKey,
    };
  }

  /**
   * SM2加密 
   * @param {string} data 待加密数据
   * @param {string} publicKey 公钥（必需）
   * @returns {string} 加密后的字符串（16进制）
   */
  static encrypt(data: string, publicKey: string) {
    try {
      if (!publicKey) {
        throw new Error("公钥不能为空");
      }
      return sm2.doEncrypt(data, publicKey, 1); // 1 表示使用C1C3C2格式
    } catch (error) {
      console.error("SM2加密失败:", error);
      throw error;
    }
  }

  /**
   * SM2解密
   * @param {string} encryptedData 加密数据
   * @param {string} privateKey 私钥（必需）
   * @returns {string} 解密后的字符串
   */
  static decrypt(encryptedData: string, privateKey: string) {
    try {
      if (!privateKey) {
        throw new Error("私钥不能为空");
      }
      return sm2.doDecrypt(encryptedData, privateKey, 1); // 1 表示使用C1C3C2格式
    } catch (error) {
      console.error("SM2解密失败:", error);
      throw error;
    }
  }

  /**
   * SM2签名
   * @param {string} data 待签名数据
   * @param {string} privateKey 私钥（必需）
   * @returns {string} 签名结果
   */
  static sign(data: string, privateKey: string) {
    try {
      if (!privateKey) {
        throw new Error("私钥不能为空");
      }
      const signData = sm3(data);
      return sm2.doSignature(signData, privateKey);
    } catch (error) {
      console.error("SM2签名失败:", error);
      throw error;
    }
  }

  /**
   * SM2验签
   * @param {string} data 原始数据
   * @param {string} sign 签名
   * @param {string} publicKey 公钥（必需）
   * @returns {boolean} 验签结果
   */
  static verify(data: string | number[], sign: string, publicKey: string) {
    try {
      if (!publicKey) {
        throw new Error("公钥不能为空");
      }
      const signData = sm3(data as any);
      return sm2.doVerifySignature(signData, sign, publicKey);
    } catch (error) {
      console.error("SM2验签失败:", error);
      return false;
    }
  }

  
}
