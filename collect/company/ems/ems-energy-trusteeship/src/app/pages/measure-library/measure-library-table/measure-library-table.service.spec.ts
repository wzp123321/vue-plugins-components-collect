import { TestBed } from '@angular/core/testing';

import { MeasureLibraryTableService } from './measure-library-table.service';

describe('MeasureLibraryTableService', () => {
  let service: MeasureLibraryTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureLibraryTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
