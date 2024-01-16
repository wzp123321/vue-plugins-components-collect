import { TestBed } from '@angular/core/testing';

import { BoilerMultipleParameterService } from './boiler-multiple-parameter.service';

describe('BoilerMultipleParameterService', () => {
  let service: BoilerMultipleParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerMultipleParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
