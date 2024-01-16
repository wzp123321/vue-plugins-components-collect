import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import gatewayUtil from '@src/app/common/access-token/gatewayUtil';
// import { APP_ID } from '@src/app/common/access-token/api';
import { FGetAuthorization } from '../authorization/index';

/**
 *  请求头处理拦截器
 */
@Injectable()
class HeaderInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: string = sessionStorage.getItem('token') || '';
    const tenantCode: string = sessionStorage.getItem('tenantId') || '';
    const loginName: string = sessionStorage.getItem('loginName') || '';

    const Authorization = FGetAuthorization();
    // const accessToken = gatewayUtil.buildClientAccessToken();

    switch (Object.prototype.toString.call(req.body)) {
      case '[object String]':
        break;
      case '[object FormData]': {
        return next.handle(
          req.clone({
            setHeaders: {
              tenantCode,
              token,
              loginName,
              Authorization,
              // app_id: APP_ID,
              // access_token: accessToken ?? '',
            },
          })
        );
      }
      case '[object ???]': {
        return next.handle(
          req.clone({
            setHeaders: {
              'Content-Type': 'multipart/form-data',
              tenantCode,
              token,
              loginName,
              Authorization,
              // app_id: APP_ID,
              // access_token: accessToken ?? '',
            },
          })
        );
      }
      default:
        break;
    }
    return next.handle(
      req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          tenantCode,
          token,
          loginName,
          Authorization,
          // app_id: APP_ID,
          // access_token: accessToken ?? '',
        },
      })
    );
  }
}

/**
 * 缓存拦截器
 */
@Injectable()
class CacheInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}

/**
 * 错误处理拦截器
 */
@Injectable()
class ErrorInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError(this.errorHandler));
  }
  // 2024-01-09修改异常处理抛出结果
  private errorHandler(error: HttpErrorResponse) {
    const newError = { ...error };
    newError.error = {
      data: error.error.data,
      code: error.error.errcode,
      message: error.error.errmsg,
      success: error.error.success,
    };
    console.log(newError);
    return throwError(newError.error);
  }
}

export const RESTFULInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HeaderInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CacheInterceptor,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true,
  },
];
