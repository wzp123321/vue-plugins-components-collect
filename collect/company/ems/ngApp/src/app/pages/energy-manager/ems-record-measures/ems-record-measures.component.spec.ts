import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmsRecordMeasuresComponent } from './ems-record-measures.component';

describe('EmsRecordMeasuresComponent', () => {
  let component: EmsRecordMeasuresComponent;
  let fixture: ComponentFixture<EmsRecordMeasuresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmsRecordMeasuresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmsRecordMeasuresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
