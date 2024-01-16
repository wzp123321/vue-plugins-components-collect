import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezerMultipleAnalysisComponent } from './freezer-multiple-analysis.component';

describe('FreezerMultipleAnalysisComponent', () => {
  let component: FreezerMultipleAnalysisComponent;
  let fixture: ComponentFixture<FreezerMultipleAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezerMultipleAnalysisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezerMultipleAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
