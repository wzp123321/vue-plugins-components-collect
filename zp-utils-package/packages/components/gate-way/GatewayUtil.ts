import { access } from "./access";

export default class GatewayUtil {
  static accessStore = null;

  static getShareStorage() {
    const storageNameSpace = access.appId;
    return localStorage.getItem(`${storageNameSpace}.share`);
  }

  static setShareStorage(data: any) {
    const storageNameSpace = access.appId;
    return localStorage.setItem(`${storageNameSpace}.share`, data);
  }

  static removeShareStorage() {
    const storageNameSpace = access.appId;
    return localStorage.removeItem(`${storageNameSpace}.share`);
  }

  static getAccessTokenStorage() {
    const storageNameSpace = access.appId;
    return localStorage.getItem(`${storageNameSpace}.act`);
  }

  static setAccessTokenStorage(data: any) {
    const storageNameSpace = access.appId;
    return localStorage.setItem(`${storageNameSpace}.act`, data);
  }

  static removeAccessTokenStorage() {
    const storageNameSpace = access.appId;
    return localStorage.removeItem(`${storageNameSpace}.act`);
  }

  static storageNameSpace() {
    const storageNameSpace = access.appId;
    return storageNameSpace;
  }
}