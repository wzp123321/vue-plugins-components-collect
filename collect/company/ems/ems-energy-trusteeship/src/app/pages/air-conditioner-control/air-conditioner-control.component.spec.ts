import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlComponent } from './air-conditioner-control.component';

describe('AirConditionerControlComponent', () => {
  let component: AirConditionerControlComponent;
  let fixture: ComponentFixture<AirConditionerControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
