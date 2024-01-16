import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RESTFULService {
  constructor(private http: HttpClient) {}

  /**
   * http的post请求封装
   * @param url 请求地址
   * @param body 请求体
   * @returns 拦截器处理后的响应结果
   * !所有http请求&返回均会通过拦截器处理，如需配置特殊请求头，请在restful.intercept.ts中配置
   */
  public post<T_RES>(url: string, body: any = null): Promise<T_RES> {
    return this.http.post<T_RES>(url, body).toPromise();
  }

  /**
   * http的get请求封装
   * @param url 请求地址
   * @returns 拦截器处理后的响应结果
   * !所有http请求&返回均会通过拦截器处理，如需配置特殊请求头，请在restful.intercept.ts中配置
   */
  public get<T_RES>(url: string): Promise<T_RES> {
    return this.http.get<T_RES>(url).toPromise();
  }
}
