import { ref } from 'vue';
import { BehaviorSubject, Observable } from 'rxjs';
import { FGetStorageData } from '@/utils/token';
import { EA_ST_TABS } from './ea-switch-tab.api';

class SwitchTabService {
  //#region
  private _anomalyTabResult$ = new BehaviorSubject<string>(EA_ST_TABS.实时异常);

  public get anomalyTabResult$() {
    return this._anomalyTabResult$ as unknown as Observable<string>;
  }
  //#region
  private _tabOptions = ref<{ label: string; value: string }[]>([]);

  private _currentTab = ref<string>('');

  private _activeIndex = ref<number>(0);

  public get tabOptions(): { label: string; value: string }[] {
    return this._tabOptions.value;
  }

  public get currentTab(): string {
    return this._currentTab.value;
  }

  public get activeIndex(): number {
    return this._activeIndex.value;
  }
  //#endregion
  setTab(value: string, index: number) {
    if (value !== this._currentTab.value) {
      this._anomalyTabResult$.next(value);
    }
    this._activeIndex.value = index;
    this._currentTab.value = value;
  }

  // 从缓存获取有权限的tab，并设置第一个有权限的菜单
  mapAuthorityTab() {
    let tabs = FGetStorageData('ems-anomaly-authority-buttons');
    tabs = !!tabs ? JSON.parse(tabs) : [];

    // 如果按钮包含边界异常 则展示边界异常
    const options = Object.entries(EA_ST_TABS)
      .filter(([k, v]) => v !== EA_ST_TABS.边界异常 || (v === EA_ST_TABS.边界异常 && tabs?.includes('边界异常')))
      .map(([k, v]) => ({ label: k, value: v }));
    this._tabOptions.value = options;

    this.setTab(EA_ST_TABS.实时异常, 0);
  }
}

export default new SwitchTabService();
