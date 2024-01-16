import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventFormComponent } from './energy-event-form.component';

describe('EnergyEventFormComponent', () => {
  let component: EnergyEventFormComponent;
  let fixture: ComponentFixture<EnergyEventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
