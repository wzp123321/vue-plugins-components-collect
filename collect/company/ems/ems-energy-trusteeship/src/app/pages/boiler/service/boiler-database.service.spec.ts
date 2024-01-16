import { TestBed } from '@angular/core/testing';

import { BoilerDatabaseService } from './boiler-database.service';

describe('BoilerDatabaseService', () => {
  let service: BoilerDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
