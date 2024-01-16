import { Component, OnInit, Self } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WP_EPlanState } from '../work-plan.api';
import { WorkPlanFormService } from './work-plan-form.service';

@Component({
  selector: 'ems-work-plan-form',
  templateUrl: './work-plan-form.component.html',
  styleUrls: ['./work-plan-form.component.less'],
  providers: [WorkPlanFormService],
})
export class WorkPlanFormComponent implements OnInit {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isReadonly(): boolean {
    return this.service.isReadonly;
  }

  public get showSearch(): boolean {
    return this.service.showSearch;
  }

  public title: string = null;
  public id: string = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Self() private service: WorkPlanFormService
  ) {}

  ngOnInit(): void {
    this.handleQueryParams();
  }

  public goBack(): void {
    if (this.isLoading) {
      return;
    }

    this.router.navigate(['/eetWorkPlan']);
  }

  public async toSave(): Promise<void> {
    if (this.isLoading || this.isReadonly) {
      return;
    }

    if (this.service.item.state !== WP_EPlanState.已完成) {
      try {
        let success = false;
        if (this.id) {
          success = await this.service.doUpdate();
        } else {
          success = await this.service.doCreate();
        }

        if (success) {
          this.goBack();
        }
      } catch (error) {
        console.warn(error);
      }
    }
  }

  private handleQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    this.title = params.get('title') ?? null;
    this.id = params.get('id');
    this.service.title = this.title;
    this.id && this.service.doRetrieve(+this.id);
    params.get('readonly') === 'true' && (this.service.isReadonly = true);
  }
}
