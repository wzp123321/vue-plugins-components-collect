import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-manual-entry-no-data',
  templateUrl: './manual-entry-no-data.component.html',
  styleUrls: ['./manual-entry-no-data.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualEntryNoDataComponent implements OnInit {
  @Input() noDataText: string = '暂无数据';
  @Input() hrefMsg: string = '';
  @Input() customizedStyle: any;
  @Input() type: ExceptionType = 'noData';
  @Input() size: Size = 'medium';
  @Output() EMSEmitHrefItems = new EventEmitter<string>();
  imgStyle: any;
  constructor() {}

  ngOnInit(): void {
    this.imgStyle = {
      'background-image': `url(${EXCEPTION_IMG_SRC[this.type]})`,
    };
  }
  onHrefItem(item: any) {
    this.EMSEmitHrefItems.emit(item);
  }
}
export type ExceptionType = 'noData' | 'notConfigured';

export type Size = 'small' | 'medium' | 'large';

export const EXCEPTION_IMG_SRC = {
  noData: './assets/img/common/common-no-data.svg',
  notConfigured: './assets/img/common/common-not-configured.svg',
};

export const IMG_SIZE = {
  small: 200,
  medium: 400,
  large: 600,
};
