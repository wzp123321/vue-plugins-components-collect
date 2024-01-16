import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsRadioAreaComponent } from './ems-radio-area.component';

describe('EmsRadioAreaComponent', () => {
  let component: EmsRadioAreaComponent;
  let fixture: ComponentFixture<EmsRadioAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsRadioAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsRadioAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
