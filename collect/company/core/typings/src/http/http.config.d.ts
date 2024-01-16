declare class HttpConfig {
    private _proxy;
    /**
     * 全局代理标记
     */
    get proxy(): string;
    set proxy(v: string);
}
export declare const HTTP_CONFIG: HttpConfig;
export {};
