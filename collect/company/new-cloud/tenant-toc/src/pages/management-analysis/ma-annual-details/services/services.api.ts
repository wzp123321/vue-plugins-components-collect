export type TDeepReadonly<T> = {
  readonly [K in keyof T]: TDeepReadonly<T[K]>;
};

export interface IRes<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * 响应处理
 * @param res 响应体
 * @returns 返回数据
 * @throws 异常信息
 */
export function FResHandler<T = void>(res: IRes<T>): T {
  if (res?.success) {
    return res.data;
  }

  throw res?.message ?? '未知原因';
}

/**
 * 二进制响应处理
 * @param blob 二进制流
 * @param name 输出文件名
 */
export function FBlobHandler(blob: Blob, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (blob.size) {
      const reader = new FileReader();

      if (blob.type.includes('json')) {
        reader.onloadend = (e) => {
          const res: IRes<void> = JSON.parse(e.target?.result as string);
          const message = res?.message || (res as any)?.errmsg;
          reject(message ?? '未知原因');
        };
        reader.readAsText(blob);
      } else {
        reader.onloadend = (e) => {
          FDownLoadHandler(e.target?.result as string, name)
            .then(() => resolve())
            .catch((error) => reject(error));
        };
        reader.readAsDataURL(blob);
      }
    } else {
      reject(`无法获取${name || '文件'}`);
    }
  });
}

/**
 * 文件上传处理
 * @param accept 允许的后缀
 * @returns 目标文件域
 */
export function FUploadHandler(accept?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('input');
    element.type = 'file';
    accept && (element.accept = accept);
    element.click();
    element.onchange = () => {
      const file = element.files?.[0];
      if (file?.size) {
        resolve(file);
      } else {
        reject('无法选取文件');
      }
      element.remove();
    };
  });
}

/**
 * 文件下载处理
 * @param url 源路径
 * @param name 输出文件名
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
      reject(`无法下载${name || '文件'}`);
    }
  });
}

// 租户信息
export const TOKEN: Readonly<{ tenantCode: string; tenantId: number }> = {
  tenantCode: sessionStorage.getItem('TENANT_CODE') || 'test03',
  tenantId: +(sessionStorage.getItem('TENANT_ID') || 13232244),
};
Object.freeze(TOKEN);
