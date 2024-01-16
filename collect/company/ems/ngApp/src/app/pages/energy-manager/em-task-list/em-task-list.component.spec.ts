import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmTaskListComponent } from './em-task-list.component';

describe('EmTaskListComponent', () => {
  let component: EmTaskListComponent;
  let fixture: ComponentFixture<EmTaskListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmTaskListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
