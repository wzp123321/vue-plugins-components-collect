import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanFormDetailComponent } from './work-plan-form-detail.component';

describe('WorkPlanFormDetailComponent', () => {
  let component: WorkPlanFormDetailComponent;
  let fixture: ComponentFixture<WorkPlanFormDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanFormDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPlanFormDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
