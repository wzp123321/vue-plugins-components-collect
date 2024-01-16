import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlListMoreComponent } from './air-conditioner-control-list-more.component';

describe('AirConditionerControlListMoreComponent', () => {
  let component: AirConditionerControlListMoreComponent;
  let fixture: ComponentFixture<AirConditionerControlListMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlListMoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlListMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
