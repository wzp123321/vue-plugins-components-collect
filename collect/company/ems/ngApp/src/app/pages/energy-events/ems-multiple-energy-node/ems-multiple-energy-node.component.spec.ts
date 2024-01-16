import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsMultipleEnergyNodeComponent } from './ems-multiple-energy-node.component';

describe('EmsMultipleEnergyNodeComponent', () => {
  let component: EmsMultipleEnergyNodeComponent;
  let fixture: ComponentFixture<EmsMultipleEnergyNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsMultipleEnergyNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsMultipleEnergyNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
