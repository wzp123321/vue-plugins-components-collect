import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventComponent } from './energy-event.component';

describe('EnergyEventComponent', () => {
  let component: EnergyEventComponent;
  let fixture: ComponentFixture<EnergyEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
