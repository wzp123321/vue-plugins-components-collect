/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EmEncourageComponent } from './em-encourage.component';

describe('EmEncourageComponent', () => {
  let component: EmEncourageComponent;
  let fixture: ComponentFixture<EmEncourageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmEncourageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmEncourageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
