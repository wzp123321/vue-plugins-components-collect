import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerMultipleAnalysisComponent } from './boiler-multiple-analysis.component';

describe('BoilerMultipleAnalysisComponent', () => {
  let component: BoilerMultipleAnalysisComponent;
  let fixture: ComponentFixture<BoilerMultipleAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoilerMultipleAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerMultipleAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
