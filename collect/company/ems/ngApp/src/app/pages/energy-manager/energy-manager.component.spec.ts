import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyManagerComponent } from './energy-manager.component';

describe('EnergyManagerComponent', () => {
  let component: EnergyManagerComponent;
  let fixture: ComponentFixture<EnergyManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
