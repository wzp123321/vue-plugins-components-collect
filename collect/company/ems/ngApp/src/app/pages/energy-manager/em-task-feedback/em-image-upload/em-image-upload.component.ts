import {
  Component,
  forwardRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActionSheetController } from '@ionic/angular';
import { photographData } from '../../ems-record-measures/record-measures-data-types';
import { EmImageUploadService } from './em-image-upload.service';

@Component({
  selector: 'app-em-image-upload',
  templateUrl: './em-image-upload.component.html',
  styleUrls: ['./em-image-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmImageUploadComponent),
      multi: true,
    },
  ],
})
export class EmImageUploadComponent implements OnInit, ControlValueAccessor {
  photographPopList: any[] = photographData;
  pop: any;
  private _list: upladImageType[] = [];

  private onTouchedCallback = () => {};
  private onChangeCallback = (_: any) => {};
  actionSheet: any;
  @Output() imageClick = new EventEmitter();
  constructor(
    private service: EmImageUploadService,
    public actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {}

  set value(value: upladImageType[]) {
    if (value !== this._list) {
      this._list = value;
      this.onChangeCallback(value);
    }
  }

  get value(): upladImageType[] {
    return this._list || [];
  }

  // 初始化时，获取并监听父组件通过ngModel传递进来的数据
  writeValue(val: upladImageType[]): void {
    if (val !== this._list) {
      this._list = val;
    }
  }
  // 初始化后，执行该方法，并保存控件接收到 change 事件后，调用的函数
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  imageLoad($event: any) {
    if ($event?.path?.[1]) {
      $event.path[1].style.background = 'none';
    }
  }

  // 图片加载错误处理
  imageLoadError($event: any) {
    // console.log($event);
    // $event.target.src = './assets/img/energy-manager/image-error.svg';
    // TODO:无法引用失败的图片文件
    // $event.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%23a2a9b6' font-family='system-ui, sans-serif' text-anchor='middle' dominant-baseline='middle'%3E加载失败%3C/text%3E%3C/svg%3E";
  }

  deleteImage(index: number) {
    this.value.splice(index, 1);
  }

  showPOP($event: any) {
    this.pop = $event;
    this.recordPopUpFunc2(this.getHandleData(this.photographPopList));
    console.log(this.actionSheet);
  }

  async measureStatusChange({ value }: any) {
    if (value === 1) {
      console.log('拍照');
      let path = await this.service.cameraPic();
      this.value.push(path);
    } else if (value === 3) {
      console.log('从相册中选择');
      let paths = await this.service.albumPic(
        Math.max(0, 6 - this.value.length)
      );
      for (let i = 0; i < paths.length; i++) {
        const element = paths[i];
        this.value.push(paths[i]);
      }
    }
  }
  // 底部
  async recordPopUpFunc2(v: any) {
    this.actionSheet = await this.actionSheetController.create({
      cssClass: v.buttonClass,
      buttons: v.showButtonList,
      mode: 'md',
    });
    await this.actionSheet.present();
    this.imageClick.emit(this.actionSheet);
  }
  // 关闭底部
  async recordPopUpClose() {
    if (this.actionSheet) {
      await this.actionSheet.dismiss();
      this.imageClick.emit(this.actionSheet);
    }
  }
  // 数据处理
  getHandleData(data: any) {
    let buttonClass = [];
    let showButtonList = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (!item.type) {
          item.type = 'summit';
        }
        buttonClass.push(item.type);
        showButtonList.push({
          text: item.label,
          role: item.type,
          handler: () => {
            if (item.type !== 'cancel') {
              this.showData(item);
            }
            this.imageClick.emit(null);
            //  this.implementChange.emit(item);
          },
        });
      }
    }
    return {
      buttonClass,
      showButtonList,
    };
  }
  // 操作
  async showData(item: any) {
    if (item.value === 1) {
      console.log('拍照');
      let path = await this.service.cameraPic();
      this.value.push(path);
    } else if (item.value === 3) {
      // console.log('从相册中选择');
      let paths = await this.service.albumPic(
        Math.max(0, 6 - this.value.length)
      );
      //this.value.push(paths);
      // console.log(paths);
      for (let i = 0; i < paths.length; i++) {
        const element = paths[i];
        this.value.push(paths[i]);
      }
    }
  }
}

export interface upladImageType {
  fileId: number;
  fileName?: string;
  fileUrl: string;
  imgFlag?: true;
  addrUrl?: string;
}
