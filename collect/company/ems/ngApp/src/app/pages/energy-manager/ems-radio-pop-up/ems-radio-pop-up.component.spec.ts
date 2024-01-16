import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsRadioPopUpComponent } from './ems-radio-pop-up.component';

describe('EmsRadioPopUpComponent', () => {
  let component: EmsRadioPopUpComponent;
  let fixture: ComponentFixture<EmsRadioPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsRadioPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsRadioPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
