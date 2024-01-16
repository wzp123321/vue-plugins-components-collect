import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryObjectComponent } from './manual-entry-object.component';

describe('ManualEntryObjectComponent', () => {
  let component: ManualEntryObjectComponent;
  let fixture: ComponentFixture<ManualEntryObjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualEntryObjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualEntryObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
