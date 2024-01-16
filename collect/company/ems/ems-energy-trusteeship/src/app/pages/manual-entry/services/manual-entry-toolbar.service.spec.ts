import { TestBed } from '@angular/core/testing';

import { ManualEntryToolbarService } from './manual-entry-toolbar.service';

describe('ManualEntryToolbarService', () => {
  let service: ManualEntryToolbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManualEntryToolbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
