import { BehaviorSubject, Observable, Subscription } from 'rxjs';

enum EResCode {
  OK = 200,
}

export interface IRes<T = void> {
  readonly code: EResCode;
  readonly message: string;
  readonly data: T;
  readonly success: boolean;
}

export function FResHandler<T>(res: IRes<T>): T {
  if (res.success) {
    return res.data;
  }
  throw res.message;
}

export function FBlobHandler(blob: Blob, name?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (blob.size) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        const element = document.createElement('a');
        element.href = e.target.result as string;
        name && (element.download = name);
        element.click();
        resolve();
        element.remove();
      };
      reader.readAsDataURL(blob);
    } else {
      reject(`无法获取${name || '文件'}`);
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
        reject('无法选取文件');
      }
      element.remove();
    };
  });
}

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

export function FGetQueryParam(key: string): string {
  const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
  const match = window.location.search.substring(1).match(reg);
  if (match?.length > 2) {
    return decodeURIComponent(match[2]);
  }
  return null;
}

export function FGetUploadFile(file: File, key: string = 'file'): FormData {
  const data = new FormData();
  data.append(key, file);
  return data;
}
export function FGetUploadFiles(
  files: File[],
  key: string = 'files'
): FormData {
  const data = new FormData();
  files.forEach((file) => data.append(key, file));
  return data;
}

export function FConvertToNumber(target: string | number): number {
  try {
    const result = +(target ?? undefined);
    return isNaN(result) ? null : result;
  } catch (error) {
    throw '无法解析数据';
  }
}

export function FConvertToBoolean(target: string | number): boolean {
  try {
    switch (target) {
      case '0':
      case 0:
        return false;
      case '1':
      case 1:
        return true;
      default:
        return null;
    }
  } catch (error) {
    throw '无法解析数据';
  }
}

export function FConvertToDate(target: string): Date {
  try {
    return target ? new Date(target.replaceAll('-', '/')) : null;
  } catch (error) {
    throw '无法解析数据';
  }
}

export class CResSubject<T = void> extends BehaviorSubject<T> {
  private _state: 'padding' | 'success' | 'error' = null;
  public get state() {
    return this._state;
  }

  private _subscription: Subscription;

  private _message: string = null;
  public get message(): string {
    return this._message;
  }

  public get isLoading(): boolean {
    return this._state === 'padding';
  }
  public get isEmpty(): boolean {
    return this.value == null;
  }

  constructor(value: T = null) {
    super(value);
  }

  public doReady(
    source$: Observable<T>,
    handler?: {
      onSuccess?: (value?: T) => void;
      onError?: (error?: string) => void;
    }
  ): void {
    if (this._subscription && !this._subscription.closed) {
      this._subscription.unsubscribe();
    }

    this._state = 'padding';
    this._message = null;

    this._subscription = source$.subscribe({
      next: (value?: T) => {
        handler?.onSuccess?.(value);
        this.onSuccess(value);
      },
      error: (error: string) => {
        handler?.onError?.(error);
        this.onError(error);
      },
    });
  }

  private onSuccess(value: T): void {
    this._state = 'success';
    this.next(value ?? null);
  }

  private onError(error: string): void {
    this._state = 'error';
    this._message = error;
    this.next(null);
  }
}
