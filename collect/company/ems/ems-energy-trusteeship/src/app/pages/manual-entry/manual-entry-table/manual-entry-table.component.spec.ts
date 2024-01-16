import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryTableComponent } from './manual-entry-table.component';

describe('ManualEntryTableComponent', () => {
  let component: ManualEntryTableComponent;
  let fixture: ComponentFixture<ManualEntryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
