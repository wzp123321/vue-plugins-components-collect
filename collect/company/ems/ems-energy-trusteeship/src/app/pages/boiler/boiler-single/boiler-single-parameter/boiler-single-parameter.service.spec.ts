import { TestBed } from '@angular/core/testing';

import { BoilerSingleParameterService } from './boiler-single-parameter.service';

describe('BoilerSingleParameterService', () => {
  let service: BoilerSingleParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerSingleParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
