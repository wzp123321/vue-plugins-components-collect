import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmPeriodWorkCardComponent } from './em-period-work-card.component';

describe('EmPeriodWorkCardComponent', () => {
  let component: EmPeriodWorkCardComponent;
  let fixture: ComponentFixture<EmPeriodWorkCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmPeriodWorkCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmPeriodWorkCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
