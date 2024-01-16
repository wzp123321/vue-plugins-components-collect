import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-manual-entry-quick-time',
  templateUrl: './manual-entry-quick-time.component.html',
  styleUrls: ['./manual-entry-quick-time.component.less'],
})
export class ManualEntryQuickTimeComponent implements OnInit {
  @Input() itemArray: any;
  @Input() itemSelected: number = null;
  @Output() itemOnSelect = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}
  selectItem(itemId: any) {
    this.itemSelected = itemId;
    this.itemOnSelect.emit(itemId);
  }
}
