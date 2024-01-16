import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerSingleBenchmarkingComponent } from './boiler-single-benchmarking.component';

describe('BoilerSingleBenchmarkingComponent', () => {
  let component: BoilerSingleBenchmarkingComponent;
  let fixture: ComponentFixture<BoilerSingleBenchmarkingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoilerSingleBenchmarkingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerSingleBenchmarkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
