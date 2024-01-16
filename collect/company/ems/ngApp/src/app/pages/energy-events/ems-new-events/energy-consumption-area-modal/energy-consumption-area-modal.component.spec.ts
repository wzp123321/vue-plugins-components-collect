import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyConsumptionAreaModalComponent } from './energy-consumption-area-modal.component';

describe('EnergyConsumptionAreaModalComponent', () => {
  let component: EnergyConsumptionAreaModalComponent;
  let fixture: ComponentFixture<EnergyConsumptionAreaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyConsumptionAreaModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyConsumptionAreaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
