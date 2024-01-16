import { HTTP_SCommon } from 'web-core';
import { Observable, Subject } from 'rxjs';

import { EPath } from './compotents/cd-table/constant';
import { takeUntil } from 'rxjs/operators';

import { checkAxiosPermission } from '../../service/request';
import { FORBIDDEN_CODES } from '@/config/index';

export class CostDetailService {
  readonly destroy: any;
  private _authorityHttp: HTTP_SCommon<boolean>;
  public get authorityResult$() {
    return this._authorityHttp.data$ as unknown as Observable<boolean>;
  }
  constructor() {
    this.destroy = new Subject<void>();
    this._authorityHttp = new HTTP_SCommon<boolean>({
      url: EPath.是否拥有财务专家权限,
      converter: (data) => data ?? false,
    });

    this._authorityHttp.result$.pipe(takeUntil(this.destroy) as any).subscribe((v: any) => {
      if (FORBIDDEN_CODES?.includes(v?.code)) {
        checkAxiosPermission(v?.code, v?.message);
      }
    });
  }

  query() {
    this._authorityHttp.send();
  }

  destroyInstance() {
    this.destroy.next();
    this.destroy.complete();
  }
}
