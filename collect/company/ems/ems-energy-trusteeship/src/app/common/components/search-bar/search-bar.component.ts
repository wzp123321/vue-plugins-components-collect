import { Component, OnInit, Optional, SkipSelf } from '@angular/core';
import { ESearchBarItemType, TSearchBarItem } from './search-bar.api';
import { SearchBarService } from './search-bar.service';

@Component({
  selector: 'ems-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.less'],
})
export class SearchBarComponent implements OnInit {
  public get items(): TSearchBarItem[] {
    return this.service?.items ?? [];
  }

  public get isLoading(): boolean {
    return this.service?.isLoading ?? true;
  }

  //#region 获取搜索栏允许展示子元素所对应的枚举类型值
  public get typeInput(): ESearchBarItemType.输入框 {
    return ESearchBarItemType.输入框;
  }
  public get typeSelect(): ESearchBarItemType.下拉选择框 {
    return ESearchBarItemType.下拉选择框;
  }
  public get typeTreeSelect(): ESearchBarItemType.下拉树选择框 {
    return ESearchBarItemType.下拉树选择框;
  }
  public get typeDatePicker(): ESearchBarItemType.日期选择框 {
    return ESearchBarItemType.日期选择框;
  }
  //#endregion

  constructor(@Optional() @SkipSelf() private service: SearchBarService) {}

  ngOnInit(): void {}

  //#region 搜索功能
  public toSearch(): void {
    if (this.isLoading) {
      return;
    }

    this.service.doSearch();
  }

  public toReset(): void {
    if (this.isLoading) {
      return;
    }

    this.service.doReset();
    this.service.doSearch();
  }
  //#endregion
}
