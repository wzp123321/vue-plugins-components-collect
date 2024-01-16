enum EResCode {
  OK = 200,
}

export interface IRes<T = void> {
  readonly errcode: EResCode;
  readonly errmsg: string;
  readonly data: T;
  readonly success: boolean;
}

export function FResHandler<T>(res: IRes<T>): T {
  if (res.success) {
    return res.data;
  }
  throw res?.errmsg;
}

export function FBlobHandler(blob: Blob, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (blob.size) {
      const reader = new FileReader();

      if (blob?.type.includes('json')) {
        reader.onloadend = (e) => {
          const res = JSON.parse(e.target?.result as string);
          if (res?.errcode === 401 || res?.errcode === '401') {
            window.parent.postMessage(
              {
                code: res?.errcode,
                message: res.errmsg,
                type: 'ems-login-failure',
              },
              window.location.origin
            );
          }
        };
        reader.readAsText(blob);
      } else {
        reader.onloadend = (e) => {
          const element = document.createElement('a');
          element.href = e.target.result as string;
          name && (element.download = name);
          element.click();
          resolve();
          element.remove();
        };
        reader.readAsDataURL(blob);
      }
    } else {
      reject(`获取${name || '文件'}失败`);
    }
  });
}

export function FUploadHandler(accept?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('input');
    element.type = 'file';
    accept && (element.accept = accept);
    element.click();
    element.onchange = () => {
      const file = element.files[0];
      if (file?.size) {
        resolve(file);
      } else {
        reject('选取文件失败');
      }
      element.remove();
    };
  });
}

export function FGetQueryParam(key: string): string {
  const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
  const match = window.location.search.substring(1).match(reg);
  if (match?.length > 2) {
    return decodeURIComponent(match[2]);
  }
  return null;
}

export function FGetUploadFile(file: File): FormData {
  const data = new FormData();
  data.append('file', file);
  return data;
}

export function FGetUploadFiles(files: File[]): FormData {
  const data = new FormData();
  files.forEach((file) => data.append('file', file));
  return data;
}

export function FConvertToNumber(target: string | number): number {
  const result = +(target ?? undefined);
  return isNaN(result) ? null : result;
}

export function FConvertToBoolean(target: string | number): boolean {
  if (target === '0' || target === 0) {
    return false;
  }

  if (target === '1' || target === 1) {
    return true;
  }

  return null;
}
