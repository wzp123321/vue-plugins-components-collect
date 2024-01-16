import { TestBed } from '@angular/core/testing';

import { FreezerSingleParameterService } from './freezer-single-parameter.service';

describe('FreezerSingleParameterService', () => {
  let service: FreezerSingleParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerSingleParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
