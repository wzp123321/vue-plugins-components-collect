import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezerSingleOverviewComponent } from './freezer-single-overview.component';

describe('FreezerSingleOverviewComponent', () => {
  let component: FreezerSingleOverviewComponent;
  let fixture: ComponentFixture<FreezerSingleOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezerSingleOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezerSingleOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
