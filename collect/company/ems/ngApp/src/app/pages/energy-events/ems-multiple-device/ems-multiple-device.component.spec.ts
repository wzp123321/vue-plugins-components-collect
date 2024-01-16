import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsMultipleDeviceComponent } from './ems-multiple-device.component';

describe('EmsMultipleDeviceComponent', () => {
  let component: EmsMultipleDeviceComponent;
  let fixture: ComponentFixture<EmsMultipleDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsMultipleDeviceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsMultipleDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
