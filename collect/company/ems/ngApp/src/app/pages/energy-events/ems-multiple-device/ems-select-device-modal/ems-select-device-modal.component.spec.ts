import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsSelectDeviceModalComponent } from './ems-select-device-modal.component';

describe('EmsSelectDeviceModalComponent', () => {
  let component: EmsSelectDeviceModalComponent;
  let fixture: ComponentFixture<EmsSelectDeviceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsSelectDeviceModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsSelectDeviceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
