import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryFormComponent } from './manual-entry-form.component';

describe('ManualEntryFormComponent', () => {
  let component: ManualEntryFormComponent;
  let fixture: ComponentFixture<ManualEntryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
