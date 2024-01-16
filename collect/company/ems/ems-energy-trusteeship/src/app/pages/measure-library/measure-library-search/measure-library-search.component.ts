import { Component, OnInit, Self } from '@angular/core';
import { SearchBarService } from 'src/app/common/components/search-bar/search-bar.service';
import { MeasureLibrarySearchService } from './measure-library-search.service';

@Component({
  selector: 'ems-measure-library-search',
  templateUrl: './measure-library-search.component.html',
  styleUrls: ['./measure-library-search.component.less'],
  providers: [MeasureLibrarySearchService],
  viewProviders: [{ provide: SearchBarService, useExisting: MeasureLibrarySearchService }],
})
export class MeasureLibrarySearchComponent implements OnInit {
  constructor(@Self() private service: MeasureLibrarySearchService) {}

  ngOnInit(): void {}
}
