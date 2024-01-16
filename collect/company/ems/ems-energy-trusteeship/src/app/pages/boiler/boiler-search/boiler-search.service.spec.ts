import { TestBed } from '@angular/core/testing';

import { BoilerSearchService } from './boiler-search.service';

describe('BoilerSearchService', () => {
  let service: BoilerSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
