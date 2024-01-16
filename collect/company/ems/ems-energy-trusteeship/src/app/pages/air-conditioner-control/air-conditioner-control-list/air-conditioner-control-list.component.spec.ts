import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlListComponent } from './air-conditioner-control-list.component';

describe('AirConditionerControlListComponent', () => {
  let component: AirConditionerControlListComponent;
  let fixture: ComponentFixture<AirConditionerControlListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
