import { Component, OnInit } from '@angular/core';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { BoilerSearchService } from './boiler-search.service';

@Component({
  selector: 'ems-boiler-search',
  templateUrl: './boiler-search.component.html',
  styleUrls: ['./boiler-search.component.less'],
  providers: [BoilerSearchService],
  viewProviders: [{ provide: SearchBarService, useExisting: BoilerSearchService }],
})
export class BoilerSearchComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
