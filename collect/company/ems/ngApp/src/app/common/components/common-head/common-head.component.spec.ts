/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonHeadComponent } from './common-head.component';

describe('CommonHeadComponent', () => {
  let component: CommonHeadComponent;
  let fixture: ComponentFixture<CommonHeadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonHeadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
