import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkRecordCalendarComponent } from './work-record-calendar.component';

describe('WorkRecordCalendarComponent', () => {
  let component: WorkRecordCalendarComponent;
  let fixture: ComponentFixture<WorkRecordCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkRecordCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkRecordCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
