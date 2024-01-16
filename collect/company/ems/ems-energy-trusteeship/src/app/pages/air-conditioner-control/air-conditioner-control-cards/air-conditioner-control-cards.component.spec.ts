import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirConditionerControlCardsComponent } from './air-conditioner-control-cards.component';

describe('AirConditionerControlCardsComponent', () => {
  let component: AirConditionerControlCardsComponent;
  let fixture: ComponentFixture<AirConditionerControlCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirConditionerControlCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirConditionerControlCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
