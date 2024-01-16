import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreezerSingleBenchmarkingComponent } from './freezer-single-benchmarking.component';

describe('FreezerSingleBenchmarkingComponent', () => {
  let component: FreezerSingleBenchmarkingComponent;
  let fixture: ComponentFixture<FreezerSingleBenchmarkingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreezerSingleBenchmarkingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreezerSingleBenchmarkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
