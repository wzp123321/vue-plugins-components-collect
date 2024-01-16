import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanTableComponent } from './work-plan-table.component';

describe('WorkPlanTableComponent', () => {
  let component: WorkPlanTableComponent;
  let fixture: ComponentFixture<WorkPlanTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPlanTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
