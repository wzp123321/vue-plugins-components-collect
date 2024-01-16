import { TestBed } from '@angular/core/testing';

import { ManualEntryObjectService } from './manual-entry-object.service';

describe('ManualEntryObjectService', () => {
  let service: ManualEntryObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualEntryObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
