import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanToolbarComponent } from './work-plan-toolbar.component';

describe('WorkPlanToolbarComponent', () => {
  let component: WorkPlanToolbarComponent;
  let fixture: ComponentFixture<WorkPlanToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPlanToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
