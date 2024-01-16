import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventDetailComponent } from './energy-event-detail.component';

describe('EnergyEventDetailComponent', () => {
  let component: EnergyEventDetailComponent;
  let fixture: ComponentFixture<EnergyEventDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
