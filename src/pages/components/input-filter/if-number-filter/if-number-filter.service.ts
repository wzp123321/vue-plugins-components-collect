import { message } from 'ant-design-vue';
import { ref } from 'vue';
/*
 * @Descrption: 文本过滤服务
 * @Author: wanzp
 * @Date: 2022-08-21 21:04:24
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-21 22:27:49
 */
class NumberFilterService {
  //#region
  private _value = ref<string>('');
  private _integer = ref<number>(10);
  private _decimals = ref<number>(2);
  private _is_negative = ref<boolean>(false);
  private _allowZero = ref<boolean>(false);

  public get value(): string {
    return this._value.value;
  }
  public set value(value: string) {
    this._value.value = value;
  }
  public get integer(): number {
    return this._integer.value;
  }
  public set integer(value: number) {
    this._integer.value = value;
  }
  public get decimals(): number {
    return this._decimals.value;
  }
  public set decimals(value: number) {
    this._decimals.value = value;
  }
  public get is_negative(): boolean {
    return this._is_negative.value;
  }
  public set is_negative(value: boolean) {
    this._is_negative.value = value;
  }
  public get allowZero(): boolean {
    return this._allowZero.value;
  }
  public set allowZero(value: boolean) {
    this._allowZero.value = value;
  }
  //#endregion

  constructor(integer: number = 10, decimals: number = 2, is_negative: boolean = false) {
    this._integer.value = integer;
    this._decimals.value = decimals;
    this._is_negative.value = is_negative;
  }

  input = (event: InputEvent) => {
    const ele = event.target as HTMLInputElement;

    if (!ele) {
      return;
    }

    if (event.isComposing) {
      return;
    }
    console.log(13123);
    if (this._decimals.value !== 0) {
      this._value.value = this._value.value.replace(/[^0-9\.]/g, '');
      // 处理首位小数点
      if (this._value.value.substring(0, 1) === '.') {
        this._value.value = `0${this._value.value}`;
      }
      // 禁止头部连续输入0
      if (
        this._value.value.length > 1 &&
        this._value.value.substring(0, 1) === '0' &&
        this._value.value.substring(1, 2) !== '.'
      ) {
        this._value.value = this._value.value.substring(1);
      }
      if (this._value.value.indexOf('.') !== this._value.value.lastIndexOf('.')) {
        this._value.value = this.deduplicate(this._value.value, '.');
      }

      if (this._value.value.indexOf('.') !== -1) {
        const valueArr = this._value.value.split('.');
        this._value.value = `${valueArr[0].substring(0, this._integer.value)}.${
          valueArr[1].substring(0, this._decimals.value) || ''
        }`;
      } else {
        this._value.value = this._value.value.substring(0, this._integer.value);
      }
      this._value.value = this._value.value.trim();

      // 限制小数点后几位
      this._value.value = this._value.value.replace(`/^(\-)*(\d+)\.(\d{0,${this._decimals.value}}).*$/`, '$1$2.$3');
    } else {
      this._value.value = this._value.value.replace(/\D+/g, '');
      if (this._value.value.length > 1 && this._value.value.substring(0, 1) === '0') {
        this._value.value = this._value.value.substring(1);
      }
      if (!this._allowZero.value && this._value.value.substring(0, 1) === '0') {
        this._value.value = this._value.value.replace(/[^1-9]/g, '');
      }
      this._value.value = this._value.value.substring(0, this._integer.value);
    }
  };
  // 过滤连续.等特殊字符
  deduplicate(target: string, symbol: string): string {
    if (target.includes(symbol)) {
      const temp = target.split(symbol);
      let str = `${temp.shift() ?? ''}${symbol}`;
      temp.filter(v => v).forEach(v => (str += v));
      return str;
    }
    return target;
  }
}

export default NumberFilterService;
