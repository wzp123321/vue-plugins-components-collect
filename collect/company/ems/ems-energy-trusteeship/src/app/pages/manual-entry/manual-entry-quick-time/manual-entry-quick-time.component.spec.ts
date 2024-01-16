import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryQuickTimeComponent } from './manual-entry-quick-time.component';

describe('ManualEntryQuickTimeComponent', () => {
  let component: ManualEntryQuickTimeComponent;
  let fixture: ComponentFixture<ManualEntryQuickTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryQuickTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryQuickTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
