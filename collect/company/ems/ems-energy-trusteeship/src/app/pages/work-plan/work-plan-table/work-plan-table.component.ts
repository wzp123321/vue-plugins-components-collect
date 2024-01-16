import { Component, OnInit, Self } from '@angular/core';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import {
  WP_EExecutionPeriod,
  WP_EPlanState,
  WP_IPlanItem,
} from '../work-plan.api';
import { WorkPlanTableService } from './work-plan-table.service';

@Component({
  selector: 'ems-work-plan-table',
  templateUrl: './work-plan-table.component.html',
  styleUrls: ['./work-plan-table.component.less'],
  providers: [WorkPlanTableService],
  viewProviders: [
    { provide: PaginationService, useExisting: WorkPlanTableService },
  ],
})
export class WorkPlanTableComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public set index(v: number) {
    this.service.index = v;
  }
  public get index(): number {
    return this.service.index;
  }

  public set size(v: number) {
    this.service.size = v;
  }
  public get size(): number {
    return this.service.size;
  }

  public get total(): number {
    return this.service.total;
  }

  public get list(): WP_IPlanItem[] {
    return this.service.list;
  }

  constructor(@Self() private service: WorkPlanTableService) {}

  ngOnInit(): void {}

  public toDelete(id: number): void {
    if (this.isLoading) {
      return;
    }

    this.service.doDelete(id);
  }

  public toChangeState(id: number, state: WP_EPlanState) {
    if (this.isLoading) {
      return;
    }

    switch (state) {
      case WP_EPlanState.正在执行:
        this.service.doUpdateState(id, WP_EPlanState.暂停);
        break;
      case WP_EPlanState.暂停:
        this.service.doUpdateState(id, WP_EPlanState.正在执行);
        break;
      default:
        break;
    }
  }

  public mapStateStyleActive(state: WP_EPlanState): boolean {
    if (state === WP_EPlanState.正在执行) {
      return true;
    }
    return false;
  }

  public mapStateStyleDanger(state: WP_EPlanState): boolean {
    if (state === WP_EPlanState.暂停) {
      return true;
    }
    return false;
  }

  public mapUpdateCapability(state: WP_EPlanState): boolean {
    if (state === WP_EPlanState.已完成) {
      return false;
    }
    return true;
  }

  public mapDeleteConfirmTitle(state: WP_EPlanState): string {
    if (state === WP_EPlanState.正在执行) {
      return '该计划正在执行中，确认删除该计划？';
    }
    return '确认删除该计划？';
  }

  public mapMoreButtonVisibility(state: WP_EPlanState): boolean {
    if ([WP_EPlanState.正在执行, WP_EPlanState.暂停].includes(state)) {
      return true;
    }
    return false;
  }

  public mapMoreButtonText(state: WP_EPlanState): string {
    switch (state) {
      case WP_EPlanState.正在执行:
        return '暂停';
      case WP_EPlanState.暂停:
        return '启动';
      default:
        return '';
    }
  }

  public mapPeriod(v: WP_EExecutionPeriod): string {
    return WP_EExecutionPeriod[v];
  }

  public mapState(v: WP_EPlanState): string {
    return WP_EPlanState[v];
  }
}
