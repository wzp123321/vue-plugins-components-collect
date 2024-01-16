import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezerSingleParameterComponent } from './freezer-single-parameter.component';

describe('FreezerSingleParameterComponent', () => {
  let component: FreezerSingleParameterComponent;
  let fixture: ComponentFixture<FreezerSingleParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezerSingleParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezerSingleParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
