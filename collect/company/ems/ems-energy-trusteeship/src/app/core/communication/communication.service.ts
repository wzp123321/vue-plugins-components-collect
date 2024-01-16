import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs';
import { CResSubject, FBlobHandler, FResHandler, IRes } from './communication.api';

export abstract class CommunicationService {
  protected abstract http: HttpClient;

  constructor() {}

  protected query<T = void, T_RES = T>(
    _: { $: CResSubject<T>; converter?: (data?: T_RES) => T },
    req: { url: string; body?: any },
    handler?: { onSuccess?: (value?: T) => void; onError?: (error?: string) => void }
  ): void {
    _.$.doReady(
      this.http.post<IRes<T_RES>>(req.url, req.body).pipe(
        map((res) => {
          const data = FResHandler(res);
          return _?.converter(data) ?? null;
        })
      ),
      handler
    );
  }

  protected download(
    _: { $: CResSubject; name?: string },
    req: { url: string; body?: any },
    handler?: { onSuccess?: () => void; onError?: (error?: string) => void }
  ): void {
    _.$.doReady(
      this.http.post(req.url, req.body, { responseType: 'blob' }).pipe(switchMap((res) => FBlobHandler(res, _.name))),
      handler
    );
  }
}
