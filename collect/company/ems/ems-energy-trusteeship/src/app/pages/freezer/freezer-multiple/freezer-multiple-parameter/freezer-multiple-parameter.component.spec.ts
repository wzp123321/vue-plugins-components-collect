import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezerMultipleParameterComponent } from './freezer-multiple-parameter.component';

describe('FreezerMultipleParameterComponent', () => {
  let component: FreezerMultipleParameterComponent;
  let fixture: ComponentFixture<FreezerMultipleParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezerMultipleParameterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezerMultipleParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
