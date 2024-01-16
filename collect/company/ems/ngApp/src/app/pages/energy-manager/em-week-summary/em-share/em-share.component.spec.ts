/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EmShareComponent } from './em-share.component';

describe('EmShareComponent', () => {
  let component: EmShareComponent;
  let fixture: ComponentFixture<EmShareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmShareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
