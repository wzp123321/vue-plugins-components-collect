import { TestBed } from '@angular/core/testing';

import { MeasureLibraryToolbarService } from './measure-library-toolbar.service';

describe('MeasureLibraryToolbarService', () => {
  let service: MeasureLibraryToolbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureLibraryToolbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
