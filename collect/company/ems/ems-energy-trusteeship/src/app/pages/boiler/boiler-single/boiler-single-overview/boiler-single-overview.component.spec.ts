import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerSingleOverviewComponent } from './boiler-single-overview.component';

describe('BoilerSingleOverviewComponent', () => {
  let component: BoilerSingleOverviewComponent;
  let fixture: ComponentFixture<BoilerSingleOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoilerSingleOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerSingleOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
