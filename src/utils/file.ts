import SparkMD5 from 'spark-md5';

/**
 * 响应结果
 */
export interface IRes<T> {
  code: number;
  data: T;
  message: string;
  success: boolean;
}
/**
 * 文件上传处理
 * @param accept 允许的后缀
 * @returns 目标文件域
 */
export function FUploadHandler(accept?: string): Promise<File> {
  /**
   * // 允许的文件格式
   *   const ACCEPT_EXTENSIONS = {
   *    '.xls': 'application/vnd.ms-excel',
   *    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   *    '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
   *  };
   * FUploadHandler(Object.keys(ACCEPT_EXTENSIONS).join())
   */
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

// 校验文件
export const verifyUpload = (
  list: File[],
  target: File,
  maxSize: number,
  accept: { [key: string]: string },
  total: number,
): boolean => {
  if (target?.size > maxSize * 1024 * 1024) {
    // message.error(`上传${target?.name ?? ''}失败，文件大小不能超过${maxSize}MB！`);
    return false;
  }

  if (!Object.values(accept).includes(target?.type)) {
    // message.error(`上传${target?.name ?? ''}失败，当前页面只支持上传${Object.keys(accept).join('/')}格式文件！`);
    return false;
  }

  if (list.map((file) => file.name).includes(target?.name)) {
    // message.error(`上传${target?.name ?? ''}失败，已存在同名文件，请修改文件名称重新上传！`);
    return false;
  }

  let totalSize = list.reduce((total: number, currentValue: File) => {
    console.log(currentValue.size);
    return total + currentValue.size;
  }, 0);

  totalSize += target.size;
  console.log(totalSize);
  if (totalSize > total * 1024 * 1024) {
    // message.error(`上传${target?.name ?? ''}失败，待上传附件总大小不能超过${total}MB！`);
    return false;
  }

  return true;
};

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
          reject(res?.message ?? '未知原因');
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

/**
 * 获取文件md5
 * @param file
 * @returns
 */
export const mapFileMD5 = (file: File) => {
  return new Promise((resolve) => {
    if (!file) {
      resolve(null);
      return;
    }

    const fileReader = new FileReader();
    const spark = new SparkMD5.ArrayBuffer();
    // 获取文件二进制数据
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e: ProgressEvent) => {
      spark.append((e.target as any).result);
      const md5 = spark.end();
      resolve(md5);
    };
  });
};

// export const
