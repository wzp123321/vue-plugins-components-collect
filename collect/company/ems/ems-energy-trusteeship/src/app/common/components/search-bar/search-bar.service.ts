import { TSearchBarItem } from './search-bar.api';

export abstract class SearchBarService {
  public get items(): TSearchBarItem[] {
    return this._SearchBarItemList ?? [];
  }

  public abstract get isLoading(): boolean;

  constructor(protected _SearchBarItemList: TSearchBarItem[]) {}

  public abstract doSearch(): void;

  public doReset(): void {
    this.items.forEach((item) => item.reset());
  }
}
