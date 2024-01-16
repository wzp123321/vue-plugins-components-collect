import { TestBed } from '@angular/core/testing';

import { FreezerDatabaseService } from './freezer-database.service';

describe('FreezerDatabaseService', () => {
  let service: FreezerDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
