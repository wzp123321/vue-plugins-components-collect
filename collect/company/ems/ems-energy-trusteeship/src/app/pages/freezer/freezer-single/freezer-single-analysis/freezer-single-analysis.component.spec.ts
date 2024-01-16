import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezerSingleAnalysisComponent } from './freezer-single-analysis.component';

describe('FreezerSingleAnalysisComponent', () => {
  let component: FreezerSingleAnalysisComponent;
  let fixture: ComponentFixture<FreezerSingleAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezerSingleAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezerSingleAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
