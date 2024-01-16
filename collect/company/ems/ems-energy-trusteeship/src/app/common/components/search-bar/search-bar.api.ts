import { EventEmitter } from '@angular/core';
import { NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

export enum ESearchBarItemType {
  输入框 = 1,
  下拉选择框,
  下拉树选择框,
  日期选择框,
}

export type TSearchBarItem = CSearchBarItem & { [key: string]: any };

interface ISearchBarItem {
  type: ESearchBarItemType;
  width?: number;
  height?: number;
  name: string;
  model: any;
  placeholder?: string;
  disabled?: boolean;
  canClear?: boolean;
}

class CSearchBarItem<T = any> implements ISearchBarItem {
  private _Model: T = null;
  public modelChangeHandler?: (v: T) => void;

  public get model(): T {
    return this._Model;
  }

  public set model(v: T) {
    if (v === this._Model) {
      return;
    }
    if (this.modelChangeHandler) {
      this.modelChangeHandler(v);
    }
    this._Model = v;
  }

  public width?: number;
  public height?: number;

  public disabled?: boolean;
  public canClear?: boolean;

  public placeholder?: string;

  constructor(
    public readonly type: ESearchBarItemType,
    public name: string,
    private readonly _Initial_Value: T = null,
    config?: { width?: number; height?: number; placeholder?: string; disabled?: boolean; canClear?: boolean }
  ) {
    this._Model = this._Initial_Value;
    this.width = config?.width || null;
    this.height = config?.height || null;
    this.placeholder = config?.placeholder ?? '';
    this.disabled = config?.disabled ?? false;
    this.canClear = config?.canClear ?? false;
  }

  public reset(): void {
    this.model = this._Initial_Value;
  }
}

export class CSearchBarItem_Input extends CSearchBarItem<string> {
  constructor(
    name: string,
    init: string,
    public max: number = null,
    config?: { width?: number; height?: number; placeholder?: string; disabled?: boolean }
  ) {
    super(ESearchBarItemType.输入框, name, init, config);
    this.width = config?.width ?? 320;
  }
}
export class CSearchBarItem_Select<T> extends CSearchBarItem<T> {
  public readonly multiple = false;

  constructor(
    name: string,
    init: T,
    public options: {
      label: string;
      value: T;
      disabled?: boolean;
    }[] = [],
    config?: {
      width?: number;
      height?: number;
      placeholder?: string;
      disabled?: boolean;
      canClear?: boolean;
    }
  ) {
    super(ESearchBarItemType.下拉选择框, name, init, config);
    this.width = config?.width ?? 146;
  }

  public onAdd(element: NzSelectComponent): void {}
}
export class CSearchBarItem_MultipleSelect<T> extends CSearchBarItem<T[]> {
  public readonly multiple = true;
  public readonly eventLimitExceed = new EventEmitter<void>();

  private readonly _max: number = null;

  constructor(
    name: string,
    init: T[],
    public options: {
      label: string;
      value: T;
      disabled?: boolean;
    }[] = [],
    config?: {
      width?: number;
      height?: number;
      placeholder?: string;
      disabled?: boolean;
      canClear?: boolean;
      max?: number;
    }
  ) {
    super(ESearchBarItemType.下拉选择框, name, init, config);
    this.width = config?.width ?? 380;
    this.canClear = true;
    config?.max > 0 && (this._max = Math.floor(config?.max));
  }

  public onAdd(element: NzSelectComponent): void {
    if (this._max) {
      if (this.model.length > this._max) {
        const values = element.listOfValue;
        const items = element.listOfTopItem;
        values.splice(this._max, values.length - this._max);
        items.splice(this._max, items.length - this._max);

        this.eventLimitExceed.emit();
      }
    }
  }
}

export class CSearchBarItem_TreeSelect extends CSearchBarItem<string> {
  public readonly multiple: false = false;

  constructor(
    name: string,
    init: string,
    public nodes: NzTreeNodeOptions[] = [],
    public expands: string[] = [],
    config?: {
      width?: number;
      height?: number;
      placeholder?: string;
      disabled?: boolean;
      canClear?: boolean;
    }
  ) {
    super(ESearchBarItemType.下拉树选择框, name, init, config);
    this.width = config?.width ?? 146;
  }
}
export class CSearchBarItem_MultipleTreeSelect extends CSearchBarItem<string[]> {
  public readonly multiple = true;

  constructor(
    name: string,
    init: string[],
    public nodes: NzTreeNodeOptions[] = [],
    public expands: string[] = [],
    config?: {
      width?: number;
      height?: number;
      placeholder?: string;
      disabled?: boolean;
      canClear?: boolean;
    }
  ) {
    super(ESearchBarItemType.下拉树选择框, name, init, config);
    this.width = config?.width ?? 380;
    this.canClear = true;
  }
}

export class CSearchBarItem_DatePicker extends CSearchBarItem<Date> {
  public disabledDate: (current: Date) => boolean;

  constructor(
    name: string,
    init: Date,
    public mode: 'year' | 'month' | 'week' | 'date' = 'date',
    config?: { width?: number; height?: number; placeholder?: string; disabled?: boolean; canClear?: boolean }
  ) {
    super(ESearchBarItemType.日期选择框, name, init, config);
    this.width = config?.width ?? 146;
  }
}
