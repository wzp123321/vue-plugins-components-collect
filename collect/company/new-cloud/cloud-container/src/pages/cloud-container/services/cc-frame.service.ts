import { IRes, FResHandler } from '@/core/communication';
import { FGetCookie, FGetQueryParam, FGetSession } from '@/core/token';
import axios from 'axios';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { CC_EJumpType, CC_ITerminalParam } from '../cloud-container.api';
import cryptoUtil from '@/utils/crypto';
import { CC_MENU_IMenuItem } from '../cc-te-menu/cc-te-menu.api';

// 后台接口地址
const enum EPath {
  交换认证 = '/authentication/urluser/query',
}

/**
 * 框架服务
 * @classdesc 实现框架跳转、页面加载、地址栏替换等功能
 * @default FrameService *单例模式
 */
class FrameService {
  private readonly _bsTag$ = new BehaviorSubject<string | undefined>(undefined);
  private readonly _bsSrc$ = new BehaviorSubject<string | undefined>(undefined);

  private readonly _bsPath$ = new BehaviorSubject<string | undefined>(undefined);

  // 目标页面标记 *Observable
  public get refTag$(): Observable<string> {
    return this._bsTag$.pipe(
      filter((v) => !!v),
      map((v) => v!),
    );
  }

  // 目标页面地址 *Observable
  public get refSrc$(): Observable<string> {
    return this._bsSrc$.pipe(
      filter((v) => !!v),
      map((v) => v!),
    );
  }

  // 目标页面path *Observable
  public get refPath$(): Observable<string> {
    return this._bsPath$.pipe(
      filter((v) => !!v),
      map((v) => v!),
    );
  }

  /**
   * 加载目标页面
   * @param path 路径
   * @param params 参数项
   */
  public async loadFrame(path: string, flag: CC_EJumpType, params: { [key: string]: string } = {}): Promise<void> {
    if (!path?.match(/[^\/]+(?!.*\/)/)?.[0]) {
      return;
    }
    let host = '';
    // 添加租户信息
    params = {
      toc: FGetCookie('toc') ?? '',
      tenantId: FGetQueryParam('tenantId') ?? '',
      tenantCode: FGetQueryParam('tenantCode') ?? '',
      ...params,
    };

    switch (flag) {
      case CC_EJumpType.terminal:
        try {
          const data = await this.exchangeToken(
            FGetCookie('toc-token') ?? '',
            cryptoUtil.Decrypt(FGetQueryParam('tenantId') ?? ''),
          );
          if (!data.host || !data.param.loginName) {
            alert('未获取到端侧用户信息，页面无法访问');
            return;
          }

          host = data.host;
          const paramObj = {
            tenantId: cryptoUtil.Decrypt(FGetQueryParam('tenantId') ?? ''),
            tenantCode: cryptoUtil.Decrypt(FGetQueryParam('tenantCode') ?? ''),
          };
          params = { ...data.param, ...params, ...paramObj };
          break;
        } catch (error) {
          console.warn('交换认证', '-->', error);
          return;
        }
      case CC_EJumpType.cloud:
      default:
        break;
    }

    // 组装参数项
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    this._bsSrc$.next(`${host}${path}?${query}`);
  }

  /**
   * 替换地址栏
   * @param tag 当前页面标记
   */
  public syncUrl(tag?: string): void {
    if (!tag) {
      return;
    }

    if (document.getElementsByTagName('iframe')[0].contentWindow?.location.pathname !== 'blank') {
      let pathname = String(document.getElementsByTagName('iframe')[0].contentWindow?.location.pathname).replaceAll(
        '/cloud-container/',
        '/',
      );
      console.log('%c🚀 ~ cc-frame.service.ts ~ 96行', 'font-size: 18px', pathname);
      this._bsPath$.next(pathname);
    }
    const query = Object.entries({
      tenantId: FGetQueryParam('tenantId') ?? '',
      tenantCode: FGetQueryParam('tenantCode') ?? '',
    })
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    history.replaceState(null, '', `${window.location.pathname.replace(/[^\/]+(?!.*\/)/, tag)}?${query}`);
    this._bsTag$.next(tag);
  }

  private async exchangeToken(token: string, id: string): Promise<{ host: string; param: CC_ITerminalParam }> {
    const convert = (data: IResToken): { host: string; param: CC_ITerminalParam } => ({
      host: data?.portalUrl,
      param: { sourceValue: '1', token: data?.user?.token, loginName: data?.user?.loginName },
    });

    try {
      const body: IReqToken = { tocToken: token, sideTenantId: id };
      const res: IRes<IResToken> = await axios.post(EPath.交换认证, body);
      const data = FResHandler(res);
      return convert(data);
    } catch (error) {
      throw error;
    }
  }

  public filterRoleBtn = (path: string, arr: CC_MENU_IMenuItem[]) => {
    for (const item of arr) {
      if (item.path == path) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const _item: any = this.filterRoleBtn(path, item.children);
        if (_item) {
          return _item;
        }
      }
    }
  };
}
export default new FrameService();

interface IReqToken {
  tocToken: string;
  sideTenantId: string;
}
interface IResToken {
  portalUrl: string;
  user: { userId: number; tenantId: number; loginName: string; realName: string; contact: string; token: string };
}
