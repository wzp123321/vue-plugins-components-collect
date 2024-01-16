import { Component, OnInit, SkipSelf } from '@angular/core';
import { WP_IPlanInfo } from '../../work-plan.api';
import { WorkPlanFormService } from '../work-plan-form.service';

@Component({
  selector: 'ems-work-plan-form-basic',
  templateUrl: './work-plan-form-basic.component.html',
  styleUrls: ['./work-plan-form-basic.component.less'],
})
export class WorkPlanFormBasicComponent implements OnInit {
  public get isReadonly(): boolean {
    return this.service.isReadonly;
  }

  public get isInvalid(): boolean {
    return this.service.isInvalid;
  }

  public get item(): WP_IPlanInfo {
    return this.service.item;
  }

  public get descriptionCount(): string {
    return `${this.item?.description?.length ?? 0}/2000`;
  }

  constructor(@SkipSelf() private service: WorkPlanFormService) {}

  ngOnInit(): void {}

  public autoScroll(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    element.scrollTop = element.scrollHeight;
  }
}
