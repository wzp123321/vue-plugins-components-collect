import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryImportErrorListComponent } from './manual-entry-import-error-list.component';

describe('ManualEntryImportErrorListComponent', () => {
  let component: ManualEntryImportErrorListComponent;
  let fixture: ComponentFixture<ManualEntryImportErrorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryImportErrorListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryImportErrorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
