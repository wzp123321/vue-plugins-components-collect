import { Component, Input, OnInit, EventEmitter, Output, OnChanges, HostListener, SimpleChanges, ChangeDetectorRef  } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { NativeService } from '@src/app/common/native.service';

@Component({
  selector: 'app-ems-radio-pop-up',
  templateUrl: './ems-radio-pop-up.component.html',
  styleUrls: ['./ems-radio-pop-up.component.scss']
})
export class EmsRadioPopUpComponent implements OnInit, OnChanges {
  @Input() dataList: any = [];
  @Input() initVlue: any;
  @Input() needMap: boolean = true;
  private _showPop: any = null;
  @Input() set  showPop (v: any) {
    console.log(v)
    if (v) {
      this.ishideDiv = true;
      this.recordPopUp(); 
    } else {console.log('closeq====')
      this.recordPopUpClose(); 
    } 
    this.cdr.detectChanges();
return ;
  };
  private _isItOpen: boolean = false;
  @Input('is-it-open') set isItOpen(v: boolean) {
    console.log(v)
    if (!v) { 
      this.recordPopUpClose(); 
      }
      this._isItOpen = v;
  }
  @Output() implementChange = new EventEmitter();
  showButtonList: any = [];
  lableText: string = '';
  lableTip: string = '选择';
  buttonClass: any = []; // 样式
  ishideDiv: boolean =  this.needMap;
  actionSheet: any;
  constructor(
    public actionSheetController: ActionSheetController,
    private nativeService:NativeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // console.log(this.dataList)
    if (this.initVlue) {
      this.lableText = this.initVlue.label;
      if (this.lableText) {
        this.lableTip = '更改';
      }
    }
    this.getHandleData();
    
    // this.nativeService.registerHandler("goBack",  () => { 
    //    this.recordPopUpClose();
    //    const item = 'show'; 
    //    console.log(2)
    //    //this.implementChange.emit(item);
    // });  
  }
  // 数据处理
  getHandleData() {
    if (this.dataList) { 
      for (let i = 0; i < this.dataList.length; i++) {
        const item = this.dataList[i];
        if (!item.type) {
          item.type = 'summit'
        }
        this.buttonClass.push(item.type);
        this.showButtonList.push(
          {
            text: item.label + this._isItOpen, 
            role: item.type, 
            handler: () => {
              if (item.type !== 'cancel') {
                this.lableText = item.label; 
                if (item.label) {
                  this.lableTip = '更改';
                } else {
                  this.lableTip = '选择';
                }
              } 
              
              this.implementChange.emit(item);
            }
          }
        )
      }
    }
  }
  // 出现底部弹窗
  async  recordPopUp() { 
    this._isItOpen = true;
    await this.recordPopUpFunc(); 
    const item = 'show';
    this.implementChange.emit(item);
  }
  // 底部
  async recordPopUpFunc() {
    this.actionSheet = await this.actionSheetController.create({
      cssClass: this.buttonClass,
      buttons:  this.showButtonList,
     
    });
    await this.actionSheet.present();
  }
 // 关闭底部
 async recordPopUpClose() { console.log('closeq')
  if (this.actionSheet) {
    this.actionSheetController.dismiss();
    this._isItOpen = false;
    
  }
 }
  ngOnChanges(changes: SimpleChanges) {
  //  console.log(this.showPop)
  //  if (this.showPop) {
  //     this.ishideDiv = true;
  //     this.recordPopUp(); 
  //   } else {console.log('closeq====')
  //     this.recordPopUpClose(); 
  //   } 
  }
  // @HostListener('click', ['this.showPop']) click(event: TouchEvent) {
  //    console.log(' this.showPop')
  // }
}
