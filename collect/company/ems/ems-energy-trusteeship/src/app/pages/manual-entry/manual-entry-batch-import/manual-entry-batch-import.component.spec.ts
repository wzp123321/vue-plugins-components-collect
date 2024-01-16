import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryBatchImportComponent } from './manual-entry-batch-import.component';

describe('ManualEntryBatchImportComponent', () => {
  let component: ManualEntryBatchImportComponent;
  let fixture: ComponentFixture<ManualEntryBatchImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryBatchImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryBatchImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
