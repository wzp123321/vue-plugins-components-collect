import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlListStrategyComponent } from './air-conditioner-control-list-strategy.component';

describe('AirConditionerControlListStrategyComponent', () => {
  let component: AirConditionerControlListStrategyComponent;
  let fixture: ComponentFixture<AirConditionerControlListStrategyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlListStrategyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlListStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
