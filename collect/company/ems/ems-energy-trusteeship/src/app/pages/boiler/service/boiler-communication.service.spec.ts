import { TestBed } from '@angular/core/testing';

import { BoilerCommunicationService } from './boiler-communication.service';

describe('BoilerCommunicationService', () => {
  let service: BoilerCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoilerCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
