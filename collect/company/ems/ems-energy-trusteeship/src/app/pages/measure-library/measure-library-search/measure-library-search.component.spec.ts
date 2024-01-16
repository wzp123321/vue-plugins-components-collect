import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureLibrarySearchComponent } from './measure-library-search.component';

describe('MeasureLibrarySearchComponent', () => {
  let component: MeasureLibrarySearchComponent;
  let fixture: ComponentFixture<MeasureLibrarySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasureLibrarySearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureLibrarySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
