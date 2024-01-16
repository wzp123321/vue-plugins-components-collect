import { Component, ElementRef, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import * as lodash from 'lodash';

@Component({
  selector: 'app-ems-select-pop-up',
  templateUrl: './ems-select-pop-up.component.html',
  styleUrls: ['./ems-select-pop-up.component.scss'],
})
export class EmsSelectPopUpComponent implements OnInit {
  title: string = '';
  popListData: any;
  lineStyle: number = 1;
  noDescription: string = '暂无可选择的能源类型';
  selectEnergy: any;
  constructor(private el: ElementRef, public navParams: NavParams) {}

  ngOnInit(): void {
    if (this.navParams.data) {
      this.title = this.navParams.data.title;
      this.selectEnergy = this.navParams.data.selectData;
      let listData = [];
      let removeSelectData: any = [];
      if (this.selectEnergy && this.selectEnergy.length > 0) {
        listData = this.navParams.data.changeTypeList;
        lodash.forEach(listData, (item: any) => {
          lodash.forEach(this.selectEnergy, (itemselect) => {
            if (item.itemCode && itemselect.energyItemCode) {
              if (item.itemCode === itemselect.energyItemCode) {
                item.remove = true;
              }
            }
          });
        });
        this.popListData = lodash.filter(listData, ['remove', false]);
        if (this.popListData.length === 0) {
          this.noDescription = '暂无数据';
        }
      } else {
        this.popListData = this.navParams.data.changeTypeList;
      }
      this.lineStyle = this.navParams.data.lineStyle;
      if (this.popListData.length === 1) {
        this.lineStyle = 1;
      }
    } else {
    }
    setTimeout(() => {
      this.dialogHeight();
    }, 200);
  }
  dialogHeight() {
    const bodyHtml = window.document.getElementsByClassName('changeType')[0].clientHeight;

    const div = window.document.getElementsByClassName('modal-wrapper');

    if (this.popListData && this.popListData.length > 0) {
      const popListHeight = this.el.nativeElement.querySelector('.pop-list').offsetHeight;
      const popHeight = popListHeight + 20 + 20 + 30;
      const topValue = bodyHtml - popHeight - 12;
      div[0].setAttribute('style', 'height:' + popHeight + 'px; margin-top:' + topValue + 'px');
      const div2 = this.el.nativeElement.querySelector('.modal-wrapper');
    } else {
      const topValue = bodyHtml - 380 - 2;
      div[0].setAttribute('style', 'height: 380px; margin-top:' + topValue + 'px');
    }

    // console.log( bodyHtml, topValue)
  }
  trackById(index: number, item: any): number {
    return item.value;
  }
  // 选中关闭
  selectType(item: any) {
    this.navParams.data.modal.dismiss({
      result: {
        closed: true,
        item: item,
      },
    });
  }
}
