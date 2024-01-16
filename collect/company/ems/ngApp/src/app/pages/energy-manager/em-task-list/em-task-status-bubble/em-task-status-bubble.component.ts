import { Component, Input, OnInit } from '@angular/core';
import { EMCheckStatus } from '@src/app/pages/energy-manager/em-task-list/data-type';

@Component({
  selector: 'app-em-task-status-bubble',
  templateUrl: './em-task-status-bubble.component.html',
  styleUrls: ['./em-task-status-bubble.component.scss'],
})
export class EmTaskStatusBubbleComponent implements OnInit {
  @Input() workStatus: EMCheckStatus = null;
  @Input() special: string = null;

  private readonly STATUS_TEXT_MAP = {
    undone: '未完成',
    delay: '延时完成',
    done: '完成',
    todo: '待完成',
    continue: '',
  };

  get statusText(): string {
    if (this.workStatus === null) {
      return '';
    }
    return this.STATUS_TEXT_MAP[this.workStatus];
  }

  constructor() {}

  ngOnInit(): void {}
}
