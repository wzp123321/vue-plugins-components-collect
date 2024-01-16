import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntrySearchComponent } from './manual-entry-search.component';

describe('ManualEntrySearchComponent', () => {
  let component: ManualEntrySearchComponent;
  let fixture: ComponentFixture<ManualEntrySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntrySearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntrySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
