import { Component, OnInit, Self } from '@angular/core';
import { ACC_EEfficiencyRank, ACC_ICardItem, ACC_IEfficiencyRatio } from '../air-conditioner-control.api';
import { AirConditionerControlCardsService } from './air-conditioner-control-cards.service';

const COLORS = ['rgba(245, 34, 45, 1)', 'rgba(250, 140, 22, 1)', 'rgba(82, 196, 26, 1)', 'rgba(22, 144, 255, 1)'];
const GRADIENT_COLORS = [
  'rgba(255, 98, 120, 1)',
  'rgba(255, 200, 104, 1)',
  'rgba(138, 228, 56, 1)',
  'rgba(72, 168, 255, 1)',
];
const AXIS_OPTIONS = { MIN: 0, MAX: 10 };

@Component({
  selector: 'ems-air-conditioner-control-cards',
  templateUrl: './air-conditioner-control-cards.component.html',
  styleUrls: ['./air-conditioner-control-cards.component.less'],
  providers: [AirConditionerControlCardsService],
})
export class AirConditionerControlCardsComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get radioCard(): ACC_IEfficiencyRatio {
    return this.service.radioCard as ACC_IEfficiencyRatio;
  }
  public get temperatureCard(): ACC_ICardItem {
    return this.service.temperatureCard as ACC_ICardItem;
  }
  public get loadCard(): ACC_ICardItem {
    return this.service.loadCard as ACC_ICardItem;
  }
  public get hostCard(): ACC_ICardItem {
    return this.service.hostCard as ACC_ICardItem;
  }
  public get childCards(): ACC_ICardItem[] {
    return this.service.childCards as ACC_ICardItem[];
  }

  public get colors(): string[] {
    return COLORS;
  }

  private _target: HTMLDivElement = null;

  public canShowPanel = false;
  public panelOption = { primary: false, code: null as string };

  constructor(@Self() private service: AirConditionerControlCardsService) {}

  ngOnInit(): void {}

  public openPanel(element: HTMLDivElement, code: string): void {
    if (element) {
      this._target = element;
      this.panelOption.primary = element.hasAttribute('primary');
      this.panelOption.code = code;
      this.canShowPanel = true;
    }
  }

  public closePanel(event?: MouseEvent): void {
    if (event) {
      (event.target as HTMLDivElement)?.className?.includes?.('backdrop') && this.resetPanel();
    } else {
      this.resetPanel();
    }
  }

  public mapRank(rank: ACC_EEfficiencyRank): string {
    return ACC_EEfficiencyRank[rank];
  }

  public mapRankColor(rank: ACC_EEfficiencyRank): string {
    switch (rank) {
      case ACC_EEfficiencyRank.差:
        return COLORS[0];
      case ACC_EEfficiencyRank.中:
        return COLORS[1];
      case ACC_EEfficiencyRank.良:
        return COLORS[2];
      case ACC_EEfficiencyRank.优:
        return COLORS[3];
      default:
        return null;
    }
  }

  public mapAxisWidth(value: number): number {
    if (value < AXIS_OPTIONS.MIN) {
      return 0;
    } else if (value > AXIS_OPTIONS.MAX) {
      return 100;
    } else {
      return ((value - AXIS_OPTIONS.MIN) / (AXIS_OPTIONS.MAX - AXIS_OPTIONS.MIN)) * 100;
    }
  }

  public mapAxisBarColor(rank: ACC_EEfficiencyRank): string {
    switch (rank) {
      case ACC_EEfficiencyRank.差:
        return `linear-gradient(to right, ${COLORS[0]}, ${GRADIENT_COLORS[0]})`;
      case ACC_EEfficiencyRank.中:
        return `linear-gradient(to right, ${COLORS[1]}, ${GRADIENT_COLORS[1]})`;
      case ACC_EEfficiencyRank.良:
        return `linear-gradient(to right, ${COLORS[2]}, ${GRADIENT_COLORS[2]})`;
      case ACC_EEfficiencyRank.优:
        return `linear-gradient(to right, ${COLORS[3]}, ${GRADIENT_COLORS[3]})`;
      default:
        return null;
    }
  }

  public mapAnchor(): [number, number] {
    const rect = this._target?.getBoundingClientRect();
    if (rect) {
      return [rect.left, rect.top - 2];
    }
    return [0, 0];
  }

  private resetPanel(): void {
    this._target = null;
    this.canShowPanel = false;
    this.panelOption = { primary: false, code: null as string };
  }
}
