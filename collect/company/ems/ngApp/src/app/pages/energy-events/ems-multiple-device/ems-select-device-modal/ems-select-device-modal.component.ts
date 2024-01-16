import { Component, ElementRef, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-ems-select-device-modal',
  templateUrl: './ems-select-device-modal.component.html',
  styleUrls: ['./ems-select-device-modal.component.scss'],
})
export class EmsSelectDeviceModalComponent implements OnInit {
  title: string; // 标题
  selectDeviceData: any; // 列表

  constructor(public navParams: NavParams, private el: ElementRef) {}

  ngOnInit(): void {
    if (this.navParams.data) {
      this.title = this.navParams.data.title;
      this.selectDeviceData = this.navParams.data.selectData;
    } else {
    }
    setTimeout(() => {
      this.dialogHeight();
    }, 200);
  }
  dialogHeight() {
    const bodyHtml = window.document.getElementsByClassName('select-device')[0].clientHeight;
    const popListHeight = this.el.nativeElement.querySelector('.select-device-modal-content').offsetHeight;
    const popHeight = popListHeight + 20 + 20 + 30;
    const div = window.document.getElementsByClassName('modal-wrapper');
    const topValue = bodyHtml - popHeight - 2;
    div[0].setAttribute('style', 'height:' + popHeight + 'px; margin-top:' + topValue + 'px');
    const div2 = this.el.nativeElement.querySelector('.modal-wrapper');
    // console.log( bodyHtml, topValue)
  }

  // 返回
  goBack() {
    this.doClose();
  }
  //关闭模态对话框
  doClose() {
    this.navParams.data.modal.dismiss({
      result: {
        closed: true,
      },
    });
  }
  trackById(index: number, item: any): number {
    return item.deviceId;
  }
}
