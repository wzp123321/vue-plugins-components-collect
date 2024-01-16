import { Component, OnInit, Self } from '@angular/core';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { WorkPlanSearchService } from './work-plan-search.service';

@Component({
  selector: 'ems-work-plan-search',
  templateUrl: './work-plan-search.component.html',
  styleUrls: ['./work-plan-search.component.less'],
  providers: [WorkPlanSearchService],
  viewProviders: [{ provide: SearchBarService, useExisting: WorkPlanSearchService }],
})
export class WorkPlanSearchComponent implements OnInit {
  constructor(@Self() private service: WorkPlanSearchService) {}

  ngOnInit(): void {}
}
