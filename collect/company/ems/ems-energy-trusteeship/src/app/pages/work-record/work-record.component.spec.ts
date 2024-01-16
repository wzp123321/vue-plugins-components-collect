import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkRecordComponent } from './work-record.component';

describe('WorkRecordComponent', () => {
  let component: WorkRecordComponent;
  let fixture: ComponentFixture<WorkRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
