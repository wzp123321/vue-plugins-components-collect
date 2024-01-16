import { URL_PATH } from '@common/services/communication/communication.api';
import { Injectable } from '@angular/core';
import {NativeService} from '../../../common/native.service';

@Injectable({
  providedIn: 'root'
})
export class EmsSpeechRecognitionService {
  constructor(
    private nativeService: NativeService
  ) { }
  // press长按封装原生接口
  pressAtart(): Promise<string> {
    return new Promise((resolve, reject)=>{
      this.nativeService.nativeCall("speechRecognitionStart", {}, (result: any) => {

        console.log('pressAtart',result)
        resolve(result);
    }, (e:any)=>reject(e));
    });
  }
  // pressEnd长按结束封装原生接口
  downUp(): Promise<string> {
    return new Promise((resolve, reject)=>{
      this.nativeService.nativeCall("speechRecognitionEnd",{}, (result: any) => {
        resolve(result);
    }, (e:any)=> {
      console.log('报错了', e);
      reject(e)
    });
    });
  }
  haveKeyboardHeight(): Promise<string> {
    return new Promise( (resolve, reject) => {
      this.nativeService.nativeCall('getKeyBoardHeight', {}, (result: string) => {
        resolve(result);
      }, (e:any)=>reject(e))
    })
  }

}
