import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasureLibraryFormComponent } from './measure-library-form.component';

describe('MeasureLibraryFormComponent', () => {
  let component: MeasureLibraryFormComponent;
  let fixture: ComponentFixture<MeasureLibraryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeasureLibraryFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasureLibraryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
