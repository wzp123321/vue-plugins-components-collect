import { TestBed } from '@angular/core/testing';

import { MeasureLibraryDatabaseService } from './measure-library-database.service';

describe('MeasureLibraryDatabaseService', () => {
  let service: MeasureLibraryDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureLibraryDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
