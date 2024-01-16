import { FGetAuthorization } from '../../../common/services/authorization/index';
import { Injectable, OnInit } from '@angular/core';
import { NativeService } from '@common/native.service';
import { URL_PATH } from '@common/services/communication/communication.api';
import gatewayUtil from '@src/app/common/access-token/gatewayUtil';
import { APP_ID } from '@src/app/common/access-token/api';
import { ToastController } from '@ionic/angular';

interface EIU_IAddrVO {
  addrUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmImageUploadService {
  constructor(
    private nativeService: NativeService,
    private ctrlToast: ToastController
  ) {}

  cameraPic(): Promise<upladImageType> {
    return new Promise((resolve, reject) => {
      const token = sessionStorage.getItem('token') ?? '';
      const tenantCode = sessionStorage.getItem('tenantId') ?? '';
      const loginName = sessionStorage.getItem('loginName') ?? '';
      const Authorization = FGetAuthorization();
      const Referer = window.location.href;
      const access_token = gatewayUtil.buildClientAccessToken();

      console.warn(
        '拍照----------',
        token,
        access_token,
        tenantCode,
        loginName,
        Authorization,
        Referer
      );

      this.nativeService.nativeCall(
        'newCameraPic',
        {
          quality: 100, // 照片质量（0-100）
          encodingType: 'JPEG', // 照片格式，建议使用JPEG
          targetWidth: 400, // 照片宽度
          targetHeight: 600, // 照片高度
          urls: URL_PATH.EnergyEvent.getUploadImages, // 上传路径
          urlHeaders: {
            // access_token,
            // app_id: APP_ID,
            token,
            tenantCode,
            loginName,
            Authorization,
            Referer,
          },
          urlParams: {},
        },
        async (fileRes: any) => {
          const res = JSON.parse(fileRes);
          console.log('拍照返回路径', res);
          if (res?.success) {
            const imageList = {
              fileId: 0,
              fileUrl: '',
            };
            if (res?.data?.length) {
              const tenantCode: string =
                sessionStorage.getItem('tenantId') || '';
              const prefixUrl = '/energy-ems/file/downloadSingleFile/';
              imageList.fileId = res?.data?.[0]?.addrUrl ?? '';
              imageList.fileUrl = `${prefixUrl}${
                res?.data?.[0]?.addrUrl ?? ''
              }?tenantCode=${tenantCode}`;
            }
            resolve(imageList);
          } else {
            const toast = await this.ctrlToast.create({
              cssClass: 'toast',
              mode: 'md',
              position: 'middle',
              message: res?.errmsg,
              duration: 2000,
            });
            await toast.present();
          }
        },
        (e: any) => {
          console.log('报错了', e);
          reject(e);
        }
      );
    });
  }

  albumPic(max: number = 6): Promise<upladImageType[]> {
    return new Promise((resolve, reject) => {
      const token = sessionStorage.getItem('token') ?? '';
      const tenantCode = sessionStorage.getItem('tenantId') ?? '';
      const loginName = sessionStorage.getItem('loginName') ?? '';
      const Authorization = FGetAuthorization();
      const Referer = window.location.href;
      const access_token = gatewayUtil.buildClientAccessToken();

      console.warn(
        '相册返回路径----------',
        token,
        access_token,
        tenantCode,
        loginName,
        Authorization,
        Referer
      );

      this.nativeService.nativeCall(
        'newSelectedImgs',
        {
          photoOfMax: max, //最大选取照片数量
          urls: URL_PATH.EnergyEvent.getUploadImages, //上传路径
          urlHeaders: {
            // access_token,
            // app_id: APP_ID,
            token,
            tenantCode,
            loginName,
            Authorization,
            Referer,
          },
          urlParams: {},
        },
        async (fileRes: any) => {
          const res = JSON.parse(fileRes);
          console.log('相册返回路径===', res);

          if (res?.success) {
            const imageList = [];
            const tenantCode: string = sessionStorage.getItem('tenantId') || '';
            const prefixUrl = '/energy-ems/file/downloadSingleFile/';
            if (res?.data?.length) {
              const list = res?.data?.map((item: EIU_IAddrVO) => {
                return item?.addrUrl;
              });
              for (var i = 0; i < list.length; i++) {
                imageList.push({
                  fileId: list[i],
                  fileUrl: `${prefixUrl}${list[i]}?tenantCode=${tenantCode}`,
                });
              }
            }
            resolve(imageList);
          } else {
            console.log(res?.errmsg);
            const toast = await this.ctrlToast.create({
              cssClass: 'toast',
              mode: 'md',
              position: 'middle',
              message: res?.errmsg,
              duration: 2000,
            });
            await toast.present();
          }
        },
        (e: any) => {
          console.log('报错了', e);
          reject(e);
        }
      );
    });
  }
}

export interface upladImageType {
  fileId: number;
  fileName?: string;
  fileUrl: string;
  imgFlag?: true;
  addrUrl?: string;
}
