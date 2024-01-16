import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerSearchComponent } from './boiler-search.component';

describe('BoilerSearchComponent', () => {
  let component: BoilerSearchComponent;
  let fixture: ComponentFixture<BoilerSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoilerSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
