import { Component, OnInit } from '@angular/core';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { FreezerSearchService } from './freezer-search.service';

@Component({
  selector: 'ems-freezer-search',
  templateUrl: './freezer-search.component.html',
  styleUrls: ['./freezer-search.component.less'],
  providers: [FreezerSearchService],
  viewProviders: [{ provide: SearchBarService, useExisting: FreezerSearchService }],
})
export class FreezerSearchComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
