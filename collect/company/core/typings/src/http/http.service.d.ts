import { Observable } from "rxjs";
import { HTTP_EState, HTTP_IConfig, HTTP_IResult } from "./http.api";
import { TDeepPartial } from "../utils";
declare abstract class HttpService<TRes, T> {
    private readonly _catch$;
    private readonly _trigger$;
    /**
     * 结果&状态集
     * *Observable
     * !数据将在每次请求开始时清空
     */
    get result$(): Observable<HTTP_IResult<T>>;
    /**
     * 数据
     * *Observable
     * !仅在请求结束后变更
     */
    get data$(): Observable<T | null>;
    /**
     * 状态
     * *Observable
     */
    get state$(): Observable<HTTP_EState>;
    /**
     * 异常代码
     * *Observable
     * !仅在请求失败时变更
     */
    get code$(): Observable<number | string>;
    /**
     * 异常信息
     * *Observable
     * !仅在请求失败时变更
     */
    get message$(): Observable<string>;
    constructor(base: IBase<TRes, T>, config?: HTTP_IConfig);
    /**
     * 发送请求
     * !每次新请求发出前，将自动回收未完成的重复请求
     * @param data 请求参数
     * !未传入请求参数时，默认使用构造时提供的请求数据（若存在）
     */
    send(data?: TBodyData): void;
    protected abstract mapSource(req: Request, converter?: TConverter<TRes, T>): Observable<T | null>;
    protected abstract mapRes(res: Response): Promise<TRes>;
    private mapType;
    private mapReq;
    protected checkRes(res: Response): void;
}
export declare class HTTP_SCommon<TRes = void, T = TRes> extends HttpService<TRes, T> {
    /**
     * 构造普通HTTP服务
     * @types 泛型<TRes, T> -TRes：响应数据的类型（默认为void） -T：转换后数据的类型（默认与TRes一致）
     * @param base 基本信息对象 -url：地址 -data：请求数据 -converter：转换器
     * !未定义converter时，接口数据将强制转换为null
     * @param config 配置信息对象
     */
    constructor(base: IBase<TRes, T>, config?: HTTP_IConfig);
    protected mapSource(req: Request, converter?: TConverter<TRes, T>): Observable<T | null>;
    protected mapRes(res: Response): Promise<TRes>;
}
export declare class HTTP_SDownload extends HttpService<File, void> {
    /**
     * 构造文件下载HTTP服务
     * @param base 基本信息对象 -url：地址 -data：请求数据
     * @param config 配置信息对象
     */
    constructor(base: Omit<IBase, "converter">, config?: HTTP_IConfig);
    protected mapSource(req: Request): Observable<void>;
    protected mapRes(res: Response): Promise<File>;
    private download;
}
declare type TBodyData = string | FormData;
declare type TConverter<TRes, T> = (data?: TDeepPartial<TRes>) => T | null;
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
export {};
