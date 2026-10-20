
import { sm3 } from 'sm-crypto-v2';


/**
 * SM3 哈希工具类
 */
export class SM3Tool {
  /**
   * 计算SM3哈希值 会根据数据类型进行格式转换 但是需要保证数据是正确的
   * @param data 支持：string | Array | Uint8Array | ArrayBuffer
   * @returns 哈希值（16进制字符串）
   */
  static hash(data: string | number[] | Uint8Array | ArrayBuffer): string {
    try {
      // 处理不同类型
      if (typeof data === 'string') {
        return sm3(data)
      } else if (data instanceof Uint8Array) {
        // Uint8Array -> 字节数组
        return sm3(data)
      } else if (Array.isArray(data)) {
        // 已经是字节数组
        return sm3( new Uint8Array(data))
      } else if (data instanceof ArrayBuffer) {
        // ArrayBuffer -> Uint8Array -> 字节数组
        const uint8FromBuffer = new Uint8Array(data)
        return sm3(uint8FromBuffer);
      } else {
        throw new Error('不支持的数据类型')
      }
    } catch (error) {
      console.error('SM3哈希计算失败:', error)
      throw error
    }
  }

  /**
   * 计算文件哈希值
   * @param file 文件对象
   * @returns 哈希值
   */
  static async hashFile(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const result = e.target?.result
          if (result instanceof ArrayBuffer) {
            // ArrayBuffer 需要转换
            const uint8Array = new Uint8Array(result)
            const hash = sm3(uint8Array)
            resolve(hash)
          } else {
            reject(new Error('读取文件结果不是 ArrayBuffer'))
          }
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }
}
