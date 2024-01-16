import { Component, OnInit, Self } from '@angular/core';
import { F_EEfficiencyRank, F_IBenchmarkItem } from '../../freezer.api';
import { FreezerSingleBenchmarkingService } from './freezer-single-benchmarking.service';

const COLORS = ['rgba(0, 122, 66, 1)', 'rgba(0, 178, 97, 1)', 'rgba(255, 203, 32, 1)', 'rgba(255, 145, 32, 1)'];

@Component({
  selector: 'ems-freezer-single-benchmarking',
  templateUrl: './freezer-single-benchmarking.component.html',
  styleUrls: ['./freezer-single-benchmarking.component.less'],
  providers: [FreezerSingleBenchmarkingService],
})
export class FreezerSingleBenchmarkingComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get standards(): F_IBenchmarkItem[] {
    return this.service.standards;
  }
  public get current(): F_IBenchmarkItem {
    return this.service.current as F_IBenchmarkItem;
  }

  public get colors() {
    return COLORS;
  }
  public get colorLow(): string {
    return this.colors[0];
  }
  public get colorHigh(): string {
    return this.colors[this.standards.length - 1];
  }
  public get colorAxis(): string {
    return `linear-gradient(${this.colors.slice(0, this.standards.length).join(', ')}) 1`;
  }

  constructor(@Self() private service: FreezerSingleBenchmarkingService) {}

  ngOnInit(): void {}

  public mapBenchmarkRank(level: F_EEfficiencyRank): string {
    return F_EEfficiencyRank[level];
  }

  public mapStandardBarWidth(index: number = 0, padding: number = 0): string {
    if ((index ?? 0) > this.standards.length - 1) {
      return '100%';
    }

    const base = 40;
    return `calc(${base + ((100 - base) * index) / (this.standards.length - 1)}% - ${padding ?? 0}px)`;
  }
}
