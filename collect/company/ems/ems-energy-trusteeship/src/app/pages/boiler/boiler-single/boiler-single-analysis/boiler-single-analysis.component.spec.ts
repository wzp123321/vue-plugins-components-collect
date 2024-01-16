import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerSingleAnalysisComponent } from './boiler-single-analysis.component';

describe('BoilerSingleAnalysisComponent', () => {
  let component: BoilerSingleAnalysisComponent;
  let fixture: ComponentFixture<BoilerSingleAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoilerSingleAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerSingleAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
