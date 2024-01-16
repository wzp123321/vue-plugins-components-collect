import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyTypeSelectorComponent } from './energy-type-selector.component';

describe('EnergyTypeSelectorComponent', () => {
  let component: EnergyTypeSelectorComponent;
  let fixture: ComponentFixture<EnergyTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyTypeSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
