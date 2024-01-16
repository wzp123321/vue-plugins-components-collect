import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[emsInputValidator_Number]',
})
export class InputValidatorDirective_Number implements OnInit {
  @Input('emsInputValidatorNumberConfig')
  public config: INumberValidatorConfig = { min: null, max: null, decimal: 0 };
  @Output('emsInputValidatorVerify')
  public verifyEvent = new EventEmitter<boolean>();

  private reg: RegExp = null;

  constructor(private $element: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    if (this.config?.decimal > 0) {
      this.reg = new RegExp(String.raw`^\-?[0-9]+(\.[0-9]{1,${Math.ceil(this.config.decimal)}})?$`);
    } else {
      this.reg = /^\-?[0-9]+$/;
    }
  }

  @HostListener('change')
  private onChange(): void {
    this.verifyEvent.emit(this.checkInput(this.$element.nativeElement.value));
  }

  private checkInput(value: string): boolean {
    if (this.reg.test(value)) {
      return !(+value < (this.config?.min ?? undefined)) && !(+value > (this.config?.max ?? undefined));
    }
    return false;
  }
}

interface INumberValidatorConfig {
  min?: number; // 最小值
  max?: number; // 最大值
  decimal?: number; // 允许的小数位数
}
