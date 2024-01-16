/*
 * @Description: 分摊规则服务
 * @Author: zpwan
 * @Date: 2022-10-08 09:26:25
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-10-08 11:06:47
 */
import { ref } from 'vue';
import { FSetSession } from '@/utils/token';
import { AD_TABS, AD_TAB_KEY } from './ad-share-rules.api';

export class AdShareRuleService {
  //#region
  private _tab = ref<number>(0);

  public get tab(): number {
    return this._tab.value;
  }
  //#endregion

  constructor() {
    this._tab.value = AD_TABS.分摊规则;
  }

  setTab(tab: number) {
    this._tab.value = tab;

    FSetSession(AD_TAB_KEY, String(tab));
  }
}
