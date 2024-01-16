import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureLibraryComponent } from './measure-library.component';

describe('MeasureLibraryComponent', () => {
  let component: MeasureLibraryComponent;
  let fixture: ComponentFixture<MeasureLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasureLibraryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
