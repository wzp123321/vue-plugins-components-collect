/**
 * 文件下载处理器
 * *将实时创建<a>标签并在下载完成后自动移除
 * @param url 文件地址
 * @param name 文件名
 */
export declare function FDownLoadHandler(url: string, name?: string): Promise<void>;
