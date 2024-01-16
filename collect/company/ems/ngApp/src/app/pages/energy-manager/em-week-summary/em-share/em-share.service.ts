import { NativeService } from '../../../../common/native.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmShareService {

  constructor(
    private nativeService: NativeService
  ) { }

  public platform = {
    wechat: 'WXSession',
    wechatMoment: 'WXTimeLine',
    qq: 'qqSession'
  }

  share(platform: string, imgContent: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.nativeService.nativeCall("share", {
        platform, // 分享平台 WXSession (微信好友) WXTimeLine(微信朋友圈) qqSession(qq好友)
        shareType: 2, // 1 文字分享 2 图片分享 3 网页分享
        shareContent: JSON.stringify({ // 2.1.图片分享“{“imgContent”:本地图片转成base64,”isUrl”:false(图片是否是地址访问)}“
          imgContent,
          isUrl: false
        })
      }, (dataStr: string) => {
        let data: {
          errcode: string;
          errmsg: string;
        } = JSON.parse(dataStr);
        if (data.errcode === '0') {
          console.log('分享成功');
          resolve('');
        } else {
          console.log('分享错误', data);
          reject(data.errmsg);
        }
      }, (e: any) => {
        console.log('分享报错了', e);
        reject(e);
      });
    });
  }

}
