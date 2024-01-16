import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyEventCardsComponent } from './energy-event-cards.component';

describe('EnergyEventCardsComponent', () => {
  let component: EnergyEventCardsComponent;
  let fixture: ComponentFixture<EnergyEventCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnergyEventCardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyEventCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
