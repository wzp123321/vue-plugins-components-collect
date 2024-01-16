import { TestBed } from '@angular/core/testing';

import { FreezerMultipleParameterService } from './freezer-multiple-parameter.service';

describe('FreezerMultipleParameterService', () => {
  let service: FreezerMultipleParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerMultipleParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
