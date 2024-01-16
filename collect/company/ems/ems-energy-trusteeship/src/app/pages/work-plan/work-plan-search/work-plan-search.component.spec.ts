import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPlanSearchComponent } from './work-plan-search.component';

describe('WorkPlanSearchComponent', () => {
  let component: WorkPlanSearchComponent;
  let fixture: ComponentFixture<WorkPlanSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkPlanSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkPlanSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
