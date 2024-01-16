/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EmShareService } from './em-share.service';

describe('Service: EmShare', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmShareService]
    });
  });

  it('should ...', inject([EmShareService], (service: EmShareService) => {
    expect(service).toBeTruthy();
  }));
});
