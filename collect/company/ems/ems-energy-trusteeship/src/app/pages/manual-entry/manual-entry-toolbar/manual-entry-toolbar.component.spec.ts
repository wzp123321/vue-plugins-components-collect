import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryToolbarComponent } from './manual-entry-toolbar.component';

describe('ManualEntryToolbarComponent', () => {
  let component: ManualEntryToolbarComponent;
  let fixture: ComponentFixture<ManualEntryToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
