/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EmTaskFeedbackComponent } from './em-task-feedback.component';

describe('EmTaskFeedbackComponent', () => {
  let component: EmTaskFeedbackComponent;
  let fixture: ComponentFixture<EmTaskFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmTaskFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmTaskFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shoud get work detail', () => {
    expect(component.workDetail).toEqual({
      dailyWorkId: 1,
      timeBegin: '09:00',
      timeEnd: '10:00',
      measureName: '环境温度确认',
      description: '每月一次（大概）对机房进行预防式检查'
    })
  });
});
