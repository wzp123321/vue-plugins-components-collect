import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventSearchComponent } from './energy-event-search.component';

describe('EnergyEventSearchComponent', () => {
  let component: EnergyEventSearchComponent;
  let fixture: ComponentFixture<EnergyEventSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
