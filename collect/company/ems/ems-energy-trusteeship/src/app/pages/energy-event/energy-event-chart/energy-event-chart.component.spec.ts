import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventChartComponent } from './energy-event-chart.component';

describe('EnergyEventChartComponent', () => {
  let component: EnergyEventChartComponent;
  let fixture: ComponentFixture<EnergyEventChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
