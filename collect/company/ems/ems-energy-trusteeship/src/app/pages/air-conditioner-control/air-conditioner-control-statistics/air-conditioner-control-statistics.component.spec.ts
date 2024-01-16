import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlStatisticsComponent } from './air-conditioner-control-statistics.component';

describe('AirConditionerControlStatisticsComponent', () => {
  let component: AirConditionerControlStatisticsComponent;
  let fixture: ComponentFixture<AirConditionerControlStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlStatisticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
