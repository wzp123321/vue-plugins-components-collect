import { FSealDecorator } from '../utils';

@FSealDecorator
class HttpConfig {
  private _proxy = '/api';
  /**
   * 全局代理标记
   */
  public get proxy(): string {
    return this._proxy;
  }
  public set proxy(v: string) {
    this._proxy = v;
  }
}
export const HTTP_CONFIG = new HttpConfig();
