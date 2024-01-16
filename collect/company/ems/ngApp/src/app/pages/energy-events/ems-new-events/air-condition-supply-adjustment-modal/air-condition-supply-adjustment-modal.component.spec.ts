import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionSupplyAdjustmentModalComponent } from './air-condition-supply-adjustment-modal.component';

describe('AirConditionSupplyAdjustmentModalComponent', () => {
  let component: AirConditionSupplyAdjustmentModalComponent;
  let fixture: ComponentFixture<AirConditionSupplyAdjustmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionSupplyAdjustmentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionSupplyAdjustmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
