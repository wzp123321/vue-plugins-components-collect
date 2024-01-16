import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkRecordListComponent } from './work-record-list.component';

describe('WorkRecordListComponent', () => {
  let component: WorkRecordListComponent;
  let fixture: ComponentFixture<WorkRecordListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkRecordListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkRecordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
