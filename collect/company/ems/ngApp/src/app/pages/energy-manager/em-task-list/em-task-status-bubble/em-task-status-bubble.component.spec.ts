import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmTaskStatusBubbleComponent } from './em-task-status-bubble.component';

describe('EmTaskStatusBubbleComponent', () => {
  let component: EmTaskStatusBubbleComponent;
  let fixture: ComponentFixture<EmTaskStatusBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmTaskStatusBubbleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmTaskStatusBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
