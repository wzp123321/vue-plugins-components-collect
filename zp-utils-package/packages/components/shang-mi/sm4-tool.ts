import { sm4 } from "sm-crypto-v2";

/**
 * SM4 对称加密工具类
 */
export class SM4Tool {
  /**
   * SM4 GCM加密 
   * @param plainString 加密文本
   * @param encryptionKey 秘钥字符串 长度16
   * @returns 加密后的16进制字符串
   */
  public static encrypt = (plainString: string, encryptionKey: string) => {
    if (encryptionKey.length !== 16) {
      throw new Error("秘钥字符串长度为16字节");
    }
    const unit8key = this.stringToUint8Array(encryptionKey); //16 进制串或字节数组
    const unit8Iv = this.stringToUint8Array(this.generateRandomString(12));
    const encryptResult = sm4.encrypt(plainString, unit8key, {
      mode: "gcm",
      iv: unit8Iv,
      output: "array",
      padding: "none",
      outputTag: true,
    });
    return this.mergeAndToHexString(
      unit8Iv,
      encryptResult.output,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      encryptResult.tag!,
    );
  };
  /**
   * SM4 GCM解密 (跟平台的一样)
   * @param cipherString 密文 包括了IV和tag 16进制
   * @param key 秘钥字符串 不是16进制
   * @returns 解密后的字符串
   */
  public static decrypt = (cipherString: string, encryptionKey: string) => {
    try {
      if (encryptionKey.length !== 16) {
        throw new Error("秘钥字符串长度为16字节");
      }
      const { iv, chipper, tag } = this.hexStringToChipperArray(cipherString);
      const unit8key = this.stringToUint8Array(encryptionKey);
      return sm4.decrypt(chipper, unit8key, {
        mode: "gcm",
        iv: iv,
        output: "string",
        padding: "none",
        tag: tag,
      });
    } catch (error) {
      console.log("解密失败", error);
      return "";
    }
  };

  public static generateRandomString = (length: number) => {
    const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  };

  public static hexStringToChipperArray = (hex: string) => {
    const arr = this.hexStringToArray(hex);
    if (arr.length < 12 + 16) {
      throw new Error(
        "Array length must be at least 28 bytes (12 for IV + 16 for tag)",
      );
    }
    const iv = arr.slice(0, 12);
    const tag = arr.slice(-16);
    const chipper = arr.slice(12, -16);
    return {
      iv: iv,
      chipper: chipper,
      tag: tag,
    };
  };

  public static hexStringToArray = (hex: string) => {
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      arr[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return arr;
  };

  public static stringToUint8Array = (str: string) => {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i);
    }
    return arr;
  };
  /**
   * 生成随机SM4密钥
   * @returns {string} 16字节的16进制密钥
   */
  static generateKey() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  public static mergeAndToHexString = (
    iv: Uint8Array,
    encrypted: Uint8Array,
    tag: Uint8Array,
  ) => {
    // 合并两个 Uint8Array
    const merged = new Uint8Array(iv.length + encrypted.length + tag.length);
    merged.set(iv);
    merged.set(encrypted, iv.length);
    merged.set(tag, iv.length + encrypted.length);
    // 转为 Hex 字符串
    return Array.from(merged)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  public static gcmIVToUint8Array(hexIV: string): Uint8Array {
    // 清理输入
    const cleanHex = hexIV.replace(/^0x|\s|:/g, "").toLowerCase();

    // 验证：GCM IV通常为12字节（24字符）
    if (cleanHex.length !== 24) {
      console.warn(
        `警告：GCM IV推荐为12字节（24字符），当前为${cleanHex.length / 2}字节`,
      );
    }

    // 验证十六进制格式
    if (!/^[0-9a-f]+$/.test(cleanHex)) {
      throw new Error("无效的十六进制IV");
    }

    if (cleanHex.length % 2 !== 0) {
      throw new Error("IV长度必须为偶数");
    }

    const byteCount = cleanHex.length / 2;
    const ivBytes = new Uint8Array(byteCount);

    for (let i = 0; i < byteCount; i++) {
      const byteHex = cleanHex.substr(i * 2, 2);
      ivBytes[i] = parseInt(byteHex, 16);
    }

    return ivBytes;
  }

  /**
   * SM4 ECB模式加密
   * @param {string} data 待加密数据
   * @param {string} key 密钥（16字节的16进制字符串，例如："0123456789abcdeffedcba9876543210"）
   * @returns {string} 加密后的16进制字符串
   */
  static encryptECB(data: string, key: string) {
    try {
      if (!key || key.length !== 32) {
        throw new Error("密钥必须是16字节的16进制字符串（32个字符）");
      }
      return sm4.encrypt(data, key);
    } catch (error) {
      console.error("SM4 ECB加密失败:", error);
      throw error;
    }
  }

  /**
   * SM4 ECB模式解密
   * @param {string} encryptedData 加密数据
   * @param {string} key 密钥（16字节的16进制字符串，例如："0123456789abcdeffedcba9876543210"）
   * @returns {string} 解密后的字符串
   */
  static decryptECB(encryptedData: any | string, key: string) {
    try {
      if (!key || key.length !== 32) {
        throw new Error("密钥必须是16字节的16进制字符串（32个字符）");
      }
      return sm4.decrypt(encryptedData, key);
    } catch (error) {
      console.error("SM4 ECB解密失败:", error);
      throw error;
    }
  }

  /**
   * SM4 CBC模式加密
   * @param {string} data 待加密数据
   * @param {string} key 密钥（16字节的16进制字符串）
   * @param {string} iv 初始化向量（16字节的16进制字符串）
   * @returns {string} 加密后的16进制字符串
   */
  static encryptCBC(data: any | string, key: string, iv: string): string {
    try {
      if (!key || key.length !== 32) {
        throw new Error("密钥必须是16字节的16进制字符串（32个字符）");
      }
      if (!iv || iv.length !== 32) {
        throw new Error("IV必须是16字节的16进制字符串（32个字符）");
      }
      return sm4.encrypt(data, key, { mode: "cbc", iv });
    } catch (error) {
      console.error("SM4 CBC加密失败:", error);
      throw error;
    }
  }

  /**
   * SM4 CBC模式解密
   * @param {string} encryptedData 加密数据
   * @param {string} key 密钥（16字节的16进制字符串）
   * @param {string} iv 初始化向量（16字节的16进制字符串）
   * @returns {string} 解密后的字符串
   */
  static decryptCBC(encryptedData: any | string, key: string, iv: string) {
    try {
      if (!key || key.length !== 32) {
        throw new Error("密钥必须是16字节的16进制字符串（32个字符）");
      }
      if (!iv || iv.length !== 32) {
        throw new Error("IV必须是16字节的16进制字符串（32个字符）");
      }
      return sm4.decrypt(encryptedData, key, { mode: "cbc", iv });
    } catch (error) {
      console.error("SM4 CBC解密失败:", error);
      throw error;
    }
  }
}
