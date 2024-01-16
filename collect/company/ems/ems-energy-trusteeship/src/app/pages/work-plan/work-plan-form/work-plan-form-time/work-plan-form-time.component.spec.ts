import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanFormTimeComponent } from './work-plan-form-time.component';

describe('WorkPlanFormTimeComponent', () => {
  let component: WorkPlanFormTimeComponent;
  let fixture: ComponentFixture<WorkPlanFormTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanFormTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPlanFormTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
