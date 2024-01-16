import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureLibraryTableComponent } from './measure-library-table.component';

describe('MeasureLibraryTableComponent', () => {
  let component: MeasureLibraryTableComponent;
  let fixture: ComponentFixture<MeasureLibraryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasureLibraryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureLibraryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
