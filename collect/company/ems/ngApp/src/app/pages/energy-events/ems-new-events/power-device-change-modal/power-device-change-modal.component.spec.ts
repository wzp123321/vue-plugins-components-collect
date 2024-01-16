import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PowerDeviceChangeModalComponent } from './power-device-change-modal.component';

describe('PowerDeviceChangeModalComponent', () => {
  let component: PowerDeviceChangeModalComponent;
  let fixture: ComponentFixture<PowerDeviceChangeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PowerDeviceChangeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PowerDeviceChangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
