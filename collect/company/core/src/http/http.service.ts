import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  Observable,
  ReplaySubject,
  Subject,
  switchMap,
  tap,
  throttleTime,
  throwError,
} from "rxjs";
import { fromFetch } from "rxjs/fetch";
import {
  HTTP_EContent,
  HTTP_EState,
  HTTP_IConfig,
  HTTP_IResult,
} from "./http.api";
import {
  FDownLoadHandler,
  FHeaderMatcher,
  FSealDecorator,
  FTypeMatcher,
  TDeepPartial,
} from "../utils";
import {
  HTTP_REQUEST_INTERCEPTORS,
  HTTP_RESPONSE_INTERCEPTORS,
} from "./http.interceptor";
import { HTTP_CONFIG } from "./http.config";

abstract class HttpService<TRes, T> {
  private readonly _catch$ = new ReplaySubject<HTTP_IResult<T>>(1);
  private readonly _trigger$ = new Subject<TBodyData | null>();

  //#region 请求结果
  /**
   * 结果&状态集
   * *Observable
   * !数据将在每次请求开始时清空
   */
  public get result$(): Observable<HTTP_IResult<T>> {
    return this._catch$.pipe(distinctUntilKeyChanged("state"));
  }
  /**
   * 数据
   * *Observable
   * !仅在请求结束后变更
   */
  public get data$(): Observable<T | null> {
    return this._catch$.pipe(
      filter((v) => v.state !== HTTP_EState.block),
      map((v) => v.data)
    );
  }
  /**
   * 状态
   * *Observable
   */
  public get state$(): Observable<HTTP_EState> {
    return this._catch$.pipe(
      map((v) => v.state),
      distinctUntilChanged()
    );
  }
  /**
   * 异常代码
   * *Observable
   * !仅在请求失败时变更
   */
  public get code$(): Observable<number | string> {
    return this._catch$.pipe(
      filter((v) => v.state === HTTP_EState.error),
      map((v) => v.code ?? 500)
    );
  }
  /**
   * 异常信息
   * *Observable
   * !仅在请求失败时变更
   */
  public get message$(): Observable<string> {
    return this._catch$.pipe(
      filter((v) => v.state === HTTP_EState.error),
      map((v) => v.message ?? "未知原因")
    );
  }

  //#endregion

  constructor(base: IBase<TRes, T>, config?: HTTP_IConfig) {
    this._trigger$
      .pipe(
        throttleTime(config?.throttle ?? 0),
        debounceTime(config?.debounce ?? 0),
        tap(() => this._catch$.next({ data: null, state: HTTP_EState.block })),
        map((data) => this.mapReq(base.url, data ?? base.data, config)),
        switchMap((req) => HTTP_REQUEST_INTERCEPTORS.use(req.clone())),
        switchMap((req) => this.mapSource(req, base.converter)),
        catchError((e: any, origin) => {
          this._catch$.next({
            data: null,
            state: HTTP_EState.error,
            code:
              Number((e.cause as any)?.errcode) ||
              Number((e.cause as any)?.code),
            message: e.errmsg || e.message,
          });
          return origin;
        })
      )
      .subscribe((v) =>
        this._catch$.next({
          data: v,
          state: HTTP_EState.success,
        })
      );
  }

  /**
   * 发送请求
   * !每次新请求发出前，将自动回收未完成的重复请求
   * @param data 请求参数
   * !未传入请求参数时，默认使用构造时提供的请求数据（若存在）
   */
  public send(data?: TBodyData): void {
    this._trigger$.next(data ?? null);
  }

  protected abstract mapSource(
    req: Request,
    converter?: TConverter<TRes, T>
  ): Observable<T | null>;
  protected abstract mapRes(res: Response): Promise<TRes>;

  private mapType(
    type?: HTTP_EContent,
    data?: TBodyData
  ): { "Content-Type"?: HTTP_EContent } {
    if (type) {
      return { "Content-Type": type };
    } else {
      switch (FTypeMatcher(data)) {
        case "formdata":
          return {};
        default:
          return { "Content-Type": HTTP_EContent.json };
      }
    }
  }

  private mapReq(
    url: string,
    data?: TBodyData,
    config?: HTTP_IConfig
  ): Request {
    return new Request(`${config?.proxy ?? HTTP_CONFIG.proxy}/${url}`, {
      method: "POST",
      headers: {
        "Core-Proxy-Tag": `/${config?.proxy ?? "api"}`,
        ...this.mapType(config?.type, data),
        ...config?.headers,
      },
      body: data,
    });
  }

  protected checkRes(res: Response): void {
    switch (res.status) {
      case 200:
      case 400:
      case 420:
        return;
      case 403:
        throw new Error("无权限", { cause: { code: res.status } as any });
      case 404:
        throw new Error("地址错误", { cause: { code: res.status } as any });
      default:
        throw new Error("网络不佳", { cause: { code: res.status } as any });
    }
  }
}

@FSealDecorator
export class HTTP_SCommon<TRes = void, T = TRes> extends HttpService<TRes, T> {
  /**
   * 构造普通HTTP服务
   * @types 泛型<TRes, T> -TRes：响应数据的类型（默认为void） -T：转换后数据的类型（默认与TRes一致）
   * @param base 基本信息对象 -url：地址 -data：请求数据 -converter：转换器
   * !未定义converter时，接口数据将强制转换为null
   * @param config 配置信息对象
   */
  constructor(base: IBase<TRes, T>, config?: HTTP_IConfig) {
    super(base, config);
  }

  protected mapSource(
    req: Request,
    converter?: TConverter<TRes, T>
  ): Observable<T | null> {
    return fromFetch(req).pipe(
      tap((res) => this.checkRes(res)),
      switchMap((res) => HTTP_RESPONSE_INTERCEPTORS.use(res)),
      switchMap((res) => this.mapRes(res)),
      map((data) => converter?.(data) ?? null),
      catchError((e: Error) => throwError(() => e))
    );
  }

  protected async mapRes(res: Response): Promise<TRes> {
    const temp = (await res.json()) as IRes<TRes>;
    if (temp?.success) {
      return temp.data;
    }

    throw new Error(temp?.message || temp?.errmsg, {
      cause: { code: Number(temp?.errcode) } as any,
    });
  }
}

@FSealDecorator
export class HTTP_SDownload extends HttpService<File, void> {
  /**
   * 构造文件下载HTTP服务
   * @param base 基本信息对象 -url：地址 -data：请求数据
   * @param config 配置信息对象
   */
  constructor(base: Omit<IBase, "converter">, config?: HTTP_IConfig) {
    super(base, config);
  }

  protected mapSource(req: Request): Observable<void> {
    return fromFetch(req).pipe(
      tap((res) => this.checkRes(res)),
      switchMap((res) => this.mapRes(res)),
      switchMap((file) => this.download(file)),
      catchError((e: Error) => throwError(() => e))
    );
  }

  protected async mapRes(res: Response): Promise<File> {
    const name = FHeaderMatcher(
      res.headers,
      "content-disposition",
      "filename"
    ).get("filename");
    if (name) {
      return new File([await res.blob()], name);
    } else {
      const temp: IRes = await res.json();
      throw new Error(temp?.message || temp?.errmsg, {
        cause: { code: Number(temp?.errcode) } as any,
      });
    }
  }

  private async download(file: File): Promise<void> {
    const url = URL.createObjectURL(file);
    await FDownLoadHandler(url, file.name);
    URL.revokeObjectURL(url);
  }
}

type TBodyData = string | FormData;
type TConverter<TRes, T> = (data?: TDeepPartial<TRes>) => T | null;
interface IBase<TRes = void, T = TRes> {
  /** 请求地址 */
  readonly url: string;
  /** 默认请求参数 */
  readonly data?: TBodyData;
  /**
   * 转换器
   * !未定义converter时，可能导致接口数据无法正常获取
   */
  readonly converter?: TConverter<TRes, T>;
}

interface IRes<T = void> {
  readonly errcode: number;
  readonly data: T;
  readonly message: string;
  readonly errmsg: string;
  readonly success: boolean;
}
