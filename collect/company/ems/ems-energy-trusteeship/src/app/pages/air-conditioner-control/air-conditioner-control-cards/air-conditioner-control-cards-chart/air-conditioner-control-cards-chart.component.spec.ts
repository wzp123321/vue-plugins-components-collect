import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlCardsChartComponent } from './air-conditioner-control-cards-chart.component';

describe('AirConditionerControlCardsChartComponent', () => {
  let component: AirConditionerControlCardsChartComponent;
  let fixture: ComponentFixture<AirConditionerControlCardsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlCardsChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlCardsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
