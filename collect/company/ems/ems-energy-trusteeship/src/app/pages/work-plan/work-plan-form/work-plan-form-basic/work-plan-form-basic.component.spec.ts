import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanFormBasicComponent } from './work-plan-form-basic.component';

describe('WorkPlanFormBasicComponent', () => {
  let component: WorkPlanFormBasicComponent;
  let fixture: ComponentFixture<WorkPlanFormBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanFormBasicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPlanFormBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
