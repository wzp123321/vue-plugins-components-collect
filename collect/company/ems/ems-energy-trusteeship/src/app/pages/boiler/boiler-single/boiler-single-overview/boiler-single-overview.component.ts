import { Component, OnInit, Self } from '@angular/core';
import { FMixinAlpha } from 'src/app/core/color/color.api';
import { B_EfficiencyItem } from '../../boiler.api';
import { BoilerSingleOverviewService } from './boiler-single-overview.service';

const CARDS = [
  { id: 'cost', name: '单位蒸汽能源成本', unit: '元/kg', color: 'rgba(53, 129, 255, 1)' },
  { id: 'output', name: '蒸汽产出量', unit: 'kg', color: 'rgba(255, 145, 33, 1)' },
  { id: 'consumption', name: '燃气消耗量', unit: 'm³', color: 'rgba(0, 178, 97, 1)' },
];

@Component({
  selector: 'ems-boiler-single-overview',
  templateUrl: './boiler-single-overview.component.html',
  styleUrls: ['./boiler-single-overview.component.less'],
  providers: [BoilerSingleOverviewService],
})
export class BoilerSingleOverviewComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get cards() {
    return CARDS;
  }

  constructor(@Self() private service: BoilerSingleOverviewService) {}

  ngOnInit(): void {}

  public mapPowerValue(key: keyof B_EfficiencyItem): string {
    return this.service.values?.[key] ?? null;
  }

  public mixinAlpha(color: string, alpha: number = 0): string {
    return FMixinAlpha(color, alpha);
  }
}
