import { TestBed } from '@angular/core/testing';

import { RESTfulService } from './restful.service';

describe('RESTfulService', () => {
  let service: RESTfulService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RESTfulService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
