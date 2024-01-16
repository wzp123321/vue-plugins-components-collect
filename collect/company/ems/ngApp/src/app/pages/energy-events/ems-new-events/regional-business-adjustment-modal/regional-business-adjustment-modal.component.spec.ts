import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionalBusinessAdjustmentModalComponent } from './regional-business-adjustment-modal.component';

describe('RegionalBusinessAdjustmentModalComponent', () => {
  let component: RegionalBusinessAdjustmentModalComponent;
  let fixture: ComponentFixture<RegionalBusinessAdjustmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegionalBusinessAdjustmentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionalBusinessAdjustmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
