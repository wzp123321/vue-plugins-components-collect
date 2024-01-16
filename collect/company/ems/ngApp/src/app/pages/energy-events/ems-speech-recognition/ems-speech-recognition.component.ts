import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { NativeService } from '../../../common/native.service';
import { EmsSpeechRecognitionService } from './ems-speech-recognition.service';
import { LoadingController } from '@ionic/angular';
import { fromEvent } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { GestureController } from '@ionic/angular';

@Component({
  selector: 'app-ems-speech-recognition',
  templateUrl: './ems-speech-recognition.component.html',
  styleUrls: ['./ems-speech-recognition.component.scss'],
})
export class EmsSpeechRecognitionComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = '';
  @Input() maxlength: string = '200';
  @Output() detailChange = new EventEmitter();
  textareaShowText: string = '';
  textareaValue: string = '';
  isPressStart: boolean = false;
  loading: any;
  loadingShow: boolean = false;
  @ViewChild('textareaFocus', { static: true }) emsTextarea: ElementRef;
  @ViewChild('emsSpeech', { static: true }) emsSpeechVue: ElementRef;
  // private $sub = new Subject<any>();
  // private subscription: Subscription;
  pressEvent = new EventEmitter();
  pressUpEvent = new EventEmitter();
  isFous: boolean = false;
  textMaxlength: number = Number(this.maxlength);
  loadingTopValue: string = '';
  constructor(
    public emsSpeechRecognitionService: EmsSpeechRecognitionService,
    public loadingController: LoadingController,
    private gestureCtrl: GestureController,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  async ngOnInit() {
    // this.pressEvent
    //   .pipe(throttleTime(600))
    //   .subscribe(async () => {
    //     if (!this.isFous) {
    //       await this.pressData();
    //     }

    //   });
    // this.pressUpEvent
    //   .subscribe(async () => {
    //     console.log('pressUpEvent')
    //     await  this.pressEnd();
    //   });
    this.loadingTop();

    // 自定义手势
    const gesture = this.gestureCtrl.create({
      el: this.emsSpeechVue.nativeElement,
      threshold: 0,
      gestureName: 'my-gesture',
      onStart: (e) => {
        this.pressStart(e);
        //  this.getKeyboardHeight(e);
        document.getElementById('textareaFocus').blur();
        this.emsSpeechVue.nativeElement.click;
      },
      onEnd: (detail) => {
        this.pressEnd();
        //  this.getKeyboardHeight(detail);
        document.getElementById('textareaFocus').blur();
      },
    });
    gesture.enable();
  }
  mouseenterFunch(e: Event) {}
  // textarea输入变化
  textareaChange(item: any) {
    // this.loadingShow = false;
    let curr = item.detail.value;
    const text = this.textareaShowText;
    if (curr) {
      curr = curr.substr(0, Number(this.maxlength));
      if (curr.length <= this.maxlength) {
        this.textareaShowText = curr;
        this.textareaValue = curr;

        this.detailChange.emit(this.textareaValue);
      } else {
      }
      item.detail.value = curr;
      const h = this.elementRef.nativeElement.querySelector('#textareaFocus');
      if (h) {
        h.value = curr;
      }
    }
    // if (curr === text) {
    //   this.textareaValue =  this.removeSpace(curr);
    // } else {
    //   this.textareaValue = curr;
    //   const textValue = this.removeSpace( this.textareaValue );
    //   this.setTextareaText(textValue);

    // }
    // curr = curr.substr(0, Number(this.maxlength));
    // console.log(curr)
    // this.textareaShowText = curr;
    // this.textareaValue = curr;
    // this.detailChange.emit(this.textareaValue);
  }
  textareaBlur(item: any) {
    // this.loadingShow = false;
    setTimeout(() => {
      this.isFous = false;
    }, 600);
  }
  textareaionFocus(item: any) {
    this.isFous = true;
  }

  // @HostListener('press', ['this.emsSpeechVue.nativeElement'])
  // clickEvent(e: MouseEvent) {
  //   console.log(e)
  //   if (e.preventDefault) {
  //     e.preventDefault();
  //   } // 通常是不需要冒泡的
  //   if (e.stopPropagation) {
  //     e.stopPropagation();
  //   }
  //   document.getElementById('textareaFocus').blur();
  // //  this.$sub.next(e);
  // }
  // @HostListener('pressup', ['this.emsSpeechVue.nativeElement'])
  // async pressupEvent(e: MouseEvent) {
  //   if (e.preventDefault) {
  //     e.preventDefault();
  //   } // 通常是不需要冒泡的
  //   if (e.stopPropagation) {
  //     e.stopPropagation();
  //   }
  //   this.pressEnd(e);
  // }
  // async pressData() {console.log('pressData===')
  //   if ( this.textareaValue.length >= 200) {
  //     this.presentLoadingWithOptions();
  //     this.loadingShow = false;
  //     return ;
  //   } else {
  //     this.loadingShow = true;console.log('loadingShow')
  //     // await this.presentLoadingWithOptions();
  //     const a = await this.emsSpeechRecognitionService.pressAtart();

  //     this.textareaValue += a;
  //     const text = this.removeSpace(this.textareaValue);
  //     this.setTextareaText( text);
  //     this.isPressStart = true;
  //     this.loadingShow = false;
  //   }

  // }
  // loading的top
  loadingTop() {
    let bodyHeight;
    if (document.body.querySelector('.ems-record-meaures')) {
      bodyHeight = document.body.querySelector('.ems-record-meaures').clientHeight;
    }

    if (!bodyHeight) {
      bodyHeight = document.body.offsetHeight;
    }

    const u = navigator.userAgent;
    const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isiOS) {
      const topValue = (bodyHeight - 102) / 2 + 80;
      this.loadingTopValue = topValue + 'px';
    } else {
      const topValue = (bodyHeight - 102) / 2;
      this.loadingTopValue = topValue + 'px';
    }
  }
  @HostListener('window:resize') onResize() {
    this.loadingTop();
  }
  // IOS的高
  async getKeyboardHeight(e: any) {
    const heightValue = await this.emsSpeechRecognitionService.haveKeyboardHeight();
    console.log(Number(heightValue));
    if (heightValue || Number(heightValue) !== 0) {
      this.isFous = false;
      setTimeout(() => {
        document.getElementById('textareaFocus').blur();
        document.getElementById('speechDetail').click();
      }, 0);
    }
  }

  async pressStart(e: any) {
    console.log('==进入press');
    //  console.log(this.textareaShowText.length, this.maxlength)
    if (this.textareaShowText.length >= Number(this.maxlength)) {
      this.loadingShow = false;
      this.presentLoadingWithOptions();
    } else {
      this.loadingShow = true;
      this.cdr.detectChanges();
      this.emsSpeechRecognitionService.pressAtart();
      // this.isPressStart = true;
      console.log('录音开始');
    }
    document.getElementById('textareaFocus').blur();
  }

  // APP长按触摸
  press(e: any) {
    // this.loadingShow = true;
    // const a = await this.emsSpeechRecognitionService.pressAtart();
    // this.isPressStart = true;
    // this.subscription = this.$sub.pipe(
    //   debounceTime(300)
    // ).subscribe(item => {
    //   console.log('pree-item')
    //   if ( this.textareaValue.length >= 200) {
    //     this.presentLoadingWithOptions();
    //     return false;
    //   }
    //   this.pressData();
    // });
  }

  // 设置Textarea的值
  public setTextareaText(value: string) {
    //   console.log(value, this.textareaShowText)
    // if (value !== this.textareaShowText) {
    this.textareaShowText = value;
    // }
  }
  // // APP离开屏幕，长按结束
  async pressEnd() {
    console.log('==进入pressEnd');
    this.loadingShow = false;
    this.cdr.detectChanges();
    const a = await this.emsSpeechRecognitionService.downUp();
    //  console.log('结束====',a)
    this.textareaValue += a;
    let text = this.removeSpace(this.textareaValue);
    text = text.substr(0, Number(this.maxlength));
    this.setTextareaText(text);
    document.getElementById('textareaFocus').blur();
    this.cdr.detectChanges();
  }
  // 去掉字符串里的空格
  removeSpace(text: string) {
    return text.replace(/\s*/g, '');
  }
  // 弹窗提示
  async presentLoadingWithOptions() {
    this.loading = await this.loadingController.create({
      duration: 1000,
      message: '最大可输入' + this.maxlength + '个字',
      cssClass: 'custom-class custom-loading',
      backdropDismiss: false,
      showBackdrop: false,
      spinner: null,
      translucent: false,
    });
    return await this.loading.present();
  }
  ngOnDestroy() {
    // this.subscription.unsubscribe();
  }
}
