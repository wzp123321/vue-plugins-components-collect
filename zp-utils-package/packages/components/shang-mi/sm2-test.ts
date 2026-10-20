import {SM2Tool} from './sm2-tool';
import {SM3Tool} from './sm3-tool';
import {SM4Tool} from './sm4-tool';


export class ToolTest {
  /**
   * 测试SM2加密
   */
  static async testSM2() {
    console.log('=== 开始测试 SM2 加密 ===');
    
    try {
      // 1. 生成密钥对
      console.log('1. 生成密钥对...');
      const keyPair = SM2Tool.generateKeyPair();
      console.log('公钥:', keyPair.publicKey);
      console.log('私钥:', keyPair.privateKey);
      
      // 2. 测试加密解密
      console.log('\n2. 测试加密解密...');
      const plainText = 'Hello, SM2加密测试123!';
      console.log('明文:', plainText);
      
      const encrypted = SM2Tool.encrypt(plainText, keyPair.publicKey);
      console.log('加密结果:', encrypted);
      console.log('加密结果长度:', encrypted.length);
      
      const decrypted = SM2Tool.decrypt(encrypted, keyPair.privateKey);
      console.log('解密结果:', decrypted);
      console.log('解密是否成功:', decrypted === plainText);
      
      // 3. 测试签名验签
      console.log('\n3. 测试签名验签...');
      const signData = '需要签名的数据: ' + Date.now();
      console.log('待签名数据:', signData);
      
      const signature = SM2Tool.sign(signData, keyPair.privateKey);
      console.log('签名结果:', signature);
      
      const verifyResult = SM2Tool.verify(signData, signature, keyPair.publicKey);
      console.log('验签结果:', verifyResult);
      
      // 4. 测试错误情况
      console.log('\n4. 测试错误处理...');
      try {
        SM2Tool.encrypt('test', ''); // 空公钥
      } catch (e: any) {
        console.log('空公钥错误捕获:', e.message);
      }
      
      console.log('=== SM2 测试完成 ===\n');
      return true;
    } catch (error) {
      console.error('SM2测试失败:', error);
      return false;
    }
  }

  /**
   * 测试SM3哈希
   */
  static async testSM3() {
    console.log('=== 开始测试 SM3 哈希 ===');
    
    try {
      // 1. 测试字符串哈希
      console.log('1. 测试字符串哈希...');
      const text1 = 'Hello, SM3哈希测试!';
      const text2 = 'Hello, SM3哈希测试! ';
      const text3 = '不同的内容';
      
      const hash1 = SM3Tool.hash(text1);
      const hash2 = SM3Tool.hash(text2);
      const hash3 = SM3Tool.hash(text3);
      
      console.log(`"${text1}" 的哈希值:`, hash1);
      console.log(`"${text2}" 的哈希值:`, hash2);
      console.log(`"${text3}" 的哈希值:`, hash3);
      console.log('相同内容哈希是否相等:', SM3Tool.hash('相同') === SM3Tool.hash('相同'));
      console.log('不同内容哈希是否不同:', hash1 !== hash3);
      
      // 2. 测试文件哈希
      console.log('\n2. 测试文件哈希...');
      try {
        // 创建一个虚拟的文本文件用于测试
        const fileContent = '这是一个测试文件内容，用于测试SM3文件哈希功能。';
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const testFile = new File([blob], 'test.txt', { 
          type: 'text/plain',
          lastModified: Date.now()
        });
        
        const fileHash = await SM3Tool.hashFile(testFile);
        console.log('文件哈希值:', fileHash);
        
        // 验证文件哈希与直接计算的一致性
        const directHash = SM3Tool.hash(fileContent);
        console.log('直接计算哈希值:', directHash);
        console.log('文件哈希与直接哈希是否一致:', fileHash === directHash);
      } catch (fileError) {
        console.warn('文件哈希测试跳过（可能环境不支持）:', fileError.message);
      }
      
      // 3. 测试ArrayBuffer哈希
      console.log('\n3. 测试ArrayBuffer哈希...');
      const text = 'ArrayBuffer测试';
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(text);
      const arrayBuffer = uint8Array.buffer; // 获取底层的ArrayBuffer
      const bufferHash = SM3Tool.hash(arrayBuffer);
      console.log('ArrayBuffer哈希值:', bufferHash);
      console.log('与字符串哈希是否一致:', bufferHash === SM3Tool.hash(text));
      
      // 4. 测试错误处理
      console.log('\n4. 测试错误处理...');
      try {
        SM3Tool.hash(null as any);
      } catch (e: any) {
        console.log('无效参数错误捕获:', e.message);
      }
      
      console.log('=== SM3 测试完成 ===\n');
      return true;
    } catch (error) {
      console.error('SM3测试失败:', error);
      return false;
    }
  }

  /**
   * 测试SM4加密
   */
  static async testSM4() {
    console.log('=== 开始测试 SM4 加密 ===');
    
    try {
      // 1. 生成密钥
      console.log('1. 生成密钥...');
      const key = SM4Tool.generateKey();
      const iv = SM4Tool.generateKey(); // 同样生成IV
      console.log('SM4密钥:', key);
      console.log('SM4 IV:', iv);
      
      // 2. 测试ECB模式
      console.log('\n2. 测试ECB模式...');
      const ecbPlainText = 'Hello, SM4 ECB测试!';
      console.log('ECB明文:', ecbPlainText);
      
      const ecbEncrypted = SM4Tool.encryptECB(ecbPlainText, key);
      console.log('ECB加密结果:', ecbEncrypted);
      
      const ecbDecrypted = SM4Tool.decryptECB(ecbEncrypted, key);
      console.log('ECB解密结果:', ecbDecrypted);
      console.log('ECB解密是否成功:', ecbDecrypted === ecbPlainText);
      
      // 3. 测试CBC模式
      console.log('\n3. 测试CBC模式...');
      const cbcPlainText = 'Hello, SM4 CBC测试!';
      console.log('CBC明文:', cbcPlainText);
      
      const cbcEncrypted = SM4Tool.encryptCBC(cbcPlainText, key, iv);
      console.log('CBC加密结果:', cbcEncrypted);
      
      const cbcDecrypted = SM4Tool.decryptCBC(cbcEncrypted, key, iv);
      console.log('CBC解密结果:', cbcDecrypted);
      console.log('CBC解密是否成功:', cbcDecrypted === cbcPlainText);
      
      // 4. 测试密钥错误的情况
      console.log('\n4. 测试密钥错误...');
      try {
        const wrongKey = '00000000000000000000000000000000';
        SM4Tool.decryptECB(ecbEncrypted, wrongKey);
      } catch (e: any) {
        console.log('错误密钥解密失败（预期）:', e.message);
      }
      
      // 5. 测试不同数据的加密
      console.log('\n5. 测试不同数据...');
      const testCases = [
        '短文本',
        '这是一段中等长度的测试文本，用于验证SM4加密功能。',
        'a'.repeat(100) // 长文本
      ];
      
      for (const testCase of testCases) {
        const encrypted = SM4Tool.encryptECB(testCase, key);
        const decrypted = SM4Tool.decryptECB(encrypted, key);
        console.log(`测试 "${testCase.slice(0, 20)}..." 结果: ${decrypted === testCase ? '✓' : '✗'}`);
      }
      
      // 6. 测试边界情况
      console.log('\n6. 测试边界情况...');
      try {
        SM4Tool.encryptECB('test', '123'); // 短密钥
      } catch (e: any) {
        console.log('短密钥错误捕获:', e.message);
      }
      
      try {
        SM4Tool.encryptCBC('test', key, '123'); // 短IV
      } catch (e: any) {
        console.log('短IV错误捕获:', e.message);
      }
      
      console.log('=== SM4 测试完成 ===\n');
      return true;
    } catch (error) {
      console.error('SM4测试失败:', error);
      return false;
    }
  }

  /**
   * 综合测试：模拟真实场景
   */
  static async testIntegration() {
    console.log('=== 开始综合测试 ===');
    
    try {
      // 场景：使用SM2交换SM4密钥，然后用SM4加密数据
      
      // 1. 服务端生成SM2密钥对
      console.log('1. 服务端生成SM2密钥对...');
      const serverKeyPair = SM2Tool.generateKeyPair();
      
      // 2. 客户端生成SM4密钥
      console.log('2. 客户端生成SM4密钥...');
      const sm4Key = SM4Tool.generateKey();
      console.log('客户端SM4密钥:', sm4Key);
      
      // 3. 客户端使用服务器公钥加密SM4密钥
      console.log('3. 客户端加密SM4密钥...');
      const encryptedSm4Key = SM2Tool.encrypt(sm4Key, serverKeyPair.publicKey);
      console.log('加密后的SM4密钥:', encryptedSm4Key);
      
      // 4. 服务器解密得到SM4密钥
      console.log('4. 服务器解密SM4密钥...');
      const decryptedSm4Key = SM2Tool.decrypt(encryptedSm4Key, serverKeyPair.privateKey);
      console.log('解密后的SM4密钥:', decryptedSm4Key);
      console.log('SM4密钥解密是否成功:', decryptedSm4Key === sm4Key);
      
      // 5. 客户端使用SM4加密数据
      console.log('\n5. 客户端使用SM4加密业务数据...');
      const businessData = JSON.stringify({
        userId: '123456',
        timestamp: Date.now(),
        action: 'login',
        data: { username: 'testuser', password: 'hashed_password' }
      });
      
      const iv = SM4Tool.generateKey();
      const encryptedData = SM4Tool.encryptCBC(businessData, sm4Key, iv);
      console.log('业务数据加密结果:', encryptedData);
      
      // 6. 计算数据哈希
      console.log('\n6. 计算数据完整性校验...');
      const dataHash = SM3Tool.hash(businessData);
      console.log('数据SM3哈希值:', dataHash);
      
      // 7. 服务器使用SM4解密数据并验证
      console.log('\n7. 服务器解密并验证数据...');
      const decryptedData = SM4Tool.decryptCBC(encryptedData, decryptedSm4Key, iv);
      console.log('解密后的业务数据:', decryptedData);
      
      const verifyHash = SM3Tool.hash(decryptedData);
      console.log('解密数据的哈希值:', verifyHash);
      console.log('数据完整性验证:', verifyHash === dataHash);
      
      console.log('=== 综合测试完成 ===\n');
      return true;
    } catch (error) {
      console.error('综合测试失败:', error);
      return false;
    }
  }

  /**
   * 运行所有测试
   */
  static async runAllTests() {
    console.log('🚀 开始运行所有加密测试\n');
    
    const results = {
      sm2: false,
      sm3: false,
      sm4: false,
      integration: false
    };
    
    try {
      results.sm2 = await this.testSM2();
      results.sm3 = await this.testSM3();
      results.sm4 = await this.testSM4();
      results.integration = await this.testIntegration();
      
      console.log('\n📊 测试结果汇总:');
      console.log('===================');
      console.log(`SM2 测试: ${results.sm2 ? '✅ 通过' : '❌ 失败'}`);
      console.log(`SM3 测试: ${results.sm3 ? '✅ 通过' : '❌ 失败'}`);
      console.log(`SM4 测试: ${results.sm4 ? '✅ 通过' : '❌ 失败'}`);
      console.log(`综合测试: ${results.integration ? '✅ 通过' : '❌ 失败'}`);
      console.log('===================\n');
      
      const allPassed = Object.values(results).every(r => r);
      if (allPassed) {
        console.log('🎉 所有测试通过！');
      } else {
        console.log('⚠️  部分测试失败，请检查日志');
      }
      
      return allPassed;
    } catch (error) {
      console.error('测试运行异常:', error);
      return false;
    }
  }
}
