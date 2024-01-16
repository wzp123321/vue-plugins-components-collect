/**
 * 文件下载处理器
 * *将实时创建<a>标签并在下载完成后自动移除
 * @param url 文件地址
 * @param name 文件名
 */
export function FDownLoadHandler(url: string, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (url) {
      const element = document.createElement('a');
      element.href = url;
      name && (element.download = name);
      element.click();
      resolve();
      element.remove();
    } else {
      reject(new Error(`无法下载${name || '文件'}`));
    }
  });
}
