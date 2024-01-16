import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerSingleParameterComponent } from './boiler-single-parameter.component';

describe('BoilerSingleParameterComponent', () => {
  let component: BoilerSingleParameterComponent;
  let fixture: ComponentFixture<BoilerSingleParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoilerSingleParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerSingleParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
