import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmDailyWorkCardComponent } from './em-daily-work-card.component';

describe('EmDailyWorkCardComponent', () => {
  let component: EmDailyWorkCardComponent;
  let fixture: ComponentFixture<EmDailyWorkCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmDailyWorkCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmDailyWorkCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
