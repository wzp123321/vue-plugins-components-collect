import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'ems-ma-exception-table',
  templateUrl: './exception-table.component.html',
  styleUrls: ['./exception-table.component.less'],
})
export class ExceptionTableComponent implements OnInit, OnDestroy {
  @ViewChild('elementTableBody', { static: true })
  private refTableBody: ElementRef<HTMLDivElement>;

  @Input() public height = 250;
  @Input() public list: { position: string; detail: string }[] = [];

  public isOverflow = false;

  private _onResize$ = new ResizeObserver((entries) => {
    this.isOverflow = entries[0]?.target.scrollHeight > entries[0]?.target.clientHeight;
    this.cdr.detectChanges();
  });

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._onResize$.observe(this.refTableBody.nativeElement);
  }

  ngOnDestroy(): void {
    this._onResize$.disconnect();
  }
}
