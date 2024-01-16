import { Component, OnInit, Self } from '@angular/core';
import { FMixinAlpha } from 'src/app/core/color/color.api';
import { F_IPowerItem } from '../../freezer.api';
import { FreezerSingleOverviewService } from './freezer-single-overview.service';

const CARDS = [
  { id: 'average', name: '功率平均值', unit: 'kW', color: 'rgba(53, 129, 255, 1)' },
  { id: 'min', name: '功率最小值', unit: 'kW', color: 'rgba(255, 145, 33, 1)' },
  { id: 'max', name: '功率最大值', unit: 'kW', color: 'rgba(0, 178, 97, 1)' },
];

@Component({
  selector: 'ems-freezer-single-overview',
  templateUrl: './freezer-single-overview.component.html',
  styleUrls: ['./freezer-single-overview.component.less'],
  providers: [FreezerSingleOverviewService],
})
export class FreezerSingleOverviewComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get cards() {
    return CARDS;
  }

  constructor(@Self() private service: FreezerSingleOverviewService) {}

  ngOnInit(): void {}

  public mapPowerValue(key: keyof F_IPowerItem): string {
    return this.service.values?.[key] ?? null;
  }

  public mixinAlpha(color: string, alpha: number = 0): string {
    return FMixinAlpha(color, alpha);
  }
}
