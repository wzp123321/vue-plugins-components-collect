import { TestBed } from '@angular/core/testing';

import { ManualEntryService } from './manual-entry.service';

describe('ManualEntryService', () => {
  let service: ManualEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
