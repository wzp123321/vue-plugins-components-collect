import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryNoDataComponent } from './manual-entry-no-data.component';

describe('ManualEntryNoDataComponent', () => {
  let component: ManualEntryNoDataComponent;
  let fixture: ComponentFixture<ManualEntryNoDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryNoDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryNoDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
