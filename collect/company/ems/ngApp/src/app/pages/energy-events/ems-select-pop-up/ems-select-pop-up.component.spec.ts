import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsSelectPopUpComponent } from './ems-select-pop-up.component';

describe('EmsSelectPopUpComponent', () => {
  let component: EmsSelectPopUpComponent;
  let fixture: ComponentFixture<EmsSelectPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsSelectPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsSelectPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
