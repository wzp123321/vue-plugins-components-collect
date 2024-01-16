import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlPredictComponent } from './air-conditioner-control-predict.component';

describe('AirConditionerControlPredictComponent', () => {
  let component: AirConditionerControlPredictComponent;
  let fixture: ComponentFixture<AirConditionerControlPredictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlPredictComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlPredictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
