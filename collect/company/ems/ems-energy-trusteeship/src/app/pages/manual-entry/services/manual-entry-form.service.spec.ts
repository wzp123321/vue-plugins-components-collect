import { TestBed } from '@angular/core/testing';

import { ManualEntryFormService } from './manual-entry-form.service';

describe('ManualEntryFormService', () => {
  let service: ManualEntryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualEntryFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
