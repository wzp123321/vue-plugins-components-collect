import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appDecimalOnly]'
})
export class DecimalOnlyDirective {
  @Input('appDecimalOnly') options: string;
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event']) onKeyDown(e: any) {
    console.log(this.options)
    const intLength = +this.options.split(',')[0] || 6;
    const decimalLength = +this.options.split(',')[1] || 4;
    const regex: RegExp = new RegExp(`\\d{0,${intLength}}(\\.\\d{0,${decimalLength}})?`, 'g');
    let current: string = this.el.nativeElement.value;
    const text: string = e.target.value;
    let lastValue = null;

    if (lastValue !== text) {
      const match = text.match(regex);
      if (!match[0]) {
        current = '';
      } else {
        current = match[0]
          .replace(/^(-?)0+(\d)/, '$1$2') // 删除多余的前置0
          .replace(/^(-?)\./, '$10.'); // 插入纯小数的整数0
      }
      lastValue = text;
      if ( this.el.nativeElement) {
        this.el.nativeElement.value = current === String(0) ? '' : current;
        this.el.nativeElement.dispatchEvent(new Event('click'));
        e.target.value = current === String(0) ? '' : current;
      } 
    }
    e.preventDefault();
  }

  @HostListener('change') onChange() {
    this.control.control.setValue(this.el.nativeElement.value);
  }

  /**
   * 应对输入被格式化导致不触发change事件的问题。所以这里在blur的时候也进行重新赋值
   * @param $event 事件
   */
  @HostListener('blur', ['$event']) onBlur($event: any) {
    this.control.control.setValue(this.el.nativeElement.value);
  }
}
