import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsCalendarComponent } from './ems-calendar.component';

describe('EmsCalendarComponent', () => {
  let component: EmsCalendarComponent;
  let fixture: ComponentFixture<EmsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
