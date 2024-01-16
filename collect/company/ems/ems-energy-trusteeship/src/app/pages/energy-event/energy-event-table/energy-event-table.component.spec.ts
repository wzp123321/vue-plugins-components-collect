import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventTableComponent } from './energy-event-table.component';

describe('EnergyEventTableComponent', () => {
  let component: EnergyEventTableComponent;
  let fixture: ComponentFixture<EnergyEventTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
