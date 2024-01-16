import { ToastService } from 'ng-zorro-antd-mobile';
import { EmShareService } from './em-share.service';
import { EnergyManagerService } from '../../energy-manager.service';
import { IWeekSummaryData } from '../em-week-summary.interface.ts';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, forwardRef, Input, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import html2canvas from 'html2canvas';

@Component({
  selector: 'ems-em-share',
  templateUrl: './em-share.component.html',
  styleUrls: ['./em-share.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(()=> EmShareComponent),
    multi: true
  }],
  animations: [
    // 是动画触发条件，和元素关联，元素可同时触发多个 trigger
    trigger('openClose', [
      // state 定义最终状态，元素在给定时间只能处于一种 state
      state('open', style({
        top: 0,
        bottom: 0,
      })),
      state('close', style({
        top: '100%',
        bottom: '-100%',
      })),
      // transition 定义中间状态
      transition('close => open', [
        animate('.5s ease-in')
      ]),
      transition('open => close', [
        animate(100)
      ]),
    ]),
    trigger('showHide', [
      state('show', style({
        opacity: 1,
        zIndex: 1
      })),
      state('hide', style({
        opacity: 0,
        zIndex: -1
      })),
      transition('show <=> hide', [
        animate(100)
      ])
    ])
  ]
})
export class EmShareComponent implements OnInit, ControlValueAccessor {

  private isOpen: boolean = false;
  @Input() data: IWeekSummaryData;
  rootName: string = '';
  userName: string = '';
  onChangeCallback: (_: boolean) => {};
  dataURL: string = '';
  showImage: boolean = false;
  private isSharing = false; // 是否正在分享中，保证分享不可短时间内多次点击。

  constructor(
    private service: EnergyManagerService,
    public shareService: EmShareService,
    private _toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  set value(value: boolean) {
    // console.log('set value', value, this.isOpen);
    if (value !== this.isOpen) {
      this.isOpen = value;
      this.onChangeCallback(value);
    }
  }
  
  get value() {
    // console.log('get value', this.isOpen);
    return this.isOpen;
  }

  writeValue(value: boolean): void {
    if (value !== this.isOpen) {
      this.isOpen = value;
      this.cdr.detectChanges();  
    }
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn: any): void {
    
  }

  ngOnInit() {
    this.getRootName();
    this.userName = sessionStorage.userName || '';
  }

  getRootName() {
    this.rootName = sessionStorage.rootName || '';
    this.service.getRootName().then(rootName => {
      this.rootName = rootName;
      sessionStorage.rootName = rootName;
    });
  }

  close() {
    this.value = false;
  }

  getHtmlBase64(platform: string) {
    if (this.isSharing) {
      return;
    }
    this.isSharing = true;
    html2canvas(document.querySelector(".main"), {
      scale: 4
    }).then( async canvas => {
      // document.body.appendChild(canvas);
      let dataURL = canvas.toDataURL();
      // this.dataURL = dataURL;
      // this.showImage = true
      this.isSharing = false;
      this.shareService.share(platform, dataURL).then(value => {
        // this._toast.info(`分享成功`, 2000, null, true);
        // 分享成功后返回列表页
        this.close();
      }, (errmsg: any) => {
        this._toast.info(`分享失败`, 2000, null, true);
      });
    });
  }

}
