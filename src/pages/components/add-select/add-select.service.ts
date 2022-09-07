import { cloneDeep } from 'lodash';
import { ref } from 'vue';
class AddSelectService {
  //#region
  private _value = ref<string>('');

  private _visible = ref<boolean>(false);

  private _list = ref<string[]>([]);

  private dataSource: string[] = [];

  private _originValue: string = '';

  public get value(): string {
    return this._value.value;
  }
  public set value(value: string) {
    this._value.value = value ?? '';
  }
  public get visible(): boolean {
    return this._visible.value;
  }
  public set visible(value: boolean) {
    this._visible.value = value ?? '';
  }
  public get list(): string[] {
    return this._list.value;
  }
  public get originValue(): string {
    return this._originValue;
  }
  //#endregion

  constructor() {
    this._value.value = '';
    this._list.value = [];
  }

  show(value: string, list: string[]) {
    this._value.value = value;
    this._list.value = list;
    this.dataSource = list;

    this._originValue = value;
  }

  hide = () => {
    this._list.value = cloneDeep(this.dataSource);
  };

  select(value: string) {
    this._list.value = cloneDeep(this.dataSource);
    this._value.value = value;

    this._visible.value = false;
  }

  input() {
    this._list.value = this.dataSource.filter(item => {
      return item.includes(this._value.value);
    });
  }
}

export default new AddSelectService();
