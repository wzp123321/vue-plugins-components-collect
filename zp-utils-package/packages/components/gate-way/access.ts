/*
 * @Author: liuguanqi liugq@tiansu-china.com
 * @Date: 2025-06-24 09:14:49
 * @LastEditors: liuguanqi liugq@tiansu-china.com
 * @LastEditTime: 2026-03-03 16:56:41
 * @FilePath: \digtal-twin-pedestal\src\utils\safe\access.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

class useAccess {
  public appId = "";
  public key = "";
  public initialized = false;

  setAppId(appId: string) {
    this.appId = appId;
  }

  setKey(key: string) {
    this.key = key;
  }

  setInstance(initialized: boolean) {
    this.initialized = initialized;
  }
}

export const access = new useAccess();
