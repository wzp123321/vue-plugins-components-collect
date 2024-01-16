import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NativeService } from '../../native.service';

@Component({
  selector: 'app-common-head',
  templateUrl: './common-head.component.html',
  styleUrls: ['./common-head.component.scss'],
})
export class CommonHeadComponent implements OnInit {
  @Input() theme: string = 'black'; // 标题栏颜色：black、 white
  @Input() hideBack: boolean = false; // 是否隐藏返回键
  @Input() title: string = ''; // 标题
  @Output() back = new EventEmitter(); // 返回按钮事件
  @ContentChild(TemplateRef) rightContent!: TemplateRef<any>;

  constructor(private nativeService: NativeService) {}

  ngOnInit() {
    // 物理键返回监听事件
    this.nativeService.registerHandler('goBack', () => {
      this.goBack();
    });
  }

  goBack() {
    this.back.emit('');
  }
}
