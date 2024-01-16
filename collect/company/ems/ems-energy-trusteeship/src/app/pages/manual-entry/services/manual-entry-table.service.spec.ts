import { TestBed } from '@angular/core/testing';

import { ManualEntryTableService } from './manual-entry-table.service';

describe('ManualEntryTableService', () => {
  let service: ManualEntryTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualEntryTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
