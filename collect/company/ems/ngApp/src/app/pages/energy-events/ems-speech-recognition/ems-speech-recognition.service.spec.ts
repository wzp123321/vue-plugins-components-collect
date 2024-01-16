import { TestBed } from '@angular/core/testing';

import { EmsSpeechRecognitionService } from './ems-speech-recognition.service';

describe('EmsSpeechRecognitionService', () => {
  let service: EmsSpeechRecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmsSpeechRecognitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
