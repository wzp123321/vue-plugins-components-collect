import { TestBed } from '@angular/core/testing';

import { MeasureLibraryFormService } from './measure-library-form.service';

describe('MeasureLibraryFormService', () => {
  let service: MeasureLibraryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureLibraryFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
