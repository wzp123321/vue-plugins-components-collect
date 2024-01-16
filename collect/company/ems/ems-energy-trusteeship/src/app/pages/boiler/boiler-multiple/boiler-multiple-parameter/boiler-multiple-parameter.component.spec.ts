import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerMultipleParameterComponent } from './boiler-multiple-parameter.component';

describe('BoilerMultipleParameterComponent', () => {
  let component: BoilerMultipleParameterComponent;
  let fixture: ComponentFixture<BoilerMultipleParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoilerMultipleParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerMultipleParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
