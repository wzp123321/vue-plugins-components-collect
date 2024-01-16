import { Component, OnInit, Self } from '@angular/core';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { EnergyEventSearchService } from './energy-event-search.service';

@Component({
  selector: 'ems-energy-event-search',
  templateUrl: './energy-event-search.component.html',
  styleUrls: ['./energy-event-search.component.less'],
  providers: [EnergyEventSearchService],
  viewProviders: [
    { provide: SearchBarService, useExisting: EnergyEventSearchService },
  ],
})
export class EnergyEventSearchComponent implements OnInit {
  constructor(@Self() private service: EnergyEventSearchService) {}

  ngOnInit(): void {}
}
