import { message } from 'ant-design-vue';
import { ref } from 'vue';
/*
 * @Descrption: 文本过滤服务
 * @Author: wanzp
 * @Date: 2022-08-21 21:04:24
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-08-21 21:56:37
 */
class TextFilterService {
  //#region
  private _value = ref<string>('');
  private _regexp = ref<string>('');

  private _symbolValue = ref<string>('');

  private _symbols = ref<string[]>([]);

  public get value(): string {
    return this._value.value;
  }
  public set value(value: string) {
    this._value.value = value;
  }
  public get symbolValue(): string {
    return this._symbolValue.value;
  }
  public set symbolValue(value: string) {
    this._symbolValue.value = value;
  }
  public get symbols(): string[] {
    return this._symbols.value;
  }
  //#endregion

  constructor(regexp: string = `\`\\;\'\"<>`) {
    for (let i = 0; i <= regexp.length; i++) {
      if (regexp[i]) {
        this._symbols.value.push(regexp[i]);
      }
    }
    this._regexp.value = regexp;
  }

  input = (event: InputEvent) => {
    const ele = event.target as HTMLInputElement;

    if (!ele) {
      return;
    }

    const characters: string = '';
    const defaultStr = String.raw`${this._regexp.value}`;
    const reg = new RegExp(String.raw`[${defaultStr}${characters}]`, 'g');
    this._value.value = this._value.value.replace(reg, '');
    // 过滤空格
    this._value.value = this._value.value.replace(/\s+/g, '');
  };

  addSymbol() {
    if (!this._symbolValue.value) {
      message.error('请输入符号');
      return;
    }
    const reg = RegExp(
      /[(\ )(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\-)(\_)(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\')(\")(\,)(\.)(\/)(\<)(\>)(\?)(\)]+/
    );
    if (!reg.test(this._symbolValue.value)) {
      message.error('请输入正确的符号');
      return;
    }
    if (this._symbols.value.includes(this._symbolValue.value)) {
      message.error('符号重复');
      return;
    }

    this._symbols.value.push(this._symbolValue.value);
    this._regexp.value = `${this._regexp.value}\\${this._symbolValue.value}`;

    this._symbolValue.value = '';
    this._value.value = '';
  }
}

export default TextFilterService;
