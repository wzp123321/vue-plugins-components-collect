import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Directive({
  selector: '[emsInputFilter_Special]',
})
export class InputFilterDirective_Special implements OnInit {
  @Input('emsInputFilterModel')
  public model: string = null;
  @Output('emsInputFilterModelChange')
  public modelChangeEvent = new EventEmitter<string>();

  @Input('emsInputFilterCharacters')
  public characters: string = '';

  private readonly _default = String.raw`\`\-\\;\'\"<>`;
  private reg: RegExp = null;

  constructor(private $element: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.reg = new RegExp(
      String.raw`[${this._default}${this.characters}]`,
      'g'
    );
  }

  @HostListener('input', ['$event'])
  private onInput(event?: InputEvent): void {
    if (event?.isComposing) {
      return;
    }

    this.handleInput();
  }

  @HostListener('compositionend')
  private onCompositionend(event?: CompositionEvent) {
    this.handleInput();
  }

  @HostListener('blur')
  private onBlur(event?: Event): void {
    this.handleInput();
  }

  private handleInput(): void {
    this.$element.nativeElement.value =
      this.$element.nativeElement.value.replace(this.reg, '');
    this.modelChangeEvent.emit(this.$element.nativeElement.value);
  }
}

@Directive({
  selector: '[emsInputFilter_NoLine]',
})
export class InputFilterDirective_NoLine implements OnInit {
  @Input('emsInputFilterModel')
  public model: string = null;
  @Output('emsInputFilterModelChange')
  public modelChangeEvent = new EventEmitter<string>();

  @Input('emsInputFilterCharacters')
  public characters: string = '';

  private readonly _default = String.raw`\`\\;\'\"<>`;
  private reg: RegExp = null;

  constructor(private $element: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.reg = new RegExp(
      String.raw`[${this._default}${this.characters}]`,
      'g'
    );
  }

  @HostListener('input', ['$event'])
  private onInput(event?: InputEvent): void {
    if (event?.isComposing) {
      return;
    }

    this.handleInput();
  }

  @HostListener('compositionend')
  private onCompositionend(event?: CompositionEvent) {
    this.handleInput();
  }

  @HostListener('blur')
  private onBlur(event?: Event): void {
    this.handleInput();
  }

  private handleInput(): void {
    this.$element.nativeElement.value =
      this.$element.nativeElement.value.replace(this.reg, '');
    this.modelChangeEvent.emit(this.$element.nativeElement.value);
  }
}

@Directive({
  selector: '[emsInputFilter_ExcludeNumber]',
})
export class InputFilterDirective_ExcludeNumber implements OnInit {
  @Input('emsInputFilterModel')
  public model: string = null;
  @Output('emsInputFilterModelChange')
  public modelChangeEvent = new EventEmitter<string>();

  @Input('emsInputFilterNumberConfig')
  public config: INumberFilterConfig = {
    integer: 10,
    decimal: 4,
    negative: false,
  };

  private reg: RegExp = null;

  constructor(private $element: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.reg = new RegExp(
      String.raw`[^0-9${Math.ceil(this.config?.decimal ?? 0) > 0 ? '.' : ''}${
        this.config?.negative ? '-' : ''
      }]`,
      'g'
    );
  }

  @HostListener('input', ['$event'])
  private onInput(event?: InputEvent): void {
    if (event?.isComposing) {
      return;
    }

    this.handleInput();
  }

  @HostListener('compositionend')
  private onCompositionend(event?: CompositionEvent) {
    this.handleInput();
  }

  @HostListener('blur')
  private onBlur(event?: Event): void {
    this.handleInput();
  }

  private handleInput(): void {
    let value = this.$element.nativeElement.value.replace(this.reg, '');
    let symbol = '';

    // 处理符号
    if (value.substring(0, 1) === '-') {
      symbol = '-';
      value = value.substring(1);
    }
    value = value.replace(/[^0-9\.]/g, '');

    // 处理首位小数点
    if (value.substring(0, 1) === '.') {
      value = `0${value}`;
    }

    // 禁止头部连续输入0
    if (
      value.length > 1 &&
      value.substring(0, 1) === '0' &&
      value.substring(1, 2) !== '.'
    ) {
      value = value.substring(1);
    }

    // 处理小数点及小数位数
    if (value.includes('.')) {
      value = this.deduplicate(value, '.');
      const temp = value.split('.');
      value = `${temp[0]}.${
        temp[1]?.substring(
          0,
          Math.ceil(this.config?.decimal ?? 0) > 0
            ? Math.ceil(this.config.decimal)
            : null
        ) ?? ''
      }`;
    }

    // 处理头部多余的0
    if (value.length > 1) {
      value = value.replace(/^0+(?!\.)/, '');
    }

    // 限制整数长度
    const temp = value.split('.');
    temp[0] = temp[0].substring(0, Math.ceil(this.config?.integer ?? 10));
    value =
      temp.length === 2
        ? `${symbol}${temp[0]}.${temp[1]}`
        : `${symbol}${temp[0]}`;

    this.$element.nativeElement.value = value;
    this.modelChangeEvent.emit(this.$element.nativeElement.value);
  }

  private deduplicate(target: string, symbol: string): string {
    if (target.includes(symbol)) {
      const temp = target.split(symbol);
      let str = `${temp.shift() ?? ''}${symbol}`;
      temp.filter((v) => v).forEach((v) => (str += v));
      return str;
    }
    return target;
  }
}

interface INumberFilterConfig {
  integer?: number; // 允许的整数位数
  decimal?: number; // 允许的小数位数
  negative?: boolean; // 是否可为负数
}
