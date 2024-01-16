import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const ERROR_CODES = ['401', '500'];

/**
 *  异常处理拦截器
 */
@Injectable()
class ExceptionInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('error----------------------------', error);
        if (error?.error?.errcode?.includes('4f0') || error?.status === 401) {
          const messageEle = document.getElementsByClassName('ant-message');
          if (messageEle?.length && messageEle?.[0]) {
            (messageEle[0] as HTMLElement).style.display = 'none';
          }
        }
        if (error?.error?.size && error?.error?.type?.includes('json')) {
          const reader = new FileReader();
          reader.onloadend = (e) => {
            const res = JSON.parse(e.target?.result as string);
            if (Number(res?.errcode) === 401 || res?.code === 401) {
              window.parent.postMessage(
                {
                  code: res?.errcode,
                  message: res?.errmsg,
                  type: 'ems-login-failure',
                },
                window.location.origin
              );
            }
          };
          reader.readAsText(error?.error);
          throw ERROR_CODES.includes(error?.status + '') ||
            ERROR_CODES.includes(error?.error?.errcode + '')
            ? error?.error?.errmsg ?? '/login'
            : '网络不佳';
        } else {
          throw error?.error?.errcode?.includes('4f0') ||
            ERROR_CODES.includes(error?.status + '') ||
            ERROR_CODES.includes(error?.error?.errcode + '')
            ? error?.error?.errmsg ?? '/login'
            : '网络不佳';
        }
      })
    );
  }
}

export const EXCEPTION_INTERCEPTOR = {
  provide: HTTP_INTERCEPTORS,
  useClass: ExceptionInterceptor,
  multi: true,
};
