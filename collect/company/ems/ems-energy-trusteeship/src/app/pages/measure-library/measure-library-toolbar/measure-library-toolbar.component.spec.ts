import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureLibraryToolbarComponent } from './measure-library-toolbar.component';

describe('MeasureLibraryToolbarComponent', () => {
  let component: MeasureLibraryToolbarComponent;
  let fixture: ComponentFixture<MeasureLibraryToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasureLibraryToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureLibraryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
