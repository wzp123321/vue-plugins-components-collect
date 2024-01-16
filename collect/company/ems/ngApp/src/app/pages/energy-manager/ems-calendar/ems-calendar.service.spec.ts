import { TestBed } from '@angular/core/testing';

import { EmsCalendarService } from './ems-calendar.service';

describe('EmsCalendarService', () => {
  let service: EmsCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmsCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
