import { TestBed } from '@angular/core/testing';

import { MeasureLibraryCommunicationService } from './measure-library-communication.service';

describe('MeasureLibraryCommunicationService', () => {
  let service: MeasureLibraryCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeasureLibraryCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
