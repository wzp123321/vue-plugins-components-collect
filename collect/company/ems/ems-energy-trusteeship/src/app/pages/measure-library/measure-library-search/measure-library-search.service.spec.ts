import { TestBed } from '@angular/core/testing';

import { MeasureLibrarySearchService } from './measure-library-search.service';

describe('MeasureLibrarySearchService', () => {
  let service: MeasureLibrarySearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureLibrarySearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
