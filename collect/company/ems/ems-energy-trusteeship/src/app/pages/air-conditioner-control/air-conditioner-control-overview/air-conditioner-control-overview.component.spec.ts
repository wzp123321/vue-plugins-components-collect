import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlOverviewComponent } from './air-conditioner-control-overview.component';

describe('AirConditionerControlOverviewComponent', () => {
  let component: AirConditionerControlOverviewComponent;
  let fixture: ComponentFixture<AirConditionerControlOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
