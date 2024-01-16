import { Component, OnDestroy, OnInit, Self } from '@angular/core';
import { timer } from 'rxjs';
import { ACC_ISystemItem } from './air-conditioner-control.api';
import { AirConditionerControlService } from './air-conditioner-control.service';

const TIMER = 5 * 60_000;

@Component({
  selector: 'ems-air-conditioner-control',
  templateUrl: './air-conditioner-control.component.html',
  styleUrls: ['./air-conditioner-control.component.less'],
  providers: [AirConditionerControlService],
})
export class AirConditionerControlComponent implements OnInit, OnDestroy {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get systems(): ACC_ISystemItem[] {
    return this.service.systemList;
  }

  public get currentSystem(): number {
    return this.service.system;
  }
  public get currentSystemName(): string {
    const name = this.service.systemList.find((system) => system.id === this.service.system)?.name ?? '';
    return Array.from(name.substring(0, 2)).join('\n');
  }

  public get title(): string {
    return this.service.title;
  }

  public canShowPanel = false;

  constructor(@Self() private service: AirConditionerControlService) {}

  ngOnInit(): void {
    timer(TIMER).subscribe(() => location.reload());
  }

  ngOnDestroy(): void {}

  public changePanelVisibility(): void {
    this.canShowPanel = !this.canShowPanel;
  }

  public closePanel(): void {
    this.canShowPanel = false;
  }

  public selectSystem(id: number): void {
    this.service.system = id;
  }
}
