import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExceptionTableComponent } from './exception-table.component';

describe('ExceptionTableComponent', () => {
  let component: ExceptionTableComponent;
  let fixture: ComponentFixture<ExceptionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExceptionTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExceptionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
