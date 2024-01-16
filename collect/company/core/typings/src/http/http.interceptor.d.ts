import { HTTP_TInterceptor } from './http.api';
declare abstract class HttpInterceptor<T> {
    private readonly _interceptors;
    constructor();
    /**
     * 添加拦截器
     * @param interceptor 拦截器函数
     * *建议传入函数引用，否则可能会导致该拦截器无法正常删除
     * !拦截器函数的执行顺序将与添加顺序保持一致
     * !重复的函数引用不会改变执行顺序
     */
    add(interceptor: HTTP_TInterceptor<T>): void;
    /**
     * 删除拦截器
     * @param interceptor 拦截器函数
     * !需要保证传入的拦截器引用与添加时一致
     */
    delete(interceptor: HTTP_TInterceptor<T>): void;
    /**
     * 清空拦截器注册表
     * !将无效并清空全部拦截器（包括非引用式添加的拦截器函数）
     */
    clear(): void;
    /**
     * 使用拦截器
     * @param origin 数据源
     * @returns 数据源经拦截器顺序处理后的结果
     */
    use(origin: T): Promise<T>;
}
declare class HttpRequestInterceptor extends HttpInterceptor<Request> {
}
/**
 * 请求拦截器
 * *单例模式
 */
export declare const HTTP_REQUEST_INTERCEPTORS: HttpRequestInterceptor;
declare class HttpResponseInterceptor extends HttpInterceptor<Response> {
}
/**
 * 响应拦截器
 * *单例模式
 * todo 暂未启用，将在未来版本正式挂载至通信服务
 */
export declare const HTTP_RESPONSE_INTERCEPTORS: HttpResponseInterceptor;
export {};
