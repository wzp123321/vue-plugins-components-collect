import { TestBed } from '@angular/core/testing';

import { FreezerCommunicationService } from './freezer-communication.service';

describe('FreezerCommunicationService', () => {
  let service: FreezerCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreezerCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
