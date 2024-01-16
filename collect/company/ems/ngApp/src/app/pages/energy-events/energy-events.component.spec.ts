import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventsComponent } from './energy-events.component';

describe('EnergyEventsComponent', () => {
  let component: EnergyEventsComponent;
  let fixture: ComponentFixture<EnergyEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
