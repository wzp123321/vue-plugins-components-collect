import { Injectable } from '@angular/core';
import { ACC_ICardItem, ACC_IEfficiencyRatio } from '../air-conditioner-control.api';
import { AirConditionerControlDatabaseService } from '../service/air-conditioner-control-database.service';

@Injectable()
export class AirConditionerControlCardsService {
  public get isLoading(): boolean {
    return this.sDatabase.refParamCardList$.isLoading && this.sDatabase.refLoadRateCard$.isLoading;
  }

  public get radioCard(): Partial<ACC_IEfficiencyRatio> {
    return this.sDatabase.refParamCardList$.value?.ratio ?? { name: '综合能效比' };
  }
  public get temperatureCard(): Partial<ACC_ICardItem> {
    return this.sDatabase.refParamCardList$.value?.temperature ?? { name: '冷水出水温度' };
  }
  public get loadCard(): Partial<ACC_ICardItem> {
    return this.sDatabase.refParamCardList$.value?.load ?? { name: '单位面积冷负荷' };
  }
  public get hostCard(): Partial<ACC_ICardItem> {
    return this.sDatabase.refLoadRateCard$.value?.host ?? { name: '主机平均负载率' };
  }
  public get childCards(): Partial<ACC_ICardItem>[] {
    return this.sDatabase.refLoadRateCard$.value?.children ?? [];
  }

  constructor(private sDatabase: AirConditionerControlDatabaseService) {}
}
