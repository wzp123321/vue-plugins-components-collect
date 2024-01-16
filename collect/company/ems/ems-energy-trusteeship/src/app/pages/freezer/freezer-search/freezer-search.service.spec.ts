import { TestBed } from '@angular/core/testing';

import { FreezerSearchService } from './freezer-search.service';

describe('FreezerSearchService', () => {
  let service: FreezerSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
