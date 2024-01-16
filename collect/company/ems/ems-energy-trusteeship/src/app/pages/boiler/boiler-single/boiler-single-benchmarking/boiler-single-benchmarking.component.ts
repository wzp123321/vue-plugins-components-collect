import { Component, OnInit, Self } from '@angular/core';
import { B_IBenchmarkItem, B_EEfficiencyRank } from '../../boiler.api';
import { BoilerSingleBenchmarkingService } from './boiler-single-benchmarking.service';

const COLORS = ['rgba(0, 122, 66, 1)', 'rgba(0, 178, 97, 1)', 'rgba(255, 145, 32, 1)'];

@Component({
  selector: 'ems-boiler-single-benchmarking',
  templateUrl: './boiler-single-benchmarking.component.html',
  styleUrls: ['./boiler-single-benchmarking.component.less'],
  providers: [BoilerSingleBenchmarkingService],
})
export class BoilerSingleBenchmarkingComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get standards(): B_IBenchmarkItem[] {
    return this.service.standards;
  }
  public get current(): B_IBenchmarkItem {
    return this.service.current as B_IBenchmarkItem;
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

  constructor(@Self() private service: BoilerSingleBenchmarkingService) {}

  ngOnInit(): void {}

  public mapBenchmarkRank(level: B_EEfficiencyRank): string {
    return B_EEfficiencyRank[level];
  }

  public mapStandardBarWidth(index: number = 0, padding: number = 0): string {
    if ((index ?? 0) > this.standards.length - 1) {
      return '100%';
    }

    const base = 40;
    return `calc(${base + ((100 - base) * index) / (this.standards.length - 1)}% - ${padding ?? 0}px)`;
  }
}
