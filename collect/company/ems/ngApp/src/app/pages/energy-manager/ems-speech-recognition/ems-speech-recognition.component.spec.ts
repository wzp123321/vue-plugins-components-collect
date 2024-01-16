import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsSpeechRecognitionComponent } from './ems-speech-recognition.component';

describe('EmsSpeechRecognitionComponent', () => {
  let component: EmsSpeechRecognitionComponent;
  let fixture: ComponentFixture<EmsSpeechRecognitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsSpeechRecognitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsSpeechRecognitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
